#!/usr/bin/env python3
"""
Enhanced Coach Upload Script with Proper Sports Mapping
This script extracts coach data from PDFs and creates unclaimed profiles in Firebase
with proper sports categorization based on role descriptions.
"""

import pdfplumber
import firebase_admin
from firebase_admin import credentials, firestore
import re
import sys
import argparse
from typing import List, Dict, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Sports mapping dictionary - maps keywords in role descriptions to standardized sports
SPORTS_MAPPING = {
    'basketball': 'Basketball',
    'soccer': 'Soccer', 
    'football': 'Football',
    'tennis': 'Tennis',
    'swimming': 'Swimming',
    'swim': 'Swimming',
    'baseball': 'Baseball',
    'volleyball': 'Volleyball',
    'golf': 'Golf',
    'track': 'Track & Field',
    'field': 'Track & Field',
    'track and field': 'Track & Field',
    'gymnastics': 'Gymnastics',
    'wrestling': 'Wrestling',
    'boxing': 'Boxing',
    'martial arts': 'Martial Arts',
    'karate': 'Martial Arts',
    'judo': 'Martial Arts',
    'taekwondo': 'Martial Arts',
    'hockey': 'Hockey',
    'lacrosse': 'Lacrosse',
    'softball': 'Softball',
    'cricket': 'Cricket',
    'mma': 'MMA',
    'fitness': 'Fitness Training',
    'personal training': 'Personal Training',
    'strength': 'Fitness Training',
    'conditioning': 'Fitness Training',
    'yoga': 'Yoga',
    'pilates': 'Pilates',
    'crossfit': 'CrossFit',
    'weight': 'Fitness Training',
    'trainer': 'Personal Training',
    'athletic director': 'General Coaching',
    'assistant coach': 'General Coaching',
    'head coach': 'General Coaching'
}

def extract_sports_from_role(role_description: str) -> List[str]:
    """
    Extract sports from role description
    
    Args:
        role_description: The role/title description from PDF
        
    Returns:
        List of standardized sport names
    """
    if not role_description:
        return ['General Coaching']
    
    sports = []
    role_lower = role_description.lower()
    
    # Check for each sport in the role description
    for keyword, sport_name in SPORTS_MAPPING.items():
        if keyword in role_lower:
            if sport_name not in sports:
                sports.append(sport_name)
    
    # Special cases for compound roles
    if 'track' in role_lower and 'field' in role_lower:
        if 'Track & Field' not in sports:
            sports = [s for s in sports if s != 'Track & Field']  # Remove duplicates
            sports.append('Track & Field')
    
    # If no specific sport found, default to General Coaching
    if not sports:
        sports = ['General Coaching']
    
    logger.info(f"Role: '{role_description}' → Sports: {sports}")
    return sports

def extract_email(text: str) -> Optional[str]:
    """Extract email address from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None

def extract_phone(text: str) -> Optional[str]:
    """Extract and format phone number"""
    # Look for various phone number patterns
    phone_patterns = [
        r'\((\d{3})\)\s*(\d{3})-?(\d{4})',  # (123) 456-7890
        r'(\d{3})-(\d{3})-(\d{4})',         # 123-456-7890
        r'(\d{3})\.(\d{3})\.(\d{4})',       # 123.456.7890
        r'(\d{3})\s+(\d{3})\s+(\d{4})',     # 123 456 7890
    ]
    
    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            if len(match.groups()) == 3:
                return f"({match.group(1)}) {match.group(2)}-{match.group(3)}"
    
    return None

def extract_name(text: str) -> Optional[str]:
    """Extract name from text - assumes name comes first"""
    # Remove common prefixes and clean up
    text = re.sub(r'^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+', '', text, flags=re.IGNORECASE)
    
    # Look for name pattern (2-4 words, starting with capital letters)
    name_pattern = r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})'
    match = re.match(name_pattern, text.strip())
    
    return match.group(1) if match else None

def generate_username(name: str) -> str:
    """Generate username from name"""
    if not name:
        return f"coach_{int(time.time())}"
    
    # Take first name and last name, lowercase, remove spaces
    parts = name.split()
    if len(parts) >= 2:
        return f"{parts[0].lower()}{parts[-1].lower()}"
    else:
        return parts[0].lower()

def parse_coach_line(line: str) -> Optional[Dict]:
    """Parse a single line to extract coach information"""
    # Skip lines that don't contain "coach" (case insensitive)
    if 'coach' not in line.lower():
        return None
    
    # Extract information
    name = extract_name(line)
    email = extract_email(line)
    phone = extract_phone(line)
    
    if not name:
        logger.warning(f"Could not extract name from line: {line}")
        return None
    
    # Extract role (everything that contains "coach" or related terms)
    role_patterns = [
        r'([^,\n]*coach[^,\n]*)',
        r'([^,\n]*director[^,\n]*)',
        r'([^,\n]*instructor[^,\n]*)',
        r'([^,\n]*trainer[^,\n]*)'
    ]
    
    role = None
    for pattern in role_patterns:
        match = re.search(pattern, line, re.IGNORECASE)
        if match:
            role = match.group(1).strip()
            break
    
    if not role:
        role = "Coach"  # Default role
    
    # Extract sports from role
    sports = extract_sports_from_role(role)
    
    # Generate username
    username = generate_username(name)
    
    # Create bio
    primary_sport = sports[0] if sports else 'coaching'
    bio = f"Experienced {role.lower()} specializing in {primary_sport.lower()}."
    
    return {
        'username': username,
        'displayName': name,
        'email': email,
        'phoneNumber': phone,
        'role': role,
        'sports': sports,
        'bio': bio
    }

def upload_coach_to_firebase(coach_data: Dict, db) -> bool:
    """Upload a single coach to Firebase"""
    try:
        coach_ref = db.collection('coaches').document(coach_data['username'])
        
        # Check if coach already exists
        if coach_ref.get().exists:
            logger.warning(f"Coach {coach_data['username']} already exists, skipping...")
            return False
        
        # Create complete coach profile
        complete_profile = {
            'userId': None,  # Will be set when claimed
            'username': coach_data['username'],
            'displayName': coach_data['displayName'],
            'email': coach_data['email'],
            'phoneNumber': coach_data.get('phoneNumber', ''),
            'bio': coach_data['bio'],
            'sports': coach_data['sports'],
            'role': coach_data['role'],
            'organization': 'Imported from PDF',
            'location': 'Not specified',
            'experience': 5,  # Default experience
            'certifications': [],
            'hourlyRate': 0,  # Price on request
            'availability': [],
            'specialties': coach_data['sports'],  # Use sports as specialties
            'languages': ['English'],
            'gender': '',
            'ageGroup': [],
            'sourceUrl': '',
            'averageRating': 0,
            'totalReviews': 0,
            'isVerified': False,
            'isClaimed': False,  # Key field for claiming system
            'claimedAt': None,
            'verificationStatus': 'pending',
            'profileImage': '',
            'website': '',
            'socialMedia': {
                'instagram': '',
                'twitter': '',
                'linkedin': ''
            },
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'profileCompleted': True,
            'importedFromPDF': True
        }
        
        coach_ref.set(complete_profile)
        logger.info(f"✅ Uploaded coach: {coach_data['displayName']} ({coach_data['sports']})")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error uploading coach {coach_data['displayName']}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Upload coaches from PDF to Firebase')
    parser.add_argument('--pdf', required=True, help='Path to PDF file')
    parser.add_argument('--key', required=True, help='Path to Firebase service account key')
    parser.add_argument('--dry-run', action='store_true', help='Parse PDF without uploading to Firebase')
    
    args = parser.parse_args()
    
    # Initialize Firebase (unless dry run)
    db = None
    if not args.dry_run:
        try:
            cred = credentials.Certificate(args.key)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            logger.info("🔥 Firebase initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Firebase: {e}")
            return
    
    # Parse PDF
    try:
        logger.info(f"📖 Parsing PDF: {args.pdf}")
        coaches = []
        
        with pdfplumber.open(args.pdf) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() + "\n"
        
        # Process each line
        lines = full_text.split('\n')
        logger.info(f"📄 Processing {len(lines)} lines from PDF")
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                continue
                
            coach_data = parse_coach_line(line)
            if coach_data:
                coaches.append(coach_data)
                logger.info(f"📝 Line {line_num}: Found coach - {coach_data['displayName']}")
        
        logger.info(f"🎯 Found {len(coaches)} coaches total")
        
        # Upload to Firebase (unless dry run)
        if not args.dry_run and db:
            uploaded_count = 0
            for coach in coaches:
                if upload_coach_to_firebase(coach, db):
                    uploaded_count += 1
            
            logger.info(f"🚀 Successfully uploaded {uploaded_count}/{len(coaches)} coaches")
        else:
            logger.info("🏃 Dry run completed - no data uploaded")
            for coach in coaches:
                print(f"Would upload: {coach['displayName']} - {coach['sports']}")
                
    except Exception as e:
        logger.error(f"❌ Error processing PDF: {e}")

if __name__ == "__main__":
    import time
    main()