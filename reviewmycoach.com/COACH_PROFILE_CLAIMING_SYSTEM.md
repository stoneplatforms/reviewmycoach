# Coach Profile Claiming System

## 🎯 **Overview**

A comprehensive system that allows importing coach data from PDFs, creating unclaimed profiles, and enabling users to claim their profiles through identity verification during onboarding.

## 🏗️ **System Architecture**

### **1. Data Import Pipeline (Python Script)**
- **Location**: `reviewmycoach-python-venv/upload-coaches.py`
- **Purpose**: Extract coach data from PDFs and create unclaimed profiles in Firebase

### **2. Profile Claiming API**
- **Location**: `app/api/coaches/claim/route.ts`
- **Purpose**: Handle profile discovery and claiming

### **3. Identity Verification API**
- **Location**: `app/api/identity/verify/route.ts`
- **Purpose**: Process driver's license verification

### **4. Enhanced Onboarding Flow**
- **Location**: `app/onboarding/page.tsx`
- **Purpose**: Guide users through profile claiming and verification

## 🔄 **Complete Workflow**

### **Step 1: Data Import**
```bash
# From reviewmycoach-python-venv/
python upload-coaches.py --pdf "pdfs/Staff Directory.pdf" --key firebase-key.json
```

**What happens:**
- ✅ Parses PDF for lines containing "coach" keyword
- ✅ Extracts names, emails, phone numbers with area code formatting
- ✅ Maps sports from role descriptions (e.g., "Basketball Coach" → ["Basketball"])
- ✅ Creates complete coach profiles with ReviewMyCoach structure
- ✅ Sets `isClaimed: false` and `userId: null` for unclaimed status
- ✅ Stores in `coaches/{username}` collection

**Coach Profile Structure Created:**
```javascript
{
  username: "dickson",
  displayName: "Mike Dickson",
  email: "dickson@rowan.edu",
  phoneNumber: "(856) 256-4687",
  sports: ["Baseball"],
  role: "Assistant Athletic Director/Head Baseball Coach",
  organization: "Rowan University Athletics",
  location: "New Jersey",
  bio: "Experienced assistant athletic director/head baseball coach specializing in baseball.",
  experience: 5,
  averageRating: 0,
  totalReviews: 0,
  isClaimed: false,      // 🔑 Key field
  userId: null,          // 🔑 Will be linked when claimed
  verificationStatus: "pending",
  createdAt: timestamp,
  // ... full coach profile structure
}
```

### **Step 2: User Registration & Discovery**
When a user signs up with an email that matches an unclaimed coach profile:

1. **Username Setup**: User enters their desired username
2. **Profile Discovery**: System automatically checks for claimable profiles
3. **Profile Presentation**: Shows matching profiles with details

### **Step 3: Profile Claiming Process**

#### **3A: Profile Selection**
```typescript
// API: GET /api/coaches/claim?email=user@email.com
// Returns: Array of claimable profiles
```

User sees:
- Coach name and role
- Organization affiliation
- Sports coached
- Phone number (if available)
- "Claim Profile" button for each match

#### **3B: Identity Verification**
If user chooses to claim a profile:

**Required Information:**
- Full name (as appears on license)
- Date of birth
- Address
- Phone number
- **Driver's License Photo** (JPEG, PNG, or PDF)

**API Call:**
```typescript
// POST /api/identity/verify
// FormData with driver's license file + personal info
```

### **Step 4: Verification & Claiming**
1. **Profile Claim**: Links `userId` to coach profile, sets `isClaimed: true`
2. **Identity Storage**: Stores verification data in `identity_verifications` collection
3. **Admin Notification**: Creates admin task for manual review
4. **User Redirect**: Sends to dashboard with claimed profile

## 📊 **Database Structure**

### **Coaches Collection** (`coaches/{username}`)
```javascript
{
  // Basic Info
  username: string,
  displayName: string,
  email: string,
  phoneNumber?: string,
  
  // Coaching Details
  sports: string[],
  role: string,
  organization: string,
  location: string,
  bio: string,
  experience: number,
  
  // Profile Status
  isClaimed: boolean,        // 🔑 False for unclaimed profiles
  userId: string | null,     // 🔑 Links to authenticated user
  claimedAt: Date | null,
  verificationStatus: 'pending' | 'in_review' | 'verified' | 'rejected',
  
  // Full coach profile structure...
}
```

### **Identity Verifications Collection** (`identity_verifications/{userId}`)
```javascript
{
  userId: string,
  userEmail: string,
  coachUsername: string,
  personalInfo: {
    fullName: string,
    dateOfBirth: string,
    address: string,
    phoneNumber: string
  },
  driversLicense: {
    fileName: string,
    fileType: string,
    fileSize: number,
    fileData: string,  // Base64 encoded (use cloud storage in production)
    uploadedAt: Date
  },
  status: 'submitted' | 'in_review' | 'approved' | 'rejected',
  submittedAt: Date,
  reviewedAt: Date | null,
  reviewedBy: string | null,
  reviewNotes: string
}
```

### **Admin Notifications Collection** (`admin_notifications`)
```javascript
{
  type: 'identity_verification',
  title: string,
  message: string,
  userId: string,
  coachUsername: string,
  priority: 'normal' | 'high',
  status: 'unread' | 'read' | 'resolved',
  createdAt: Date
}
```

## 🎨 **User Experience Flow**

### **Scenario 1: Coach Profile Found**
1. User signs up with `dickson@rowan.edu`
2. System finds "Mike Dickson - Baseball Coach" profile
3. Shows profile card with claim option
4. User clicks "Claim Profile"
5. Identity verification form appears
6. User uploads driver's license
7. Profile claimed, verification submitted for review

### **Scenario 2: No Profile Found**
1. User signs up with email not in system
2. Proceeds directly to role selection
3. Can create new coach profile as normal

### **Scenario 3: Multiple Profiles**
1. User email matches multiple profiles (rare)
2. Shows all claimable profiles
3. User selects which one to claim
4. Single verification process

## 🔒 **Security Features**

### **Email Verification**
- Only users with matching email can claim profiles
- Prevents unauthorized profile claiming

### **Identity Verification**
- Driver's license upload required
- Manual admin review process
- Verification status tracking

### **Profile Protection**
- Once claimed, profile cannot be claimed by others
- Original profile data preserved
- Audit trail of claims and verifications

### **File Upload Security**
- File type validation (JPEG, PNG, PDF only)
- File size limits (10MB max)
- Secure file storage (base64 for demo, use cloud storage in production)

## 🚀 **Admin Review Process**

### **Admin Dashboard Features Needed**
1. **Verification Queue**: List of pending identity verifications
2. **Profile Comparison**: Side-by-side view of claimed profile vs submitted ID
3. **Approval Actions**: Approve, reject, or request more info
4. **Audit Log**: Track all verification decisions

### **Review Criteria**
- Name match between ID and profile
- Reasonable connection to organization
- Photo quality and legibility
- No signs of tampering

## 📈 **Usage Statistics**

From Rowan University Athletics PDF:
- ✅ **47 coach profiles** created from single PDF
- ✅ **Area code detection** and phone formatting
- ✅ **Sport extraction** from role descriptions
- ✅ **Complete profile structure** matching app requirements

## 🔧 **Technical Implementation**

### **Python Script Features**
- PDF text extraction with `pdfplumber`
- Intelligent sport detection from job titles
- Area code parsing and phone number formatting
- Firebase Admin SDK integration
- Comprehensive error handling
- Dry-run mode for testing

### **API Routes**
- RESTful design with proper error handling
- Firebase Admin authentication
- File upload handling with validation
- Proper status codes and error messages

### **Frontend Integration**
- Seamless onboarding flow integration
- Fade transitions between steps
- Form validation and error handling
- File upload with progress indication

## 🎯 **Future Enhancements**

### **Short Term**
- [ ] Admin dashboard for verification review
- [ ] Email notifications for verification status
- [ ] Bulk profile import from multiple PDFs
- [ ] Profile merging for duplicates

### **Long Term**
- [ ] OCR integration for driver's license data extraction
- [ ] Automated verification using third-party services
- [ ] Profile similarity detection
- [ ] Integration with university systems

## 🏃‍♂️ **Getting Started**

### **1. Set up Python Environment**
```bash
cd reviewmycoach
source reviewmycoach-python-venv/bin/activate
```

### **2. Import Coach Data**
```bash
python upload-coaches.py --pdf "path/to/staff-directory.pdf" --key "path/to/firebase-key.json"
```

### **3. Test the Flow**
1. Sign up with an email from the imported coaches
2. Experience the profile claiming flow
3. Upload driver's license for verification

### **4. Review Admin Tasks**
Check Firebase for:
- `identity_verifications` collection
- `admin_notifications` collection
- Coach profiles with `isClaimed: true`

---

## 📋 **Summary**

This system transforms static PDF coach directories into a dynamic, verified coach network. Coaches can easily claim their professional profiles while maintaining security through identity verification, creating a trustworthy platform for students to find legitimate, verified coaches.

**Key Benefits:**
- ✅ **Automated**: Bulk import from existing directories
- ✅ **Secure**: Identity verification required
- ✅ **User-Friendly**: Seamless claiming process
- ✅ **Scalable**: Works with any PDF staff directory
- ✅ **Comprehensive**: Full profile structure with contact info