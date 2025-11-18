# ReviewMyCoach API Documentation

## Overview

This document outlines the API endpoints and features for the ReviewMyCoach platform, focusing on coach profiles, reviews, and tag management.

## Coach Profile Features

The coach profile pages now display:

- ✅ **Coach Name** - Display name with verification status
- ✅ **Credentials** - Enhanced certification display with visual badges
- ✅ **Star Rating** - Visual star rating system with average scores
- ✅ **Text Reviews** - Full review system with user avatars and sport tags
- ✅ **Average Score** - Prominently displayed average rating
- ✅ **Tags** - Sports, specialties, and certification tags
- ✅ **Rating Distribution** - Histogram showing rating breakdown

## API Endpoints

### Coach Management

#### Get Coach Profile
```
GET /api/coaches/[id]
```
Fetches a single coach profile with all details.

**Response:**
```json
{
  "id": "coach_id",
  "displayName": "John Doe",
  "bio": "Professional tennis coach...",
  "sports": ["Tennis", "Table Tennis"],
  "certifications": ["USPTA Certified", "CPR Certified"],
  "averageRating": 4.8,
  "totalReviews": 25,
  "specialties": ["Youth Development", "Elite Performance"],
  "hourlyRate": 75,
  "location": "Los Angeles, CA",
  "isVerified": true
}
```

#### Update Coach Profile
```
PUT /api/coaches/[id]
Authorization: Bearer <token>
```
Updates coach profile information.

**Request Body:**
```json
{
  "displayName": "Updated Name",
  "bio": "Updated bio...",
  "sports": ["Tennis"],
  "certifications": ["New Certification"],
  "hourlyRate": 80,
  "specialties": ["Updated Specialty"]
}
```

#### Search Coaches
```
GET /api/coaches?sports=Tennis,Basketball&location=LA&minRating=4.0&isVerified=true
```

**Query Parameters:**
- `sports` - Comma-separated list of sports
- `location` - Location filter
- `minRating` - Minimum rating filter
- `maxRate` - Maximum hourly rate
- `isVerified` - Filter verified coaches only
- `search` - Text search in name, bio, specialties
- `sortBy` - Sort field (averageRating, hourlyRate, experience)
- `sortOrder` - Sort direction (asc, desc)
- `limit` - Results per page (default: 20)

### Review Management

#### Get Coach Reviews
```
GET /api/coaches/[id]/reviews?limit=10
```
Fetches reviews for a specific coach.

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_id",
      "studentId": "user_id",
      "studentName": "Jane Smith",
      "rating": 5,
      "reviewText": "Excellent coach! Really helped improve my game.",
      "sport": "Tennis",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Review
```
POST /api/coaches/[id]/reviews
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rating": 5,
  "reviewText": "Great coaching experience!",
  "sport": "Tennis"
}
```

**Validation Rules:**
- Rating: 1-5 (required)
- Review text: 10-1000 characters (required)
- Sport: Optional
- One review per user per coach

### Tag Management

#### Get Tags
```
GET /api/tags?category=sport&activeOnly=true
```

**Query Parameters:**
- `category` - Filter by category (sport, specialty, certification, skill)
- `activeOnly` - Show only active tags

**Response:**
```json
{
  "tags": [
    {
      "id": "tag_id",
      "name": "Tennis",
      "category": "sport",
      "count": 15,
      "isActive": true
    }
  ]
}
```

#### Create Tag (Admin Only)
```
POST /api/tags
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New Sport",
  "category": "sport"
}
```

#### Initialize Predefined Tags
```
POST /api/tags/initialize
Authorization: Bearer <admin_token>
```
Initializes the tags collection with predefined sports, specialties, and certifications.

## Firebase Structure

### Collections

#### coaches
```
{
  userId: string,
  displayName: string,
  bio: string,
  sports: string[],
  certifications: string[],
  specialties: string[],
  averageRating: number,
  totalReviews: number,
  hourlyRate: number,
  location: string,
  isVerified: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### coaches/{coachId}/reviews
```
{
  studentId: string,
  studentName: string,
  rating: number,
  reviewText: string,
  sport?: string,
  createdAt: timestamp
}
```

#### tags
```
{
  name: string,
  category: 'sport' | 'specialty' | 'certification' | 'skill',
  count: number,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Features

### Automatic Rating Calculation
When a new review is created, the system automatically:
1. Calculates the new average rating
2. Updates the total review count
3. Updates the coach's profile with new ratings

### Enhanced UI Components
- **Rating Distribution Chart** - Visual histogram of ratings
- **Enhanced Certification Display** - Visual badges with icons
- **User Avatars** - Generated from user initials
- **Sport Tags** - Color-coded tags for different sports
- **Empty States** - Engaging empty states for no reviews

### Search and Filtering
- **Text Search** - Search across coach names, bios, specialties
- **Multi-Sport Filtering** - Filter by multiple sports
- **Rating Filtering** - Minimum rating requirements
- **Price Range Filtering** - Filter by hourly rate ranges
- **Verification Status** - Filter verified coaches only

## Security

### Authentication
- All write operations require valid Firebase auth tokens
- Review creation requires user authentication
- Profile updates require ownership verification

### Authorization
- Users can only create one review per coach
- Users can only update their own reviews
- Coaches can only update their own profiles
- Admin operations require admin role verification

### Validation
- Rating values are constrained to 1-5
- Review text length is validated (10-1000 characters)
- Coach profile fields are validated and sanitized
- Duplicate review prevention

## Indexes

The following Firestore indexes are recommended for optimal performance:

- `coaches` collection: sports (array-contains-any) + averageRating (desc)
- `coaches` collection: location (asc) + averageRating (desc)
- `coaches` collection: isVerified (asc) + averageRating (desc)
- `reviews` subcollection: createdAt (desc)
- `tags` collection: category (asc) + name (asc)

## Usage Examples

### Frontend Integration

```javascript
// Fetch coach profile
const response = await fetch(`/api/coaches/${coachId}`);
const coach = await response.json();

// Create a review
const reviewResponse = await fetch(`/api/coaches/${coachId}/reviews`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    rating: 5,
    reviewText: 'Great coach!',
    sport: 'Tennis'
  })
});

// Search coaches
const searchResponse = await fetch('/api/coaches?sports=Tennis&minRating=4.0');
const { coaches } = await searchResponse.json();
```

### Error Handling
All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include descriptive messages:
```json
{
  "error": "Rating must be between 1 and 5"
}
```

## Deployment Notes

1. **Environment Variables**: Ensure all Firebase configuration variables are set
2. **Firestore Rules**: Deploy the updated security rules
3. **Indexes**: Create the recommended Firestore indexes
4. **Initialize Tags**: Run the tag initialization endpoint to populate predefined tags
5. **Authentication**: Configure Firebase Auth with appropriate providers

## Future Enhancements

Potential future features:
- Real-time review updates
- Advanced search with fuzzy matching
- Review moderation system
- Bulk operations for admin users
- Analytics and reporting endpoints
- Image upload for coach profiles
- Review responses from coaches 