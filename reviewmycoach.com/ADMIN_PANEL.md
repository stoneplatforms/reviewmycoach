# Admin Panel Documentation

## Overview

The ReviewMyCoach admin panel provides comprehensive tools for managing the platform, including review moderation and coach onboarding capabilities.

## Features

### 1. Review Moderation
- **Flagged Reviews**: View all reviews that have been reported by users
- **Review Actions**: 
  - **Approve Review**: Keep the review published (marks report as rejected)
  - **Remove Review**: Delete the review from the platform (marks report as approved)
- **Report Details**: View report reasons, descriptions, and review content
- **Real-time Updates**: Reports are fetched and updated in real-time

### 2. Coach Onboarding
- **Manual Coach Creation**: Add new coaches directly through admin interface
- **Comprehensive Form**: Capture all necessary coach information including:
  - Basic information (name, email, bio, contact details)
  - Professional details (experience, rates, location)
  - Sports and specialties selection
  - Certifications
  - Social media profiles
- **Tag Integration**: Uses existing tag system for consistent categorization

### 3. Access Control
- **Firebase Security Rules**: Admin access is protected by Firestore security rules
- **Role-based Access**: Only users with `role: 'admin'` can access admin features
- **Dashboard Integration**: Admin panel accessible from main dashboard for admin users

## Setup Instructions

### 1. Create an Admin User

**Option A: Manual (Recommended for initial setup)**
1. Create a regular user account through the normal signup process
2. Go to Firebase Console > Firestore Database
3. Navigate to the `users` collection
4. Find your user document
5. Edit the document and change the `role` field to `'admin'`
6. Save the changes

**Option B: Using the utility script**
```javascript
// Run in browser console or Node.js environment
const { createAdminUser } = require('./scripts/create-admin.js');
createAdminUser('your-admin-email@example.com');
```

### 2. Verify Firebase Security Rules

Ensure your `firestore.rules` file includes the admin function:

```javascript
function isAdmin() {
  return isAuthenticated() && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### 3. Initialize Tags (Optional)

To populate the tag system for coach onboarding:

```bash
# Make a POST request to initialize tags
curl -X POST https://your-app.vercel.app/api/tags/initialize \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## API Endpoints

### Reports API (`/api/reports`)

**POST** - Create a new report
```json
{
  "reportedItemType": "review",
  "reportedItemId": "review-id",
  "reason": "Inappropriate Language",
  "description": "Optional additional details"
}
```

**GET** - Fetch all reports (Admin only)
```json
{
  "reports": [
    {
      "id": "report-id",
      "reporterId": "user-id",
      "reportedItemType": "review",
      "reportedItemId": "review-id",
      "reason": "Spam",
      "description": "This looks like spam content",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## File Structure

```
reviewmycoach/
├── app/
│   ├── admin/                          # Admin panel pages
│   │   ├── page.tsx                    # Main admin dashboard
│   │   └── coach-onboarding/
│   │       └── page.tsx                # Coach onboarding form
│   ├── api/
│   │   └── reports/
│   │       └── route.ts                # Reports API endpoint
│   └── components/
│       └── ReportReviewModal.tsx       # Review reporting modal
├── scripts/
│   └── create-admin.js                 # Admin user creation utility
└── ADMIN_PANEL.md                      # This documentation
```

## Usage Guide

### For Users (Reporting Reviews)

1. When viewing reviews, users can click a "Report" button
2. Select a reason for reporting (Spam, Inappropriate Language, etc.)
3. Optionally provide additional details
4. Submit the report

### For Admins (Review Moderation)

1. Log in with an admin account
2. Navigate to `/admin` or click "Admin Panel" from dashboard
3. View pending reports in the "Flagged Reviews" section
4. For each report:
   - Review the flagged content and report reason
   - Choose to either "Approve Review" (keep it) or "Remove Review" (delete it)
   - The report status will be updated accordingly

### For Admins (Coach Onboarding)

1. From the admin panel, click "Add New Coach"
2. Fill out the comprehensive coach information form
3. Select appropriate sports, specialties, and certifications
4. Submit to create the coach profile
5. The coach will be created with a generated ID and can be verified later

## Security Considerations

1. **Admin Role Protection**: Only users with `role: 'admin'` can access admin features
2. **Firebase Rules**: All admin operations are protected by Firestore security rules
3. **Token Verification**: API endpoints verify admin tokens before allowing operations
4. **Input Validation**: All form inputs are validated both client and server-side

## Troubleshooting

### Admin Access Issues
- Verify the user's role is set to 'admin' in Firestore
- Check that Firebase security rules include the `isAdmin()` function
- Ensure the user has completed onboarding

### Report Submission Issues
- Verify the user is authenticated
- Check that the review ID exists
- Ensure the user hasn't already reported the same review

### Coach Creation Issues
- Verify admin permissions
- Check that all required fields are filled
- Ensure tags collection is properly initialized

## Future Enhancements

- Bulk operations for handling multiple reports
- Advanced filtering and search for reports
- Email notifications for report actions
- Analytics dashboard for admin metrics
- Batch coach import functionality
- Review editing capabilities for admins 