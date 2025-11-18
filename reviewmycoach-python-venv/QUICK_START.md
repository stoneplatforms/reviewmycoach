# Quick Start Guide

## ✅ **SETUP COMPLETE!** 

Your Python virtual environment and coach upload script are ready to use!

## 📂 **What's Been Created:**

```
reviewmycoach/
└── reviewmycoach-python-venv/
    ├── upload-coaches.py        # Main script (modified with coach filtering)
    ├── test-sample.py          # Test data generator
    ├── requirements.txt        # Dependencies
    ├── README.md              # Full documentation
    └── QUICK_START.md         # This file
```

## 🚀 **How to Use:**

### 1. Activate the Virtual Environment
```bash
cd reviewmycoach
source reviewmycoach-python-venv/bin/activate
```

### 2. Test with Sample Data (Quick Test)
```bash
cd reviewmycoach-python-venv
python test-sample.py
python upload-coaches.py --pdf [generated-sample-file.txt] --dry-run
```

### 3. Use with Real PDF
```bash
# Dry run (test without uploading)
python upload-coaches.py --pdf path/to/staff-directory.pdf --dry-run

# Upload to Firestore (need Firebase key)
python upload-coaches.py --pdf path/to/staff-directory.pdf --key path/to/firebase-key.json
```

## 🎯 **Key Features Added:**

- ✅ **Coach Filtering**: Only processes entries with "coach" keyword
- ✅ **TXT Output**: Creates detailed text file for review
- ✅ **Dry Run Mode**: Test without uploading to Firestore
- ✅ **Text File Support**: Can process both PDF and TXT files
- ✅ **Auto Timestamps**: Generated files include timestamps
- ✅ **Error Handling**: Graceful handling of missing files/credentials

## 📊 **Example Results:**

From a PDF with 50 staff entries, the script might find:
- 5 Basketball Coaches
- 3 Swimming Coaches  
- 2 Tennis Coaches
- etc.

All filtered automatically and ready for upload to your ReviewMyCoach database!

## 🔧 **Next Steps:**

1. Get your Firebase Admin service account key file
2. Run with real PDF data
3. Review the generated TXT file first
4. Upload to Firestore when satisfied

## 🆘 **Need Help?**

- Check `README.md` for full documentation
- Use `--dry-run` flag to test safely
- TXT output files show exactly what will be uploaded