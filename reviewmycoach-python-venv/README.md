# Coach Upload Script

This Python script extracts coach information from PDF files and uploads them to Firestore. It filters for entries containing the keyword "coach" in their title/line.

## Setup

1. The virtual environment is already created with dependencies installed
2. Activate the environment: `source reviewmycoach-python-venv/bin/activate`

## Usage

### Basic Usage (Dry Run + TXT Output)
```bash
python upload-coaches.py --pdf path/to/staff-directory.pdf --dry-run
```

### With Custom TXT Output
```bash
python upload-coaches.py --pdf path/to/staff-directory.pdf --output-txt coaches_found.txt --dry-run
```

### Upload to Firestore
```bash
python upload-coaches.py --pdf path/to/staff-directory.pdf --key path/to/firebase-key.json
```

### Upload to Custom Collection
```bash
python upload-coaches.py --pdf path/to/staff-directory.pdf --key path/to/firebase-key.json --collection coaches
```

## Command Line Arguments

- `--pdf` (required): Path to the PDF file containing staff directory
- `--key` (optional): Path to Firebase Admin JSON key file (required for actual upload)
- `--collection` (default: "users"): Firestore collection name
- `--output-txt` (optional): Path for TXT output file (auto-generated if not specified)
- `--dry-run`: Parse and show results without uploading to Firestore

## Key Features

### Coach Filtering
- Only processes lines containing "coach" keyword (case-insensitive)
- Filters out non-coach entries automatically

### TXT Output
- Creates a detailed text file with all filtered results
- Shows parsed entries with names, emails, and usernames
- Includes original PDF lines for verification
- Automatically timestamped filename if not specified

### Firestore Integration
- Uploads coach data as user documents
- Adds "role": "coach" field to each entry
- Supports custom collections
- Dry run mode for testing

### Data Structure
Each coach entry contains:
- `first_name`: Extracted first name
- `last_name`: Extracted last name  
- `email`: Email address from PDF
- `username`: Username (email prefix)
- `role`: Set to "coach"

## Example Output

The TXT file will contain:
```
COACH ENTRIES FOUND - 2024-01-15 10:30:00
============================================================

Total coaches found: 5

PARSED ENTRIES:
----------------------------------------
1. John Smith
   Email: john.smith@university.edu
   Username: john.smith
   Original line: Dr. John Smith, Basketball Coach, john.smith@university.edu

2. Sarah Johnson
   Email: s.johnson@university.edu
   Username: s.johnson
   Original line: Sarah Johnson, Swimming Coach, s.johnson@university.edu

...

============================================================
RAW LINES WITH 'COACH' KEYWORD:
----------------------------------------
• Dr. John Smith, Basketball Coach, john.smith@university.edu
• Sarah Johnson, Swimming Coach, s.johnson@university.edu
...
```

## Notes

- The script looks for email patterns in PDF text and filters by "coach" keyword
- Common prefixes like "Dr." are automatically removed from names
- Original PDF lines are preserved for verification
- TXT output is generated automatically for quick review before Firestore upload