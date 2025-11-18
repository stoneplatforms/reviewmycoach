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

def detect_pdf_info(path, text_content):
    """
    Detect university and organization information from PDF path and content.
    """
    pdf_info = {
        'university': '',
        'organization': '',
        'location': '',
        'source': '',
        'state': ''
    }
    
    # Analyze filename
    filename = os.path.basename(path).lower()
    
    if 'bryant' in filename:
        pdf_info['university'] = 'Bryant'
        pdf_info['organization'] = 'Bryant University Athletics'
        pdf_info['location'] = 'Smithfield, Rhode Island'
        pdf_info['source'] = 'Bryant University Men\'s Soccer Coaches Directory'
    elif 'rowan' in filename:
        pdf_info['university'] = 'Rowan'
        pdf_info['organization'] = 'Rowan University Athletics'
        pdf_info['location'] = 'Glassboro, New Jersey'
        pdf_info['source'] = 'Rowan University Athletics Staff Directory'
    elif 'rutgers' in filename:
        pdf_info['university'] = 'Rutgers'
        pdf_info['organization'] = 'Rutgers University Athletics'
        pdf_info['location'] = 'Piscataway, New Jersey'
        pdf_info['source'] = 'Rutgers University Athletics Staff Directory'
    
    # Infer state from folder path
    lowered_path = path.lower()
    if '/pdfs/ny' in lowered_path or '\\pdfs\\ny' in lowered_path:
        pdf_info['state'] = 'New York'
    elif '/pdfs/nj' in lowered_path or '\\pdfs\\nj' in lowered_path:
        pdf_info['state'] = 'New Jersey'
    elif '/pdfs/az' in lowered_path or '\\pdfs\\az' in lowered_path:
        pdf_info['state'] = 'Arizona'

    # Analyze content for additional context
    content_lower = text_content.lower()
    if 'bryant university' in content_lower:
        pdf_info['university'] = 'Bryant'
        if not pdf_info['organization']:
            pdf_info['organization'] = 'Bryant University Athletics'
            pdf_info['location'] = 'Smithfield, Rhode Island'
    elif 'rowan university' in content_lower:
        pdf_info['university'] = 'Rowan'
        if not pdf_info['organization']:
            pdf_info['organization'] = 'Rowan University Athletics'
            pdf_info['location'] = 'Glassboro, New Jersey'
    elif 'rutgers university' in content_lower or 'scarlet knights' in content_lower:
        pdf_info['university'] = 'Rutgers'
        if not pdf_info['organization']:
            pdf_info['organization'] = 'Rutgers University Athletics'
            pdf_info['location'] = 'Piscataway, New Jersey'
    
    # Generic university detection from prominent lines
    if not pdf_info['university']:
        # Look for lines with University/College/Academy/Institute/School early in the doc
        lines = [ln.strip() for ln in text_content.splitlines() if ln and len(ln.strip()) > 2]
        candidates = []
        for ln in lines[:200]:
            if re.search(r"\b(University|College|Academy|Institute|School)\b", ln, flags=re.IGNORECASE):
                # Avoid overly generic headers
                if not re.search(r"(?i)staff|directory|athletics", ln):
                    candidates.append(ln)
        if candidates:
            # Prefer the shortest reasonable candidate (less clutter)
            pdf_info['university'] = min(candidates, key=lambda s: len(s))
    return pdf_info

def infer_org_from_filename(path: str):
    base = os.path.splitext(os.path.basename(path))[0]
    # Prefer the segment after " - " if present (e.g., "Staff Directory - Camden County College")
    if " - " in base:
        candidate = base.split(" - ", 1)[1].strip()
    else:
        candidate = base
    # Remove generic words
    candidate = re.sub(r"(?i)\b(staff\s+directory|directory|athletics|athletic\s+staff|staff)\b", "", candidate).strip()
    candidate = re.sub(r"\s{2,}", " ", candidate)
    # Title case
    if candidate:
        return candidate
    return ""

def build_username_from_name(first_name: str, last_name: str):
    fn = (first_name or "").strip().lower()
    ln = (last_name or "").strip().lower()
    def clean(s):
        return re.sub(r"[^a-z0-9]+", ".", s).strip(".")
    if fn or ln:
        return ".".join([p for p in [clean(fn), clean(ln)] if p])
    return ""

def parse_pdf(path, output_txt=None):
    """
    Extract lines with emails from PDF and parse first/last names + username.
    Filter for entries that contain 'coach' in their title/line.
    Also supports text files for testing purposes.
    Detects area codes and adds them to phone numbers.
    
    Handles both single-line format (Rowan) and multi-line format (Bryant):
    - Single-line: "Name Title Coach email@domain.com phone"
    - Multi-line: Name on one line, Title with "Coach" on next, email on following line
    """
    entries = []
    all_lines = []  # Store all lines for txt output
    area_code = None  # Store detected area code
    
    # Check if file is a text file (for testing) or PDF
    if path.lower().endswith('.txt'):
        # Handle text file for testing
        print(f"📝 Processing text file: {path}")
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        # Handle PDF file
        print(f"📄 Processing PDF file: {path}")
        with pdfplumber.open(path) as pdf:
            text = "\n".join(
                page.extract_text() 
                for page in pdf.pages 
                if page.extract_text()
            )

    # Extract area code from the text (Rhode Island commonly uses 401)
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

    # Detect PDF information for organization data
    pdf_info = detect_pdf_info(path, text)
    # If organization is still empty, infer from filename
    if not pdf_info.get('organization'):
        inferred = infer_org_from_filename(path)
        if inferred:
            pdf_info['organization'] = f"{inferred} Athletics" if 'athletic' not in inferred.lower() else inferred
            # If university name empty, set to inferred
            if not pdf_info.get('university'):
                pdf_info['university'] = inferred
    print(f"🏫 Detected organization: {pdf_info.get('organization', 'Unknown')}")

    lines = text.splitlines()
    
    def extract_coach_title(s: str) -> str:
        s_low = s.lower()
        if "coach" not in s_low:
            return ""
        # Remove emails to avoid capturing local-part tokens after 'coach'
        s_wo_email = re.sub(r"\b[\w\.-]+@[\w\.-]+\.[A-Za-z]{2,}\b", "", s)
        # Common role phrases preceding/following 'coach'
        title_patterns = [
            r"(head\s+coach[ A-Za-z\s/&-]*)",
            r"(associate\s+(head\s+)?coach[ A-Za-z\s/&-]*)",
            r"(assistant\s+(head\s+)?coach[ A-Za-z\s/&-]*)",
            r"([A-Za-z\s/&-]*?\bcoach\b[ A-Za-z\s/&-]*)",
            r"([A-Za-z\s/&-]*coordinator[ A-Za-z\s/&-]*)",
        ]
        for pat in title_patterns:
            m = re.search(pat, s_wo_email, flags=re.IGNORECASE)
            if m:
                cand = m.group(1).strip()
                # Remove trailing personal name after 'coach' at end of string (e.g., 'Head Coach John Doe' → 'Head Coach')
                cand = re.sub(r"(\bcoach\b)\s+[A-Z][A-Za-z’'\-]+(?:\s+[A-Z][A-Za-z’'\-]+){0,2}\s*$", r"\1", cand, flags=re.IGNORECASE)
                return cand.strip()
        return "coach"

    def derive_title_from_namepart(name_part: str, first_name: str, last_name: str) -> str:
        s = (name_part or "").strip()
        # Drop common prefixes and the detected name from the front
        prefixes = ["dr.", "dr", "mr.", "mr", "ms.", "ms", "mrs.", "mrs"]
        tokens = s.split()
        # Remove leading prefixes
        while tokens and tokens[0].lower() in prefixes:
            tokens = tokens[1:]
        # Remove first and last name if they appear at the start
        if tokens and first_name and tokens[0].lower() == first_name.lower():
            tokens = tokens[1:]
        if tokens and last_name and tokens[0].lower() == last_name.lower():
            tokens = tokens[1:]
        cleaned = " ".join(tokens).strip().lstrip("-—–,:").strip()
        # If cleaned still doesn't include 'coach', try generic extractor on original
        if "coach" not in cleaned.lower():
            cleaned = extract_coach_title(s)
        # Capitalize nicely
        return cleaned.strip()

    def normalize_title(title_candidate: str, context_text: str = "") -> str:
        """
        Normalize ambiguous titles per rule:
        - If explicit title contains 'coach', keep it.
        - Else if the context mentions the standalone word 'Head', return 'Head Coach'.
        - Otherwise default to 'Assistant Coach'.
        """
        t = (title_candidate or "").strip()
        if t and ("coach" in t.lower()):
            return t
        if re.search(r"\bhead\b", (context_text or ""), flags=re.IGNORECASE):
            return "Head Coach"
        return "Assistant Coach"

    def strip_name_from_title(title_text: str, first_name: str, last_name: str) -> str:
        """
        Remove occurrences of the coach's name tokens from the title string.
        """
        t = (title_text or "").strip()
        if not t:
            return t
        # Build patterns to remove first, last, and full name cases (case-insensitive, word-bound)
        patterns = []
        if first_name:
            patterns.append(rf"\b{re.escape(first_name)}\b")
        if last_name:
            patterns.append(rf"\b{re.escape(last_name)}\b")
        if first_name and last_name:
            patterns.append(rf"\b{re.escape(first_name)}\s+{re.escape(last_name)}\b")
            patterns.append(rf"\b{re.escape(last_name)}\s+{re.escape(first_name)}\b")
        # Apply removals
        for pat in patterns:
            t = re.sub(pat, "", t, flags=re.IGNORECASE)
        # Collapse extra spaces and punctuation left behind
        t = re.sub(r"\s{2,}", " ", t).strip(" -—–,:\t\n")
        return t.strip()

    def clean_title_text(title_text: str) -> str:
        """Remove phone numbers and numeric fragments from title text; trim whitespace/punct."""
        if not title_text:
            return title_text
        t = title_text
        # Remove common phone patterns
        t = re.sub(r"\(\d{3}\)\s*\d{3}[-\.]\d{4}", "", t)
        t = re.sub(r"\b\d{3}[-\.]\d{3}[-\.]\d{4}\b", "", t)
        t = re.sub(r"\b\d{3}[-\.]\d{4}\b", "", t)
        t = re.sub(r"\b\d{3}[-\.]\b", "", t)
        # Remove stray digits at end or within
        t = re.sub(r"[\s\-–,:]*\b\d{2,}\b.*$", "", t)
        # Collapse spaces and clean punctuation
        t = re.sub(r"\s{2,}", " ", t).strip(" -—–,:\t\n")
        return t.strip()

    def clean_name_tokens(name_text: str):
        txt = (name_text or "").strip()
        tokens = txt.split()
        cleaned = []
        stopwords = {
            "and","of","the","dept","department","athletics","athletic","recreation","business","health","trainer",
            "performance","strength","conditioning","manager","representative","advisor","associate","assistant","head",
            "coach","coaching","coaches","coordinator","director","offensive","defensive","women","women's","men","men's","club","ext",
            "sr","jr","ii","iii","iv","senior","junior","admin","administrative",
            # sports/common program words to avoid in names
            "baseball","basketball","soccer","football","swimming","diving","volleyball","lacrosse","track","cross",
            "country","cross-country","field","field","field-hockey","fieldhockey","softball","tennis","golf","wrestling",
            "hockey","rowing","cheer","cheerleading","stunt","esports","bowling","fencing","gymnastics","rowing",
            # generic headers that should never be names
            "staff","coachng","directory","university","college"
        }
        role_substrings = [
            "coach", "assistant", "associate", "head", "recruit", "recruiting", "recruiter",
            "coordinator", "director", "manager", "strength", "conditioning", "athletic",
            "operations", "performance"
        ]
        for t in tokens:
            t_stripped = t.strip(",.:;|/()&[]{}-—–")
            if not t_stripped:
                continue
            if any(ch.isdigit() for ch in t_stripped):
                continue
            if '@' in t_stripped:
                continue
            low = t_stripped.lower()
            # remove if token equals a stopword (men, women's, etc.)
            if low in stopwords:
                continue
            # remove if token contains role-like substrings (e.g., 'Coach-Men's', 'Recruiting')
            if any(substr in low for substr in role_substrings):
                continue
            # remove if any hyphen or slash part is a stopword/role substring
            for part in re.split(r"[-/]+", low):
                if part in stopwords or any(substr in part for substr in role_substrings):
                    low = ""
                    break
            if not low:
                continue
            # keep only name-like tokens (letters, apostrophes including Unicode ’, hyphens)
            if not re.match(r"^[A-Za-z][A-Za-z'’\-]+$", t_stripped):
                continue
            cleaned.append(t_stripped)
        if not cleaned:
            return "", ""
        if len(cleaned) == 1:
            return cleaned[0], ""
        # choose first token and the last DIFFERENT token if possible
        first = cleaned[0]
        last_candidates = [t for t in cleaned[1:] if t.lower() != first.lower()]
        last = last_candidates[-1] if last_candidates else ""
        return first, last

    def sanitize_name(first_name: str, last_name: str):
        fn = (first_name or "").strip()
        ln = (last_name or "").strip()
        if fn and ln and fn.lower() == ln.lower():
            ln = ""
        # drop role-y leftovers in last name
        if ln.lower() in {"head","assistant","associate","coach","coordinator","director"}:
            ln = ""
        # drop role words used as first name (to trigger email-derived fallback later)
        if fn.lower() in {"head","assistant","associate","coach","coordinator","director"}:
            fn = ""
        return fn, ln

    def derive_name_from_email(email: str):
        """Derive a plausible name from an email local part."""
        if not email or '@' not in email:
            return "", ""
        local = email.split('@', 1)[0]
        # common separators
        parts = re.split(r"[._\-]+", local)
        parts = [p for p in parts if p]
        # If local starts with a single letter followed by separator and then a word, treat as initial + last
        if len(parts) >= 2 and len(parts[0]) == 1:
            first = parts[0].upper()
            last = parts[1].capitalize()
            return first, last
        if len(parts) >= 2:
            first = parts[0].capitalize()
            last = parts[1].capitalize()
            return first, last
        # Single token: try to split camel case else capitalize
        token = parts[0]
        m = re.match(r"^([A-Z][a-z]+)([A-Z][a-z]+)$", token)
        if m:
            return m.group(1), m.group(2)
        return token.capitalize(), ""

    def split_name_and_title(pre_email_text: str):
        """
        Split pre-email segment into (first_name, last_name, title).
        Prefer multi-word titles ending with 'Coach'.
        """
        pre = (pre_email_text or "").strip()
        if not pre:
            return "", "", ""
        # Case A: Role before 'Coach' then a Name at the end (e.g., "Head Men's Basketball Coach John Doe")
        m_role_then_name = re.search(
            r"^(?P<role>.*?\bcoach(?:[\w\s/&\-’']*)?)\s+(?P<name>[A-Z][A-Za-z’'\-\.]+(?:\s+[A-Z][A-Za-z’'\-\.]+){1,3})\s*$",
            pre,
            flags=re.IGNORECASE,
        )
        # Prefer multi-word phrase ending in Coach
        m_end = re.search(r"([A-Za-z'’/&\-\s]*?\b(?:[A-Za-z'’/&\-]+\s+){1,6}coach)\b\s*$", pre, flags=re.IGNORECASE)
        title = ""
        name_only = pre
        if m_role_then_name:
            title = m_role_then_name.group('role').strip()
            name_only = m_role_then_name.group('name').strip()
        elif m_end:
            title = m_end.group(1).strip()
            name_only = re.sub(re.escape(m_end.group(1)) + r"\s*$", "", pre, flags=re.IGNORECASE).strip().rstrip("-—–,:").strip()
        else:
            m = re.search(r"([A-Za-z’/&\-\s]*?\bcoach\b[ A-Za-z’/&\-]*)$", pre, flags=re.IGNORECASE)
            if m:
                title = m.group(1).strip()
                name_only = re.sub(re.escape(title) + r'\s*$', '', pre, flags=re.IGNORECASE).strip().rstrip('-—–,:').strip()
            else:
                title = extract_coach_title(pre)
                name_only = pre
        # Strip trailing role tokens and descriptors from name_only if any slipped through
        name_only = re.sub(
            r"[-—–,:/\s]*(?:head|assistant|associate|coach|coordinator|director|recruit(?:ing|er)?|operations?|strength|conditioning|athletic|performance|men|women|men's|women's)\b.*$",
            "",
            name_only,
            flags=re.IGNORECASE,
        ).strip()
        first_name, last_name = clean_name_tokens(name_only)
        return first_name, last_name, title
    
    # Method 1: Try single-line format first (original logic)  
    single_line_entries = []
    current_sport_section = None  # Track current sport section
    
    for i, line in enumerate(lines):
        # Check if this line is a sport section header
        line_stripped = line.strip()
        sport_section_match = re.match(r'^([A-Z\s&]+(?:\([^)]+\))?)$', line_stripped)
        if sport_section_match and any(sport in line_stripped.lower() for sport in 
                                      ['baseball', 'basketball', 'soccer', 'football', 'swimming', 
                                       'volleyball', 'lacrosse', 'track', 'field hockey', 'cross country', 'softball']):
            current_sport_section = line_stripped
            print(f"🏃‍♂️ Found sport section: {current_sport_section}")
            continue
        
        m = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
        if not m:
            continue
        
        # Filter for lines containing "coach" (case-insensitive)
        if "coach" not in line.lower():
            continue
            
        email = m.group()
        name_part = line[:m.start()].strip()
        
        # Extract and format phone number
        phone_number = extract_and_format_phone(line, area_code)
        
        # Store full line for txt output
        all_lines.append(line.strip())

        # Prefer to split the pre-email segment into name and title first
        s_first, s_last, s_title = split_name_and_title(name_part)
        if s_first or s_last:
            first_name, last_name = sanitize_name(s_first, s_last)
        else:
            # fallback: basic tokenization
            tokens = name_part.split()
            if tokens and tokens[0].lower() in ("dr.", "dr"):
                tokens = tokens[1:]
            first_name = tokens[0] if tokens else ""
            last_name  = tokens[1] if len(tokens) > 1 else ""
            first_name, last_name = sanitize_name(first_name, last_name)
        if not first_name and not last_name:
            # Try to recover name from up to 3 previous lines if they look like a standalone name
            recovered_first = ""
            recovered_last = ""
            for back in range(1, 4):
                if i - back < 0:
                    break
                prev = (lines[i - back] or "").strip()
                if not prev or '@' in prev.lower() or 'coach' in prev.lower():
                    continue
                m_name = re.match(r"^([A-Z][A-Za-z’'\-]+)\s+([A-Z][A-Za-z’'\-]+)(?:\s+[A-Z][A-Za-z’'\-]+)?$", prev)
                if m_name:
                    recovered_first = m_name.group(1)
                    recovered_last = m_name.group(2)
                    break
            if recovered_first or recovered_last:
                first_name, last_name = sanitize_name(recovered_first, recovered_last)
            else:
                # Fallback to deriving from email
                df_first, df_last = derive_name_from_email(email)
                first_name, last_name = sanitize_name(df_first, df_last)
        # Heuristic: if title segment looks like "<Last> Coach", use that as last name
        if (not last_name) and (s_title or name_part):
            title_source = (s_title or name_part or "").strip()
            m_last_coach = re.search(r"^([A-Za-z][A-Za-z’'\-]+)\s+Coach\b", title_source, flags=re.IGNORECASE)
            if m_last_coach:
                last_candidate = m_last_coach.group(1)
                if not last_name:
                    last_name = last_candidate
                if not first_name:
                    df_first2, df_last2 = derive_name_from_email(email)
                    if df_last2 and df_last2.lower() == last_name.lower():
                        first_name = df_first2
                    elif df_first2 and df_first2.lower().endswith(last_name.lower()) and len(df_first2) > len(last_name):
                        first_name = df_first2[:len(df_first2)-len(last_name)].strip("._-").capitalize()
                    elif df_first2:
                        first_name = df_first2
                first_name, last_name = sanitize_name(first_name, last_name)
        username   = email.split("@", 1)[0]
        df_first_aux, df_last_aux = derive_name_from_email(email)

        title_text = s_title or derive_title_from_namepart(name_part, first_name, last_name)
        # Camden heuristic: if title looks like "<Last> Coach" and last_name empty, set last_name
        if (not last_name) and title_text:
            m_ln = re.match(r"^([A-Za-z][A-Za-z’'\-]+)\s+Coach\b", title_text.strip(), flags=re.IGNORECASE)
            if m_ln:
                last_name = m_ln.group(1)
                if not first_name:
                    df_first2, df_last2 = derive_name_from_email(email)
                    # Prefer the email-derived part that isn't the same as last_name
                    if df_first2 and (not df_last2 or df_last2.lower() == last_name.lower()):
                        first_name = df_first2
                    elif df_last2 and df_last2.lower() != last_name.lower():
                        first_name = df_last2
                first_name, last_name = sanitize_name(first_name, last_name)
        title_text = normalize_title(title_text, name_part)
        title_text = strip_name_from_title(title_text, first_name, last_name)
        # Strip a lone surname before 'Coach' if it appears in the username or email-derived tokens
        m_title_surname = re.match(r"^([A-Za-z][A-Za-z’'\-]+)\s+Coach\b", (title_text or "").strip(), re.IGNORECASE)
        if m_title_surname:
            possible_surname = m_title_surname.group(1)
            surname_hit = False
            if possible_surname and username and (possible_surname.lower() in username.lower() or username.lower().endswith(possible_surname.lower())):
                surname_hit = True
            if not surname_hit and (df_first_aux or df_last_aux):
                if possible_surname and ((df_first_aux and possible_surname.lower() == df_first_aux.lower()) or (df_last_aux and possible_surname.lower() == df_last_aux.lower())):
                    surname_hit = True
            if surname_hit:
                title_text = re.sub(rf"^{re.escape(possible_surname)}\s+Coach\b", "Coach", title_text, flags=re.IGNORECASE)
        title_text = clean_title_text(title_text)
        entry = {
            "first_name": first_name,
            "last_name":  last_name,
            "email":      email,
            "username":   username,
            "full_line":  line.strip(),
            "role": title_text or extract_coach_title(line),
            "title": title_text or extract_coach_title(line),
            "sport_section": current_sport_section,  # Add sport context
            "uploadable": True
        }
        
        if phone_number:
            entry["phone"] = phone_number
        
        single_line_entries.append(entry)
    
    # Method 2: If no single-line entries found, try multi-line format
    if not single_line_entries:
        print("🔄 No single-line format found, trying multi-line format...")
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
                    all_lines.append(f"{prev_line} -> {line.strip()}")
                    
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
            for j in range(1, 4):  # Look ahead up to 3 lines
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
                first_name, last_name = sanitize_name(first_name, last_name)
                # If name still missing, try deriving from email
                if not first_name and not last_name and email:
                    df_first_ml, df_last_ml = derive_name_from_email(email)
                    first_name, last_name = sanitize_name(df_first_ml, df_last_ml)
                # If still missing last name and title looks like '<Last> Coach', set last and derive first from email
                if (not last_name) and coach_title:
                    m_last_ml = re.match(r"^([A-Za-z][A-Za-z’'\-]+)\s+Coach\b", coach_title.strip(), flags=re.IGNORECASE)
                    if m_last_ml:
                        last_name = m_last_ml.group(1)
                        if not first_name and email:
                            df_first_ml2, df_last_ml2 = derive_name_from_email(email)
                            if df_first_ml2 and (not df_last_ml2 or df_last_ml2.lower() == last_name.lower()):
                                first_name = df_first_ml2
                            elif df_last_ml2 and df_last_ml2.lower() != last_name.lower():
                                first_name = df_last_ml2
                        first_name, last_name = sanitize_name(first_name, last_name)
                entry = {
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "username": username,
                    "full_line": f"{coach_name} {coach_title} {email}".strip(),
                    "role": clean_title_text(coach_title if coach_title else "coach"),
                    "title": clean_title_text(coach_title if coach_title else "coach"),
                    "uploadable": True
                }
                
                if phone_number:
                    entry["phone"] = phone_number
                
                entries.append(entry)
        
        print(f"✔ Found {len(entries)} coach entries using multi-line format")
    else:
        entries = single_line_entries
        print(f"✔ Found {len(entries)} coach entries using single-line format")

    # Method 3: Window-based pass around any line containing 'coach' (always run to augment results)
    seen_emails = set(e["email"] for e in entries if e.get("email"))
    seen_full = set(e["full_line"] for e in entries if e.get("full_line"))
    for i, line in enumerate(lines):
        if "coach" not in line.lower():
            continue
        # Skip if identical line already included
        if line.strip() in seen_full:
            continue
        # find email on same line or nearby lines
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
        look_range = list(range(-8, 9))
        email = None
        email_line_idx = i
        if email_match:
            email = email_match.group()
        else:
            for d in look_range:
                if d == 0 or i + d < 0 or i + d >= len(lines):
                    continue
                m2 = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', lines[i + d])
                if m2:
                    email = m2.group()
                    email_line_idx = i + d
                    break
        title = extract_coach_title(line)
        if email and email not in seen_emails:
            username = email.split("@", 1)[0]
            # Prefer to split the pre-email segment into name and title
            name_src = lines[email_line_idx]
            prefix = name_src.split(email, 1)[0].strip()
            s_first3, s_last3, s_title3 = split_name_and_title(prefix)
            first_name = s_first3 or ""
            last_name = s_last3 or ""
            first_name, last_name = sanitize_name(first_name, last_name)
            if not first_name and not last_name:
                df_first, df_last = derive_name_from_email(email)
                first_name, last_name = sanitize_name(df_first, df_last)
            # Heuristic for window-based: title like "<Last> Coach" within prefix
            if (not last_name) and prefix:
                m_last_coach2 = re.search(r"^([A-Za-z][A-Za-z’'\-]+)\s+Coach\b", prefix, flags=re.IGNORECASE)
                if m_last_coach2:
                    last_candidate = m_last_coach2.group(1)
                    if not last_name:
                        last_name = last_candidate
                    if not first_name:
                        df_first3, df_last3 = derive_name_from_email(email)
                        if df_last3 and df_last3.lower() == last_name.lower():
                            first_name = df_first3
                        elif df_first3 and df_first3.lower().endswith(last_name.lower()) and len(df_first3) > len(last_name):
                            first_name = df_first3[:len(df_first3)-len(last_name)].strip("._-").capitalize()
                        elif df_first3:
                            first_name = df_first3
                    first_name, last_name = sanitize_name(first_name, last_name)
            normalized_title = normalize_title(title or s_title3, prefix)
            normalized_title = strip_name_from_title(normalized_title, first_name, last_name)
            m_norm_surname = re.match(r"^([A-Za-z][A-Za-z’'\-]+)\s+Coach\b", (normalized_title or "").strip(), re.IGNORECASE)
            if m_norm_surname and username:
                possible_surname2 = m_norm_surname.group(1)
                if possible_surname2 and (possible_surname2.lower() in username.lower() or username.lower().endswith(possible_surname2.lower())):
                    normalized_title = re.sub(rf"^{re.escape(possible_surname2)}\s+Coach\b", "Coach", normalized_title, flags=re.IGNORECASE)
            normalized_title = clean_title_text(normalized_title)
            entry = {
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "username": username,
                "full_line": f"{line.strip()} {email}",
                "role": normalized_title,
                "title": normalized_title,
                "uploadable": True
            }
            entries.append(entry)
            seen_emails.add(email)
            seen_full.add(line.strip())
        else:
            # Coach line without an email nearby: include in TXT only
            raw = line.strip()
            # Skip obvious header rows like "Coaching Staff" blocks
            if re.search(r"coaching\s+staff", raw, flags=re.IGNORECASE):
                first_name, last_name = "", ""
            else:
                raw_name = re.sub(r"\b(head|assistant|associate|coach|coaching|coordinator|director|staff)\b.*$", "", raw, flags=re.IGNORECASE).strip()
                first_name, last_name = clean_name_tokens(raw_name)
            entry = {
                "first_name": first_name,
                "last_name": last_name,
                "email": "",
                "username": "",
                "full_line": line.strip(),
                "role": title or "coach",
                "title": title or "coach",
                "uploadable": False
            }
            entries.append(entry)
            seen_full.add(line.strip())
    
    # Post-process: assign usernames for entries without email using names
    for e in entries:
        # Trim any accidental leading spaces on names
        e['first_name'] = (e.get('first_name') or '').strip()
        e['last_name'] = (e.get('last_name') or '').strip()
        if (not e.get('email')):
            # Do not create usernames from header-like lines
            full_line_lower = (e.get('full_line') or '').lower()
            display_name_lower = f"{e.get('first_name','')} {e.get('last_name','')}".strip().lower()
            is_header_like = (
                'coaching staff' in full_line_lower or
                full_line_lower.strip().startswith('coaches') or
                display_name_lower in {'', 'staff', 'coaches', 'coaching'}
            )
            if not e.get('username') and not is_header_like:
                uname = build_username_from_name(e.get('first_name', ''), e.get('last_name', ''))
                if uname:
                    e['username'] = uname
                    if e.get('uploadable') is False:
                        e['uploadable'] = True

    # Output to txt file if specified
    if output_txt and entries:
        write_to_txt(entries, all_lines, output_txt, pdf_info)
    
    return entries, pdf_info

def write_to_txt(entries, all_lines, output_path, pdf_info=None):
    """
    Write filtered coach entries to a txt file for quick review.
    Includes detected school/organization context when available.
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(f"COACH ENTRIES FOUND - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 60 + "\n\n")
        # School context block
        if pdf_info:
            university = pdf_info.get('university') or 'Unknown University'
            organization = pdf_info.get('organization') or 'University Athletics'
            location = pdf_info.get('location') or ''
            source = pdf_info.get('source') or ''
            f.write("SCHOOL CONTEXT\n")
            f.write("-" * 40 + "\n")
            f.write(f"University: {university}\n")
            f.write(f"Organization: {organization}\n")
            if pdf_info.get('state'):
                f.write(f"State: {pdf_info['state']}\n")
            if location:
                f.write(f"Location: {location}\n")
            if source:
                f.write(f"Source: {source}\n")
            f.write("\n")
        
        f.write(f"Total coaches found: {len(entries)}\n\n")
        
        f.write("PARSED ENTRIES:\n")
        f.write("-" * 40 + "\n")
        
        for i, entry in enumerate(entries, 1):
            f.write(f"{i}. {entry['first_name']} {entry['last_name']}\n")
            f.write(f"   Email: {entry['email']}\n")
            f.write(f"   Username: {entry['username']}\n")
            try:
                prof = map_to_coach_profile(entry, pdf_info)
                sports_line = ", ".join(prof.get('sports', []) or [])
                if sports_line:
                    f.write(f"   Sports: {sports_line}\n")
            except Exception:
                pass
            if 'title' in entry and entry['title']:
                f.write(f"   Title: {entry['title']}\n")
            if entry.get('uploadable') is False:
                f.write(f"   Note: No email found nearby; this entry will NOT be uploaded.\n")
            if 'phone' in entry:
                f.write(f"   Phone: {entry['phone']}\n")
            f.write(f"   Original line: {entry['full_line']}\n")
            f.write("\n")
        
        f.write("\n" + "=" * 60 + "\n")
        f.write("RAW LINES WITH 'COACH' KEYWORD:\n")
        f.write("-" * 40 + "\n")
        
        for line in all_lines:
            f.write(f"• {line}\n")
    
    print(f"✔ Results written to {output_path}")

def validate_txt_file(output_path: str) -> tuple:
    """
    Validate the generated TXT to ensure required fields are present for uploadable entries.
    Required fields: non-empty name (first OR last), Username, Title. Email is optional if username exists.
    Entries marked with the dry-run note (no email) are ignored for upload. "Coaching Staff" header blocks are ignored.
    Returns (is_valid, issues_count).
    """
    try:
        with open(output_path, 'r', encoding='utf-8') as f:
            lines = [ln.rstrip("\n") for ln in f.readlines()]
    except Exception as e:
        print(f"❌ Could not read TXT for validation: {output_path} ({e})")
        return False, 1

    # Find start and end of parsed entries section
    start_idx = None
    end_idx = None
    for i, ln in enumerate(lines):
        if start_idx is None and ln.strip() == "PARSED ENTRIES:":
            # Skip the separator line after header
            start_idx = i + 2 if i + 1 < len(lines) else i + 1
            continue
        if start_idx is not None and ln.strip() == "RAW LINES WITH 'COACH' KEYWORD:":
            end_idx = i - 1  # stop before the RAW LINES header (and preceding blank/separator)
            break
    if start_idx is None:
        print("❌ Validation failed: 'PARSED ENTRIES' section not found in TXT")
        return False, 1
    if end_idx is None:
        end_idx = len(lines)

    issues = 0
    cur_block = []

    def validate_block(block_lines):
        nonlocal issues
        if not block_lines:
            return
        # Skip blocks explicitly marked as non-uploadable
        joined = "\n".join(block_lines)
        if "will NOT be uploaded" in joined:
            return
        # Skip obvious header sections
        for ln in block_lines:
            if ln.strip().lower().startswith('original line:') and re.search(r"coaching\s+staff|^coaches\b", ln, flags=re.IGNORECASE):
                return
        # Extract fields
        name_ok = False
        email_ok = False
        username_ok = False
        title_ok = False
        for ln in block_lines:
            if re.match(r"^\d+\.\s+\S+", ln):
                # e.g., "1. First Last"
                tokens = ln.split(maxsplit=1)
                rest = tokens[1] if len(tokens) > 1 else ""
                if rest.strip():
                    name_ok = True
            elif ln.strip().lower().startswith("email:"):
                val = ln.split(":", 1)[1].strip() if ":" in ln else ""
                if val and ("@" in val):
                    email_ok = True
            elif ln.strip().lower().startswith("username:"):
                val = ln.split(":", 1)[1].strip() if ":" in ln else ""
                if val:
                    username_ok = True
            elif ln.strip().lower().startswith("title:"):
                val = ln.split(":", 1)[1].strip() if ":" in ln else ""
                if val:
                    title_ok = True
        # Email is optional if a username is present
        if not (name_ok and username_ok and title_ok):
            issues += 1
            print("⚠️  Validation issue in TXT entry block:")
            for ln in block_lines:
                print(f"   {ln}")
            missing = []
            if not name_ok: missing.append("name")
            # Only flag email if also missing username
            if (not email_ok) and (not username_ok):
                missing.append("email")
            if not username_ok: missing.append("username")
            if not title_ok: missing.append("title")
            print(f"   → Missing/invalid: {', '.join(missing)}")

    # Walk lines and split into blocks separated by blank lines, only within PARSED ENTRIES section
    for ln in lines[start_idx:end_idx]:
        if ln.strip() == "":
            validate_block(cur_block)
            cur_block = []
        else:
            cur_block.append(ln)
    # Validate last block if any
    validate_block(cur_block)

    if issues == 0:
        print("✅ TXT validation passed")
        return True, 0
    else:
        print(f"❌ TXT validation found {issues} issue(s)")
        return False, issues

def mark_damaged_txt(output_path: str):
    try:
        parent = os.path.dirname(output_path)
        damaged_dir = os.path.join(parent, "damaged-pdfs")
        os.makedirs(damaged_dir, exist_ok=True)
        new_path = os.path.join(damaged_dir, os.path.basename(output_path))
        try:
            os.replace(output_path, new_path)
            print(f"🚧 Moved damaged TXT to {new_path}")
        except Exception:
            print("⚠️  Could not move TXT; leaving in place but marking as damaged.")
    except Exception as e:
        print(f"⚠️  Failed to mark damaged TXT: {e}")

def map_to_coach_profile(entry, pdf_info=None):
    """
    Map scraped coach data to ReviewMyCoach coach profile structure.
    """
    # Extract sport from sport section context first, then from role text
    sports = []
    sport_section = entry.get('sport_section', '').lower() if entry.get('sport_section') else ''
    role_text = entry.get('full_line', '').lower()
    
    # Map sport sections to sports
    if sport_section:
        if 'basketball' in sport_section:
            if 'men' in sport_section:
                sports.append('Basketball (Men)')
            elif 'women' in sport_section:
                sports.append('Basketball (Women)')
            else:
                sports.append('Basketball')
        elif 'soccer' in sport_section:
            if 'men' in sport_section:
                sports.append('Soccer (Men)')
            elif 'women' in sport_section:
                sports.append('Soccer (Women)')
            else:
                sports.append('Soccer')
        elif 'football' in sport_section:
            sports.append('Football')
        elif 'baseball' in sport_section:
            sports.append('Baseball')
        elif 'softball' in sport_section:
            sports.append('Softball')
        elif 'swimming' in sport_section:
            sports.append('Swimming')
        elif 'track' in sport_section or 'field' in sport_section:
            sports.append('Track & Field')
        elif 'cross country' in sport_section:
            sports.append('Cross Country')
        elif 'volleyball' in sport_section:
            sports.append('Volleyball')
        elif 'lacrosse' in sport_section:
            if 'women' in sport_section:
                sports.append('Lacrosse (Women)')
            else:
                sports.append('Lacrosse')
        elif 'field hockey' in sport_section:
            sports.append('Field Hockey')
    
    # Fallback to role text analysis if no sport section context
    if not sports:
        sport_keywords = {
            'soccer': 'Soccer',
            'football': 'Soccer',  # In case they use "football" to mean soccer
            'men\'s soccer': 'Soccer',
            'mens soccer': 'Soccer',
            'goalkeeper': 'Soccer',
            'goalie': 'Soccer',
            'midfielder': 'Soccer',
            'defender': 'Soccer',
            'forward': 'Soccer',
            'striker': 'Soccer',
            # Keep other common sports as fallback
            'baseball': 'Baseball',
            'basketball': 'Basketball',
            'tennis': 'Tennis',
            'swimming': 'Swimming',
            'track': 'Track & Field',
            'field': 'Track & Field',
            'cross country': 'Cross Country',
            'volleyball': 'Volleyball',
            'golf': 'Golf',
            'wrestling': 'Wrestling',
            'lacrosse': 'Lacrosse',
            'softball': 'Softball',
            'hockey': 'Hockey',
            'rowing': 'Rowing',
            'strength': 'Strength & Conditioning',
            'conditioning': 'Strength & Conditioning'
        }
        
        for keyword, sport in sport_keywords.items():
            if keyword in role_text and sport not in sports:
                sports.append(sport)
    
    # Use PDF info to determine default sport and organization
    default_sport = 'Soccer'  # Default fallback
    if pdf_info:
        if 'bryant' in pdf_info.get('university', '').lower() and 'soccer' in pdf_info.get('source', '').lower():
            default_sport = 'Soccer'
        elif 'rowan' in pdf_info.get('university', '').lower():
            # For Rowan, don't default to any sport - let the section/role text determine it
            default_sport = None
    
    # Apply default sport logic
    if not sports and default_sport:
        sports = [default_sport]
    elif not sports:
        sports = ['General Athletics']  # Generic fallback
    
    # Extract role/title from parsed entry when available; fallback to regex
    parsed_title = (entry.get('title') or entry.get('role') or '').strip()
    if parsed_title:
        role = parsed_title
    else:
        role_part = entry.get('full_line', '')
        if 'coach' in role_part.lower():
            role_match = re.search(r'(Head Coach|Assistant Coach|Defensive Coordinator|[A-Za-z\s]+Coach)', role_part, re.IGNORECASE)
            role = role_match.group(1) if role_match else 'Coach'
        else:
            role = 'Coach'
    
    # Get organization info from PDF info or use defaults
    if pdf_info:
        location = (pdf_info.get('state') or pdf_info.get('location') or 'New Jersey')
        organization = pdf_info.get('organization', 'University Athletics')
        source_url = pdf_info.get('source', 'University Athletics Directory')
    else:
        # Fallback defaults
        location = 'New Jersey'
        organization = 'University Athletics'
        source_url = 'University Athletics Directory'

    # Create complete coach profile matching the app structure
    coach_profile = {
        'username': entry['username'],
        'displayName': f"{entry['first_name']} {entry['last_name']}".strip(),
        'email': entry['email'],
        'bio': f"Experienced {role.lower()} specializing in {', '.join(sports).lower()}.",
        'sports': sports,
        # 'experience' intentionally omitted per user request
        'certifications': [],
        'hourlyRate': 0,  # To be set during profile completion
        'location': location,
        'availability': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'specialties': sports,
        'languages': ['English'],
        'organization': organization,
        'university': pdf_info.get('university', ''),
        'role': role,
        'gender': '',  # To be filled during claiming
        'ageGroup': ['Adult', 'Teen', 'Youth'],
        'sourceUrl': source_url,
        'averageRating': 0,
        'totalReviews': 0,
        'isVerified': False,
        'isPublic': True,  # Required by search API to show in results
        'hasActiveServices': False,  # Will be set to True when services are added
        'profileImage': '',
        'website': '',
        'socialMedia': {
            'instagram': '',
            'twitter': '',
            'linkedin': ''
        },
        'createdAt': firestore.SERVER_TIMESTAMP,
        'updatedAt': firestore.SERVER_TIMESTAMP,
        'profileCompleted': False,
        'isClaimed': False,  # Key field for claiming system
        'userId': None,  # Will be linked when claimed
        'claimedAt': None,
        'verificationStatus': 'pending'  # pending, in_review, verified, rejected
    }
    
    # Add phone number if available
    if 'phone' in entry:
        coach_profile['phoneNumber'] = entry['phone']
    
    return coach_profile

def upload_to_firestore(entries, key_path, pdf_info=None, collection='coaches', dry_run=False):
    """
    Initialize Firebase Admin and upload coach profiles to Firestore.
    Creates unclaimed coach profiles that can be claimed during onboarding.
    """
    if dry_run:
        print("DRY RUN MODE - No actual upload to Firestore")
        for e in entries:
            if e.get('uploadable') is False:
                continue
            coach_profile = map_to_coach_profile(e, pdf_info)
            phone_info = f" | Phone: {coach_profile.get('phoneNumber', 'N/A')}" if 'phoneNumber' in coach_profile else ""
            print(f"[DRY RUN] Would create unclaimed coach profile: {coach_profile['displayName']} ({coach_profile['email']}) → coaches/{coach_profile['username']}{phone_info}")
        return 0, 0

    # Initialize Firebase app once per process
    try:
        # Will raise if app not initialized
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate(key_path)
        firebase_admin.initialize_app(cred)

    db = firestore.client()

    uploaded_count = 0
    skipped_count = 0

    for e in entries:
        if e.get('uploadable') is False:
            continue
        try:
            coach_profile = map_to_coach_profile(e, pdf_info)
            username = coach_profile['username']
            
            # Check if coach profile already exists
            coach_ref = db.collection('coaches').document(username)
            existing_coach = coach_ref.get()
            
            if existing_coach.exists:
                existing_data = existing_coach.to_dict()
                if existing_data.get('isClaimed', False):
                    print(f"⏭️  Skipped {coach_profile['email']} - already claimed by user")
                    skipped_count += 1
                    continue
                else:
                    print(f"🔄 Updating unclaimed profile for {coach_profile['email']}")
            
            # Upload/update the coach profile
            coach_ref.set(coach_profile)
            
            phone_info = f" | Phone: {coach_profile.get('phoneNumber', 'N/A')}" if 'phoneNumber' in coach_profile else ""
            status = "Updated" if existing_coach.exists else "Created"
            print(f"✔ {status} unclaimed coach profile: {coach_profile['displayName']} ({coach_profile['email']}) → coaches/{username}{phone_info}")
            uploaded_count += 1
            
        except Exception as error:
            print(f"❌ Error processing {e['email']}: {error}")
    
    print(f"\n📊 Upload Summary:")
    print(f"✔ {uploaded_count} coach profiles created/updated")
    print(f"⏭️  {skipped_count} profiles skipped (already claimed)")
    print(f"📧 Coaches can now claim their profiles during onboarding using their email address")
    return uploaded_count, skipped_count


def main():
    p = argparse.ArgumentParser(
        description="Import coaches from University Athletics PDF(s). Can take a single PDF path OR a directory of PDFs."
    )
    p.add_argument("--pdf", default="pdfs", help="Path to a PDF file OR a directory containing PDFs (default: ./pdfs)")
    p.add_argument("--nj", action="store_true", help="Use PDFs under ./pdfs/nj (overrides --pdf if set)")
    p.add_argument("--key", help="Path to Firebase Admin JSON key (optional for dry-run)")
    p.add_argument("--collection", default="coaches", help="Firestore collection to write documents into (default: coaches)")
    p.add_argument("--output-txt", help="Path to output txt file for quick review (single PDF mode). If processing a directory, per-PDF files will go under --output-dir.")
    p.add_argument("--output-dir", default="dry-run-output", help="Directory to store per-PDF review txt files (default: dry-run-output)")
    p.add_argument("--dry-run", action="store_true", help="If set, do not upload to Firestore; just print and write the review txt.")
    args = p.parse_args()

    # Resolve input path. If --nj is set, force ./pdfs/nj
    input_path = os.path.join("pdfs", "nj") if args.nj else args.pdf
    # Ensure output directory exists for per-PDF summaries
    output_dir = args.output_dir or "dry-run-output"
    os.makedirs(output_dir, exist_ok=True)
    is_dir = os.path.isdir(input_path)
    is_file = os.path.isfile(input_path)

    if not is_dir and not is_file:
        print(f"Input path not found: {input_path}")
        return

    # Collect list of pdf paths
    pdf_paths = []
    if is_dir:
        for root, _, files in os.walk(input_path):
            for f in files:
                if f.lower().endswith(".pdf"):
                    pdf_paths.append(os.path.join(root, f))
        pdf_paths.sort()
        if not pdf_paths:
            print(f"No PDFs found under directory: {input_path}")
            return
    else:
        pdf_paths = [input_path]

    total_found = 0
    total_uploaded = 0

    # Process each PDF
    for idx, pdf_path in enumerate(pdf_paths, start=1):
        pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
        # Per-file output unless user forced a single output path
        if args.output_txt and not is_dir:
            output_txt = args.output_txt
        else:
            output_txt = os.path.join(output_dir, f"coaches_filtered_{pdf_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")

        print(f"\n=== [{idx}/{len(pdf_paths)}] Processing: {pdf_path} ===")
        try:
            coaches, pdf_info = parse_pdf(pdf_path, output_txt)
        except Exception as e:
            print(f"!! Failed to parse {pdf_path}: {e}")
            continue

        print(f"Found {len(coaches)} coach entries (filtered from PDF).")
        total_found += len(coaches)

        if len(coaches) == 0:
            print("No entries with 'coach' keyword found in the PDF.")
            continue

        try:
            if args.dry_run:
                # Always perform dry-run printing of intended uploads
                upload_to_firestore(coaches, None, pdf_info, args.collection, dry_run=True)
            elif args.key:
                # Validate TXT before uploading for this PDF
                is_valid, _ = validate_txt_file(output_txt)
                if not is_valid:
                    mark_damaged_txt(output_txt)
                    print("⏭️  Skipping upload for this PDF due to validation issues. Moved to damaged-pdfs.")
                    continue
                # Build usernames for entries missing emails
                for e in coaches:
                    if not e.get('email'):
                        uname = build_username_from_name(e.get('first_name', ''), e.get('last_name', ''))
                        e['username'] = uname or e.get('username') or ''
                        e['uploadable'] = True if uname else False
                uploaded_count, skipped_count = upload_to_firestore(coaches, args.key, pdf_info, args.collection)
                total_uploaded += uploaded_count
            else:
                print("No Firebase key provided - results only saved to txt file.")
                print("To upload to Firestore, run with --key path/to/firebase-key.json")
        except Exception as e:
            print(f"!! Failed to upload entries for {pdf_path}: {e}")
            continue

    print(f"\n=== DONE ===")
    print(f"PDFs processed: {len(pdf_paths)}")
    print(f"Coach entries found: {total_found}")
    if not args.dry_run and args.key:
        print(f"Coach entries uploaded: ~{total_uploaded} (subject to de-duplication rules in Firestore).")

if __name__ == "__main__":
    main()

 