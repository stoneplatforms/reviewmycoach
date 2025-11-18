#!/usr/bin/env python3
import argparse
import asyncio
import csv
import os
import shutil
import re
import sys
import time
from datetime import datetime
from urllib.parse import urlsplit
from pathlib import Path
from typing import Dict, List, Optional, Tuple


# ------------------------
# Utilities
# ------------------------

def slugify(text: str) -> str:
    text = (text or "").strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-") or "file"


def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)


def find_csv_in_folder(folder: Path) -> Optional[Path]:
    for p in sorted(folder.glob("*.csv")):
        return p
    return None


def read_rows(csv_path: Path) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    with csv_path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            sys.exit("ERROR: CSV has no headers.")

        # Normalize headers
        headers = [h.strip() if h else "" for h in reader.fieldnames]
        for row in reader:
            norm = { (k or "").strip(): (v or "").strip() for k, v in row.items() }
            rows.append(norm)

    if not rows:
        sys.exit("ERROR: CSV has no data rows.")
    return rows


def guess_url_column(headers: List[str]) -> Optional[str]:
    candidates = [h for h in headers if h and 'url' in h.lower()]
    if not candidates:
        return None
    # Prefer more specific names
    for key in [
        'print_url', 'print url', 'staff_directory_print_url', 'directory_print_url',
        'staff_url', 'staff directory url', 'directory_url', 'directory url', 'url'
    ]:
        for c in candidates:
            if c.lower() == key:
                return c
    # fallback to the first url-like header
    return candidates[0]


def build_candidate_urls(base_url: str) -> List[str]:
    if not base_url:
        return []
    url = base_url.strip().split('#', 1)[0]
    candidates: List[str] = []
    def add(u: str):
        if u and u not in candidates:
            candidates.append(u)
    # Derive a base path without trailing /index if present
    base_no_index = None
    if url.endswith('/index'):
        base_no_index = url[:-len('index')]
    elif url.endswith('index/'):
        base_no_index = url[:-len('index/')]

    # 1) Prefer explicit print variants first
    add(url + ('&print=true' if '?' in url else '?print=true'))
    add(url + ('print' if url.endswith('/') else '/print'))

    # 1b) If it ends with /index, prefer print variants on the base path too
    if base_no_index:
        add(base_no_index + ('?print=true' if '?' not in base_no_index else '&print=true'))
        add(base_no_index + ('print' if base_no_index.endswith('/') else '/print'))

    # 2) The original URL as-is
    add(url)

    # 3) Explicit index pages (print then plain)
    add(url + ('index?print=true' if url.endswith('/') else '/index?print=true'))
    add(url + ('index/print' if url.endswith('/') else '/index/print'))
    add(url + ('index' if url.endswith('/') else '/index'))

    # 4) Base path plain (if we had /index)
    if base_no_index:
        add(base_no_index)
        add(base_no_index.rstrip('/'))
    return candidates


def build_output_filename(row: Dict[str, str], default_state: Optional[str] = None) -> str:
    # If CSV provides a filename use it
    filename = (row.get('filename') or '').strip()
    if filename:
        return filename if filename.lower().endswith('.pdf') else f"{filename}.pdf"

    # Prefer a nice human-readable name when possible
    for key in ['college', 'school', 'university', 'name', 'title']:
        value = (row.get(key) or '').strip()
        if value:
            return f"{value}.pdf"

    # Fallback to state or URL slug
    base = row.get('print_url') or row.get('url') or default_state or 'output'
    return f"{slugify(base)}.pdf"


def zip_folder(folder: Path, zip_path: Path):
    from zipfile import ZipFile, ZIP_DEFLATED
    with ZipFile(zip_path, "w", ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(folder):
            for fn in files:
                full = Path(root) / fn
                arc = full.relative_to(folder)
                zf.write(full, arcname=str(arc))


# ------------------------
# PDF Rendering (Playwright)
# ------------------------

async def render_pdf(browser, task: Dict[str, str], out_dir: Path, timeout_ms: int) -> Dict[str, str]:
    url = task["print_url"]
    outfile = out_dir / task["outfile"]
    info = {"url": url, "outfile": str(outfile), "status": "ok", "error": ""}
    try:
        # Create a context with a realistic UA and language headers
        user_agent = (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        )
        context = await browser.new_context(
            user_agent=user_agent,
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Cache-Control": "no-cache",
            },
            viewport={"width": 1280, "height": 900},
        )
        page = await context.new_page()
        candidate_urls = build_candidate_urls(url)
        attempted_urls: List[str] = []
        last_error: str = ""
        # Helpers for stricter error-page detection
        def looks_like_404(html_text: str) -> bool:
            h = html_text.lower()
            return (
                ('404 not found' in h)
                or re.search(r'\b(404)\b\s*(error|page)\b', h) is not None
                or 'the page you are looking for' in h and 'not found' in h
                or 'error-404' in h
            )

        def looks_like_403(html_text: str) -> bool:
            h = html_text.lower()
            return (
                '403 forbidden' in h
                or 'access denied' in h
                or "you don't have permission" in h
                or 'you do not have permission' in h
                or 'the request could not be satisfied' in h
                or 'error-403' in h
            )

        def looks_like_staff_directory(html_text: str) -> bool:
            h = html_text.lower()
            return (
                'staff directory' in h or 'directory' in h
            )

        for candidate in candidate_urls:
            attempted_urls.append(candidate)
            try:
                parts = urlsplit(candidate)
                referer = f"{parts.scheme}://{parts.netloc}"
                response = await page.goto(candidate, wait_until="networkidle", timeout=timeout_ms, referer=referer)
            except Exception as nav_err:
                last_error = f"Navigation failed: {nav_err}"
                continue

            # HTTP status-based rejection
            if response and response.status in (403, 404):
                last_error = f"HTTP {response.status} returned"
                # Fallback: try fetching static HTML with requests and render it anyway
                try:
                    import requests
                    headers = {
                        'User-Agent': user_agent,
                        'Referer': referer,
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    }
                    r = requests.get(candidate, headers=headers, timeout=20)
                    # If we get any HTML back, attempt to render it even if 404, as long as it looks like a directory
                    if r.text and looks_like_staff_directory(r.text) and not looks_like_403(r.text):
                        await page.set_content(r.text, wait_until='domcontentloaded')
                        await page.emulate_media(media="print")
                        await page.wait_for_timeout(800)
                        ensure_dir(outfile.parent)
                        await page.pdf(
                            path=str(outfile),
                            format="Letter",
                            print_background=True,
                            margin={"top": "0.4in", "right": "0.4in", "bottom": "0.4in", "left": "0.4in"},
                            prefer_css_page_size=True,
                        )
                        info["url"] = candidate
                        info["attempted_urls"] = attempted_urls
                        info["render_mode"] = 'static'
                        break
                except Exception as _:
                    pass
                continue

            # Content-based error detection (many sites return 200 with error content)
            html = await page.content()
            lower_html = html.lower()
            if looks_like_404(lower_html) and not looks_like_staff_directory(lower_html):
                last_error = "Detected 404 text in HTML"
                continue
            if looks_like_403(lower_html):
                last_error = "Detected 403 text in HTML"
                continue

            # Looks good – render
            await page.emulate_media(media="print")
            await page.wait_for_timeout(800)
            ensure_dir(outfile.parent)
            await page.pdf(
                path=str(outfile),
                format="Letter",
                print_background=True,
                margin={"top": "0.4in", "right": "0.4in", "bottom": "0.4in", "left": "0.4in"},
                prefer_css_page_size=True,
            )
            info["url"] = candidate
            info["attempted_urls"] = attempted_urls
            break
        else:
            info["status"] = "skipped"
            info["error"] = last_error or "No viable URL variant worked"
            info["attempted_urls"] = attempted_urls
            return info
    except Exception as e:
        info["status"] = "error"
        info["error"] = str(e)
    finally:
        try:
            if 'page' in locals():
                await page.close()
        finally:
            if 'context' in locals():
                await context.close()
    return info


async def print_all_from_csv(csv_rows: List[Dict[str, str]], out_dir: Path, concurrency: int, timeout_ms: int) -> List[Dict[str, str]]:
    from playwright.async_api import async_playwright

    # Determine URL column and collect tasks
    if not csv_rows:
        return []
    headers = list(csv_rows[0].keys())
    url_key = guess_url_column(headers)
    if not url_key:
        sys.exit("ERROR: Could not find a URL column in the CSV (expected a column containing 'url').")

    tasks: List[Dict[str, str]] = []
    for r in csv_rows:
        base_url = r.get('print_url') or r.get(url_key) or ''
        base_url = base_url.strip()
        if not base_url:
            continue
        # Keep original URL; rendering will try variants (?print=true, /print, original)
        r['print_url'] = base_url
        tasks.append({
            'print_url': base_url,
            'outfile': build_output_filename(r),
        })

    results: List[Dict[str, str]] = []
    sem = asyncio.Semaphore(concurrency)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        async def worker(t: Dict[str, str]):
            async with sem:
                return await render_pdf(browser, t, out_dir, timeout_ms)

        coros = [worker(t) for t in tasks]
        for f in asyncio.as_completed(coros):
            res = await f
            results.append(res)
        await browser.close()

    return results


# ------------------------
# PDF Parsing and Firestore Upload (adapted from upload-coaches.py)
# ------------------------

def extract_and_format_phone(line: str, area_code: Optional[str]) -> Optional[str]:
    phone_patterns = [
        r'\(\d{3}\)\s*\d{3}-\d{4}',
        r'\(\d{3}\)\s*\d{3}\.\d{4}',
        r'\d{3}-\d{3}-\d{4}',
        r'\d{3}\.\d{3}\.\d{4}',
        r'\d{3}\s+\d{3}-\d{4}',
        r'\d{3}-\d{4}',
        r'\d{3}\.\d{4}',
        r'\b\d{7}\b'
    ]
    for pattern in phone_patterns:
        match = re.search(pattern, line)
        if match:
            phone = match.group().strip()
            if area_code and (re.match(r'^\d{3}-\d{4}$', phone) or re.match(r'^\d{3}\.\d{4}$', phone) or re.match(r'^\d{7}$', phone)):
                if re.match(r'^\d{7}$', phone):
                    phone = phone[:3] + '-' + phone[3:]
                return f"({area_code}) {phone}"
            elif re.match(r'^\d{3}-\d{3}-\d{4}$', phone):
                area = phone[:3]
                number = phone[4:]
                return f"({area}) {number}"
            elif re.match(r'^\d{3}\s+\d{3}-\d{4}$', phone):
                parts = phone.split()
                area = parts[0]
                number = parts[1]
                return f"({area}) {number}"
            elif re.match(r'^\(\d{3}\)', phone):
                return phone
            else:
                return phone
    return None


def detect_pdf_info(path: str, text_content: str) -> Dict[str, str]:
    pdf_info = {
        'university': '',
        'organization': '',
        'location': '',
        'source': ''
    }
    filename = os.path.basename(path).lower()
    if 'bryant' in filename:
        pdf_info['university'] = 'Bryant'
        pdf_info['organization'] = "Bryant University Athletics"
        pdf_info['location'] = 'Smithfield, Rhode Island'
        pdf_info['source'] = "Bryant University Men's Soccer Coaches Directory"
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
    return pdf_info


def parse_pdf(path: str, output_txt: Optional[str] = None) -> Tuple[List[Dict[str, str]], Dict[str, str]]:
    import pdfplumber

    entries: List[Dict[str, str]] = []
    all_lines: List[str] = []
    area_code: Optional[str] = None

    if path.lower().endswith('.txt'):
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        with pdfplumber.open(path) as pdf:
            text = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())

    area_code_patterns = [
        r'Area Code \((\d{3})\)',
        r'Area Code: \((\d{3})\)',
        r'Area Code (\d{3})',
        r'Area Code: (\d{3})',
        r'\((\d{3})\) area code'
    ]
    for pattern in area_code_patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            area_code = m.group(1)
            break

    pdf_info = detect_pdf_info(path, text)
    lines = text.splitlines()

    single_line_entries: List[Dict[str, str]] = []
    current_sport_section: Optional[str] = None
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        sport_section_match = re.match(r'^([A-Z\s&]+(?:\([^)]+\))?)$', line_stripped)
        if sport_section_match and any(sport in line_stripped.lower() for sport in [
            'baseball','basketball','soccer','football','swimming','volleyball','lacrosse','track','field hockey','cross country','softball'
        ]):
            current_sport_section = line_stripped
            continue
        # Strip any embedded hyperlinks from names (e.g., 'Dr. G. Anthony Grant' linked)
        line = re.sub(r'https?://\S+', '', line)
        m = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
        if not m:
            continue
        if 'coach' not in line.lower():
            continue
        email = m.group()
        name_part = line[:m.start()].strip()
        phone_number = extract_and_format_phone(line, area_code)
        all_lines.append(line.strip())
        tokens = name_part.split()
        if tokens and tokens[0].lower() in ("dr.", "dr"):
            tokens = tokens[1:]
        first_name = tokens[0] if tokens else ""
        last_name = tokens[1] if len(tokens) > 1 else ""
        username = email.split("@", 1)[0]
        e = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'username': username,
            'full_line': line.strip(),
            'role': 'coach',
            'sport_section': current_sport_section,
        }
        if phone_number:
            e['phone'] = phone_number
        single_line_entries.append(e)

    if not single_line_entries:
        for i, line in enumerate(lines):
            email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
            if not email_match:
                continue
            email = email_match.group()
            username = email.split("@", 1)[0]
            coach_title = ""
            coach_name = ""
            phone_number = None
            for j in range(1, 4):
                if i - j < 0:
                    break
                prev_line = re.sub(r'https?://\S+', '', lines[i - j]).strip()
                if 'coach' in prev_line.lower() and not coach_title:
                    coach_title = prev_line
                    if i - j - 1 >= 0:
                        potential_name_line = lines[i - j - 1].strip()
                        if (potential_name_line and not re.search(r'[\w\.-]+@[\w\.-]+\.\w+', potential_name_line) and not any(k in potential_name_line.lower() for k in ['coaching','staff','soccer','university','2025','/','pm','am','director of']) and len(potential_name_line.split()) >= 2):
                            coach_name = potential_name_line
                    break
            for j in range(1, 3):
                if i + j >= len(lines):
                    break
                next_line = lines[i + j].strip()
                phone_number = extract_and_format_phone(next_line, area_code)
                if phone_number:
                    break
            if coach_title and 'coach' in coach_title.lower():
                name_tokens = coach_name.split() if coach_name else []
                if name_tokens and name_tokens[0].lower() in ("dr.", "dr"):
                    name_tokens = name_tokens[1:]
                first_name = name_tokens[0] if name_tokens else ""
                last_name = " ".join(name_tokens[1:]) if len(name_tokens) > 1 else ""
                e = {
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'username': username,
                    'full_line': f"{coach_name} {coach_title} {email}".strip(),
                    'role': coach_title if coach_title else 'coach',
                }
                if phone_number:
                    e['phone'] = phone_number
                entries.append(e)
    else:
        entries = single_line_entries

    if output_txt and entries:
        with open(output_txt, 'w', encoding='utf-8') as f:
            f.write(f"COACH ENTRIES FOUND - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"Total coaches found: {len(entries)}\n\n")
            f.write("PARSED ENTRIES:\n")
            f.write("-" * 40 + "\n")
            for i, entry in enumerate(entries, 1):
                f.write(f"{i}. {entry['first_name']} {entry['last_name']}\n")
                f.write(f"   Email: {entry['email']}\n")
                f.write(f"   Username: {entry['username']}\n")
                if 'phone' in entry:
                    f.write(f"   Phone: {entry['phone']}\n")
                f.write(f"   Original line: {entry['full_line']}\n\n")
            f.write("\n" + "=" * 60 + "\n")
            f.write("RAW LINES WITH 'COACH' KEYWORD:\n")
            f.write("-" * 40 + "\n")
            for line in all_lines:
                f.write(f"• {line}\n")

    return entries, pdf_info


def is_low_quality_entries(entries: List[Dict[str, str]]) -> Tuple[bool, List[Dict[str, str]]]:
    """
    Heuristic to flag low-quality parsing results.
    Criteria:
      - Missing first OR last name
      - Email missing or malformed
      - Full line contains privacy/cookie/consent noise
    Flags if >= 50% entries are invalid or if no valid names found.
    Returns (low_quality, sample_bad_entries)
    """
    if not entries:
        return True, []

    noise_keywords = [
        'privacy policy', 'do not sell', 'do not share', 'use cookies',
        'ad blocker', 'your information', 'tracking technologies', 'consent'
    ]
    bad: List[Dict[str, str]] = []
    for e in entries:
        first_ok = bool((e.get('first_name') or '').strip())
        last_ok  = bool((e.get('last_name') or '').strip())
        email    = (e.get('email') or '').strip()
        email_ok = bool(email and '@' in email and '.' in email.split('@')[-1])
        line     = (e.get('full_line') or '').lower()
        noisy    = any(k in line for k in noise_keywords)
        if (not first_ok or not last_ok) or not email_ok or noisy:
            bad.append(e)
    ratio_bad = len(bad) / max(1, len(entries))
    low_quality = ratio_bad >= 0.5 or (len(entries) > 0 and len(bad) == len(entries))
    return low_quality, bad[:5]


def map_to_coach_profile(entry: Dict[str, str], pdf_info: Optional[Dict[str, str]] = None) -> Dict[str, object]:
    sports: List[str] = []
    sport_section = (entry.get('sport_section') or '').lower()
    role_text = (entry.get('full_line') or '').lower()
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
    if not sports:
        sport_keywords = {
            'soccer': 'Soccer',
            'football': 'Soccer',
            "men's soccer": 'Soccer',
            'mens soccer': 'Soccer',
            'goalkeeper': 'Soccer',
            'goalie': 'Soccer',
            'midfielder': 'Soccer',
            'defender': 'Soccer',
            'forward': 'Soccer',
            'striker': 'Soccer',
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
    default_sport: Optional[str] = 'Soccer'
    if pdf_info:
        if 'bryant' in (pdf_info.get('university') or '').lower() and 'soccer' in (pdf_info.get('source') or '').lower():
            default_sport = 'Soccer'
        elif 'rowan' in (pdf_info.get('university') or '').lower():
            default_sport = None
    if not sports and default_sport:
        sports = [default_sport]
    elif not sports:
        sports = ['General Athletics']
    role_part = entry.get('full_line', '')
    if 'coach' in role_part.lower():
        role_match = re.search(r'(Head Coach|Assistant Coach|Defensive Coordinator|[A-Za-z\s]+Coach)', role_part, re.IGNORECASE)
        role = role_match.group(1) if role_match else 'Coach'
    else:
        role = 'Coach'
    if pdf_info:
        location = pdf_info.get('location', 'New Jersey')
        organization = pdf_info.get('organization', 'University Athletics')
        source_url = pdf_info.get('source', 'University Athletics Directory')
    else:
        location = 'New Jersey'
        organization = 'University Athletics'
        source_url = 'University Athletics Directory'
    coach_profile = {
        'username': entry['username'],
        'displayName': f"{entry['first_name']} {entry['last_name']}".strip(),
        'email': entry['email'],
        'bio': f"Experienced {role.lower()} specializing in {', '.join(sports).lower()}.",
        'sports': sports,
        'experience': 5,
        'certifications': [],
        'hourlyRate': 0,
        'location': location,
        'availability': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'specialties': sports,
        'languages': ['English'],
        'organization': organization,
        'role': role,
        'gender': '',
        'ageGroup': ['Adult', 'Teen', 'Youth'],
        'sourceUrl': source_url,
        'averageRating': 0,
        'totalReviews': 0,
        'isVerified': False,
        'isPublic': True,
        'hasActiveServices': False,
        'profileImage': '',
        'website': '',
        'socialMedia': {
            'instagram': '',
            'twitter': '',
            'linkedin': ''
        },
        'createdAt': None,
        'updatedAt': None,
        'profileCompleted': False,
        'isClaimed': False,
        'userId': None,
        'claimedAt': None,
        'verificationStatus': 'pending'
    }
    if 'phone' in entry:
        coach_profile['phoneNumber'] = entry['phone']
    return coach_profile


def upload_to_firestore(entries: List[Dict[str, str]], key_path: str, pdf_info: Optional[Dict[str, str]] = None, collection: str = 'coaches', dry_run: bool = False):
    if dry_run:
        print("DRY RUN MODE - No actual upload to Firestore")
        for e in entries:
            coach_profile = map_to_coach_profile(e, pdf_info)
            phone_info = f" | Phone: {coach_profile.get('phoneNumber', 'N/A')}" if 'phoneNumber' in coach_profile else ""
            print(f"[DRY RUN] Would create unclaimed coach profile: {coach_profile['displayName']} ({coach_profile['email']}) → {collection}/{coach_profile['username']}{phone_info}")
        return

    import firebase_admin
    from firebase_admin import credentials, firestore

    cred = credentials.Certificate(key_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    uploaded_count = 0
    skipped_count = 0
    for e in entries:
        try:
            coach_profile = map_to_coach_profile(e, pdf_info)
            username = coach_profile['username']
            coach_ref = db.collection(collection).document(username)
            existing_coach = coach_ref.get()
            if existing_coach.exists:
                existing_data = existing_coach.to_dict()
                if existing_data.get('isClaimed', False):
                    print(f"⏭️  Skipped {coach_profile['email']} - already claimed by user")
                    skipped_count += 1
                    continue
                else:
                    print(f"🔄 Updating unclaimed profile for {coach_profile['email']}")
            # Ensure server timestamps
            coach_profile['createdAt'] = firestore.SERVER_TIMESTAMP
            coach_profile['updatedAt'] = firestore.SERVER_TIMESTAMP
            coach_ref.set(coach_profile)
            phone_info = f" | Phone: {coach_profile.get('phoneNumber', 'N/A')}" if 'phoneNumber' in coach_profile else ""
            status = "Updated" if existing_coach.exists else "Created"
            print(f"✔ {status} unclaimed coach profile: {coach_profile['displayName']} ({coach_profile['email']}) → {collection}/{username}{phone_info}")
            uploaded_count += 1
        except Exception as error:
            print(f"❌ Error processing {e.get('email','?')}: {error}")

    print("\n📊 Upload Summary:")
    print(f"✔ {uploaded_count} coach profiles created/updated")
    print(f"⏭️  {skipped_count} profiles skipped (already claimed)")
    print(f"📧 Coaches can now claim their profiles during onboarding using their email address")


# ------------------------
# Orchestration
# ------------------------

def collect_state_folder(base_dir: Path, state: Optional[str], state_folder: Optional[Path]) -> Path:
    if state_folder:
        return state_folder.resolve()
    if not state:
        sys.exit("ERROR: Provide either --state or --state-folder.")
    return (base_dir / 'pdfs' / state.lower()).resolve()


def main():
    parser = argparse.ArgumentParser(description="Print athletics staff directories from CSV and upload parsed coaches to Firestore.")
    parser.add_argument("--state", help="Two-letter state code (e.g., pa). If provided, output folder is pdfs/<state>.")
    parser.add_argument("--state-folder", help="Explicit state folder path to place PDFs in and to discover CSV from.")
    parser.add_argument("--csv", help="Path to CSV. If not provided, will search the state folder for a .csv file.")
    parser.add_argument("--key", help="Path to Firebase Admin JSON key (optional for dry-run)")
    parser.add_argument("--collection", default="coaches", help="Firestore collection to write documents into (default: coaches)")
    parser.add_argument("--concurrency", type=int, default=4, help="Parallel renderers (default: 4)")
    parser.add_argument("--timeout", type=int, default=30000, help="Page timeout in ms (default: 30000)")
    parser.add_argument("--zip", action="store_true", help="Zip the state folder after printing")
    parser.add_argument("--dry-run", action="store_true", help="Parse and show results without uploading to Firestore")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    base_dir = script_dir  # this script lives inside reviewmycoach-python-venv

    # Resolve state folder
    out_dir = collect_state_folder(base_dir, args.state, Path(args.state_folder) if args.state_folder else None)
    ensure_dir(out_dir)

    # Resolve CSV
    csv_path: Optional[Path] = Path(args.csv).resolve() if args.csv else None
    if not csv_path:
        csv_path = find_csv_in_folder(out_dir)
    if not csv_path or not csv_path.exists():
        sys.exit("ERROR: CSV not provided and not found in state folder.")

    print(f"-> Reading CSV: {csv_path}")
    print(f"-> Output PDFs to: {out_dir}")

    rows = read_rows(csv_path)

    t0 = time.time()
    try:
        results = asyncio.run(print_all_from_csv(rows, out_dir, concurrency=max(1, args.concurrency), timeout_ms=args.timeout))
    except KeyboardInterrupt:
        sys.exit("Interrupted.")
    except Exception as e:
        sys.exit(f"Fatal error during printing: {e}")

    ok = [r for r in results if r.get('status') == 'ok']
    skipped = [r for r in results if r.get('status') == 'skipped']
    err = [r for r in results if r.get('status') not in ('ok', 'skipped')]
    print(f"\nPrinting completed in {time.time()-t0:.1f}s")
    print(f"Success: {len(ok)} | Skipped: {len(skipped)} | Errors: {len(err)}")
    if ok:
        print("\nResolved URLs used:")
        for r in ok:
            print(f"- {Path(r['outfile']).name}: {r.get('url', '')}")
    if err:
        print("\nErrors:")
        for r in err:
            print(f"- {r['url']} -> {r['error']}")
    if skipped:
        print("\nSkipped:")
        for r in skipped:
            tried = ", ".join(r.get('attempted_urls', [])) if isinstance(r.get('attempted_urls'), list) else ""
            suffix = f" (tried: {tried})" if tried else ""
            print(f"- {r['url']} -> {r['error']}{suffix}")

    # Optional zip
    if args.zip and ok:
        zip_path = (out_dir.parent / f"{out_dir.name}.zip").resolve()
        print(f"\nZipping PDFs to: {zip_path}")
        zip_folder(out_dir, zip_path)

    # Prepare issues folder
    issues_dir = out_dir / "issues"
    ensure_dir(issues_dir)

    # Record skipped/errored links into issues summary
    if skipped:
        with (issues_dir / "skipped-links.txt").open("w", encoding="utf-8") as f:
            for r in skipped:
                tried = ", ".join(r.get('attempted_urls', [])) if isinstance(r.get('attempted_urls'), list) else ""
                f.write(f"{Path(r.get('outfile', 'unknown.pdf')).name} :: {r.get('url','')} :: {r.get('error','')}\n")
                if tried:
                    f.write(f"  tried: {tried}\n")
                f.write("\n")

    # Parse all successfully generated PDFs and upload
    print("\nParsing printed PDFs and preparing upload entries...")
    all_entries: List[Dict[str, str]] = []
    seen_usernames: set = set()
    zero_coaches: List[str] = []
    low_quality_colleges: List[str] = []
    for r in ok:
        pdf_file = Path(r['outfile'])
        # Write a small review file next to the PDF for auditing
        txt_out = pdf_file.with_suffix("")
        txt_out = txt_out.parent / f"coaches_filtered_{txt_out.name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        try:
            entries, pdf_info = parse_pdf(str(pdf_file), str(txt_out))
        except Exception as e:
            print(f"❌ Parse failed for {pdf_file.name}: {e}")
            # Record as issue
            with (issues_dir / f"{pdf_file.stem} - PARSE_ERROR.txt").open("w", encoding="utf-8") as f:
                f.write(f"Parse failed for {pdf_file.name}: {e}\n")
            continue
        # Flag zero-coach PDFs
        if len(entries) == 0:
            zero_coaches.append(pdf_file.name)
            with (issues_dir / f"{pdf_file.stem} - NO_COACHES.txt").open("w", encoding="utf-8") as f:
                f.write(f"No coach entries parsed from {pdf_file.name}\n")
            continue

        # Low-quality detection
        low_quality, bad_sample = is_low_quality_entries(entries)
        if low_quality:
            low_quality_colleges.append(pdf_file.name)
            issue_file = issues_dir / f"{pdf_file.stem} - LOW_QUALITY.txt"
            with issue_file.open("w", encoding="utf-8") as f:
                f.write(f"Low-quality parsing detected in {pdf_file.name}.\n")
                f.write(f"Sample problematic entries ({len(bad_sample)}):\n")
                for bx in bad_sample:
                    f.write(f"- {bx.get('full_line','').strip()}\n")
            # Copy the filtered output for review if it exists
            try:
                if txt_out.exists():
                    shutil.copy2(txt_out, issues_dir / txt_out.name)
            except Exception:
                pass

        for e in entries:
            if e['username'] in seen_usernames:
                continue
            seen_usernames.add(e['username'])
            all_entries.append(e)

    print(f"✔ Total coach entries prepared: {len(all_entries)}")
    # Write issues summary
    summary_path = issues_dir / "summary.txt"
    with summary_path.open("w", encoding="utf-8") as f:
        f.write(f"Printing results: Success={len(ok)} Skipped={len(skipped)} Errors={len(err)}\n")
        if skipped:
            f.write("\nSkipped/Failed links:\n")
            for r in skipped:
                tried = ", ".join(r.get('attempted_urls', [])) if isinstance(r.get('attempted_urls'), list) else ""
                f.write(f"- {Path(r.get('outfile','unknown.pdf')).name}: {r.get('url','')} -> {r.get('error','')}\n")
                if tried:
                    f.write(f"  tried: {tried}\n")
        if zero_coaches:
            f.write("\nPDFs with zero coaches detected:\n")
            for name in zero_coaches:
                f.write(f"- {name}\n")
        if low_quality_colleges:
            f.write("\nPDFs flagged as low-quality parsing:\n")
            for name in low_quality_colleges:
                f.write(f"- {name}\n")

    if len(all_entries) == 0:
        print("No coach entries parsed from PDFs. Nothing to upload.")
        return

    # Upload
    if args.dry_run:
        upload_to_firestore(all_entries, key_path=args.key or "", pdf_info=None, collection=args.collection, dry_run=True)
    else:
        if not args.key:
            print("No Firebase key provided. Use --dry-run or provide --key to upload.")
            return
        upload_to_firestore(all_entries, key_path=args.key, pdf_info=None, collection=args.collection, dry_run=False)


if __name__ == "__main__":
    main()


