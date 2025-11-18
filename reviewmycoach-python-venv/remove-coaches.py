import argparse
import re
import pdfplumber
import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime

def extract_and_format_phone(line, area_code):
    """
    Extract phone number from line and format with area code if needed.
    (Same as upload-coaches.py for consistency)
    """
    # Phone number patterns
    phone_patterns = [
        r'\(\d{3}\)\s*\d{3}-\d{4}',      # (856) 256-4687
        r'\(\d{3}\)\s*\d{3}\.\d{4}',      # (856) 256.4687
        r'\d{3}-\d{3}-\d{4}',             # 856-256-4687
        r'\d{3}\.\d{3}\.\d{4}',           # 856.256.4687
        r'\d{3}\s+\d{3}-\d{4}',           # 856 256-4687
        r'\d{3}-\d{4}',                   # 256-4687 (7-digit)
        r'\d{3}\.\d{4}',                  # 256.4687 (7-digit)
        r'\b\d{7}\b'                      # 2564687 (7-digit no separator)
    ]
    
    for pattern in phone_patterns:
        match = re.search(pattern, line)
        if match:
            phone = match.group().strip()
            
            # If it's a 7-digit number and we have an area code, add it
            if area_code and (re.match(r'^\d{3}-\d{4}$', phone) or 
                             re.match(r'^\d{3}\.\d{4}$', phone) or 
                             re.match(r'^\d{7}$', phone)):
                if re.match(r'^\d{7}$', phone):
                    # Format 7-digit number with dash
                    phone = phone[:3] + '-' + phone[3:]
                
                return f"({area_code}) {phone}"
            
            # If it already has area code, clean up format
            elif re.match(r'^\d{3}-\d{3}-\d{4}$', phone):
                area = phone[:3]
                number = phone[4:]
                return f"({area}) {number}"
            
            elif re.match(r'^\d{3}\s+\d{3}-\d{4}$', phone):
                parts = phone.split()
                area = parts[0]
                number = parts[1]
                return f"({area}) {number}"
            
            # Return as-is if already well formatted
            elif re.match(r'^\(\d{3}\)', phone):
                return phone
            
            # For other formats, return as-is
            else:
                return phone
    
    return None

def parse_pdf_for_removal(path):
    """
    Extract coach data from PDF that matches what was uploaded.
    Uses the same multi-line parsing logic as upload-coaches.py
    """
    coaches_to_remove = []
    area_code = None
    
    # Check if file is a text file (for testing) or PDF
    if path.lower().endswith('.txt'):
        print(f"📝 Processing text file: {path}")
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        print(f"📄 Processing PDF file: {path}")
        with pdfplumber.open(path) as pdf:
            text = "\n".join(
                page.extract_text() 
                for page in pdf.pages 
                if page.extract_text()
            )

    # Extract area code from the text
    area_code_patterns = [
        r'Area Code \((\d{3})\)',
        r'Area Code: \((\d{3})\)',
        r'Area Code (\d{3})',
        r'Area Code: (\d{3})',
        r'\((\d{3})\) area code'
    ]
    
    for pattern in area_code_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            area_code = match.group(1)
            print(f"📞 Detected area code: ({area_code})")
            break
    
    if not area_code:
        print("⚠️  No area code detected - phone numbers will remain as-is")

    lines = text.splitlines()
    
    # Use multi-line format parsing (same as upload script)
    for i, line in enumerate(lines):
        # Look for email addresses
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
        if not email_match:
            continue
        
        email = email_match.group()
        username = email.split("@", 1)[0]
        
        # Look backwards for coach title and name
        coach_title = ""
        coach_name = ""
        phone_number = None
        
        # Check previous lines for coach title and name
        for j in range(1, 4):  # Look back up to 3 lines
            if i - j < 0:
                break
            prev_line = lines[i - j].strip()
            
            # Check if this line contains "coach"
            if "coach" in prev_line.lower() and not coach_title:
                coach_title = prev_line
                
                # The name should be the line immediately before the coach title
                if i - j - 1 >= 0:
                    potential_name_line = lines[i - j - 1].strip()
                    # Make sure it's not an email, header, or other metadata
                    if (potential_name_line and 
                        not re.search(r'[\w\.-]+@[\w\.-]+\.\w+', potential_name_line) and
                        not any(keyword in potential_name_line.lower() for keyword in 
                               ['coaching', 'staff', 'soccer', 'university', '2025', '/', 'pm', 'am', 'director of']) and
                        len(potential_name_line.split()) >= 2):  # Require at least first and last name
                        coach_name = potential_name_line
                break  # Stop once we find the coach title
        
        # Check following lines for phone number
        for j in range(1, 3):  # Look ahead up to 2 lines
            if i + j >= len(lines):
                break
            next_line = lines[i + j].strip()
            phone_number = extract_and_format_phone(next_line, area_code)
            if phone_number:
                break
        
        # Only create entry if we found a coach title
        if coach_title and "coach" in coach_title.lower():
            # Parse name
            name_tokens = coach_name.split() if coach_name else []
            
            # Drop common prefixes
            if name_tokens and name_tokens[0].lower() in ("dr.", "dr"):
                name_tokens = name_tokens[1:]
            
            first_name = name_tokens[0] if name_tokens else ""
            last_name = " ".join(name_tokens[1:]) if len(name_tokens) > 1 else ""
            
            coach_data = {
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "username": username,
                "role": coach_title if coach_title else "coach",
                "full_line": f"{coach_name} {coach_title} {email}".strip()
            }
            
            if phone_number:
                coach_data["phone"] = phone_number
            
            coaches_to_remove.append(coach_data)
    
    return coaches_to_remove

def remove_coaches_from_firestore(coaches_to_remove, key_path, collection='coaches', dry_run=False):
    """
    Remove coach profiles from Firestore based on username/email.
    """
    if dry_run:
        print("DRY RUN MODE - No actual removal from Firestore")
        for coach in coaches_to_remove:
            print(f"[DRY RUN] Would remove coach: {coach['first_name']} {coach['last_name']} ({coach['email']}) → coaches/{coach['username']}")
        return

    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    removed_count = 0
    not_found_count = 0
    errors = []

    for coach in coaches_to_remove:
        try:
            username = coach['username']
            email = coach['email']
            
            # Check if coach profile exists
            coach_ref = db.collection('coaches').document(username)
            coach_doc = coach_ref.get()
            
            if not coach_doc.exists:
                print(f"⏭️  Coach not found: {coach['first_name']} {coach['last_name']} ({email}) → coaches/{username}")
                not_found_count += 1
                continue
            
            # Verify it's the same coach by checking email
            coach_data = coach_doc.to_dict()
            if coach_data.get('email') != email:
                print(f"⚠️  Email mismatch for {username}: expected {email}, found {coach_data.get('email', 'N/A')}")
                continue
            
            # Delete the coach profile
            coach_ref.delete()
            
            print(f"🗑️  Removed coach: {coach['first_name']} {coach['last_name']} ({email}) → coaches/{username}")
            removed_count += 1
            
        except Exception as error:
            error_msg = f"❌ Error removing {coach['email']}: {error}"
            print(error_msg)
            errors.append(error_msg)
    
    print(f"\n📊 Removal Summary:")
    print(f"🗑️  {removed_count} coach profiles removed")
    print(f"⏭️  {not_found_count} profiles not found (may have been already removed)")
    if errors:
        print(f"❌ {len(errors)} errors occurred")
        for error in errors:
            print(f"   {error}")

def main():
    parser = argparse.ArgumentParser(
        description="Remove coaches from Firestore based on PDF data (reverse of upload-coaches.py)"
    )
    parser.add_argument("--pdf", default="pdfs/Men's Soccer Coaches - Bryant University.pdf", 
                       help="Path to the PDF file used for original upload")
    parser.add_argument("--key", help="Path to Firebase Admin JSON key (required for actual removal)")
    parser.add_argument("--collection", default="coaches",
                       help="Firestore collection to remove documents from (default: coaches)")
    parser.add_argument("--dry-run", action="store_true",
                       help="Show what would be removed without actually removing from Firestore")
    
    args = parser.parse_args()

    coaches_to_remove = parse_pdf_for_removal(args.pdf)
    print(f"Found {len(coaches_to_remove)} coach entries to remove (from PDF).")
    
    if len(coaches_to_remove) == 0:
        print("No coach entries found in the PDF.")
        return
    
    # Remove from Firestore if not dry run and key is provided
    if not args.dry_run and args.key:
        remove_coaches_from_firestore(coaches_to_remove, args.key, args.collection)
    elif args.dry_run:
        remove_coaches_from_firestore(coaches_to_remove, None, args.collection, dry_run=True)
    elif not args.key:
        print("No Firebase key provided - run with --key path/to/firebase-key.json to remove coaches")
        print("Or use --dry-run to see what would be removed")

if __name__ == "__main__":
    main()