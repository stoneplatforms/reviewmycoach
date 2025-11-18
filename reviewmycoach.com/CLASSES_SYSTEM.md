# Classes System Documentation

## Overview

The Classes System allows coaches to create and manage virtual or physical classes that students can discover, book, and pay for. The system integrates with Stripe Connect for payments and Zoom for virtual classes.

## Features

### For Coaches
- **Create Classes**: Set up virtual or physical classes with scheduling, pricing, and capacity limits
- **Automatic Zoom Integration**: Virtual classes can automatically create Zoom meetings
- **Payment Processing**: Integrated with Stripe Connect to receive payments
- **Class Management**: View participants, start Zoom meetings, and manage bookings
- **Recurring Classes**: Support for daily, weekly, or monthly recurring classes

### For Students
- **Browse Classes**: Search and filter classes by sport, type, level, and price
- **Secure Booking**: Book classes with Stripe payment processing
- **Automatic Confirmations**: Receive booking confirmations and class details
- **Easy Access**: Get Zoom links automatically for virtual classes

## Technical Implementation

### API Endpoints

#### Classes Management
- `GET /api/classes` - List classes with filtering options
- `POST /api/classes` - Create a new class (coaches only)
- `PUT /api/classes?id={classId}` - Update class details
- `DELETE /api/classes?id={classId}` - Delete a class

#### Booking System
- `POST /api/classes/{id}/book` - Book a class
- `GET /api/classes/{id}/book` - Get booking details
- `DELETE /api/classes/{id}/book` - Cancel a booking

#### Zoom Integration
- `POST /api/zoom/meeting` - Create Zoom meeting for virtual class
- `PUT /api/zoom/meeting` - Update Zoom meeting
- `DELETE /api/zoom/meeting` - Delete Zoom meeting

### Database Schema

#### Classes Collection
```javascript
{
  id: string,
  title: string,
  description: string,
  sport: string,
  type: 'virtual' | 'physical',
  location?: string,
  zoomMeetingId?: string,
  zoomJoinUrl?: string,
  zoomStartUrl?: string,
  maxParticipants: number,
  currentParticipants: number,
  price: number,
  currency: string,
  duration: number, // minutes
  schedules: [{
    date: string,
    startTime: string,
    endTime: string
  }],
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly',
    interval: number,
    endDate?: string
  },
  coachId: string,
  coachName: string,
  stripeAccountId: string,
  stripeProductId?: string,
  stripePriceId?: string,
  participants: [{
    userId: string,
    userName: string,
    userEmail: string,
    bookedAt: Date,
    bookingId: string
  }],
  status: 'active' | 'completed' | 'cancelled',
  level: 'beginner' | 'intermediate' | 'advanced' | 'all',
  createdAt: Date,
  updatedAt: Date
}
```

#### Bookings Collection
```javascript
{
  id: string,
  classId: string,
  userId: string,
  userName: string,
  userEmail: string,
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'payment_failed',
  paymentStatus: 'pending' | 'completed' | 'failed' | 'not_required',
  checkoutUrl?: string,
  stripeSessionId?: string,
  bookedAt: Date,
  confirmedAt?: Date,
  cancelledAt?: Date,
  classDetails: {
    title: string,
    sport: string,
    type: string,
    schedules: Array,
    price: number,
    coachName: string
  }
}
```

## User Interface

### Coach Dashboard
- **Create Class Button**: Links to `/dashboard/coach/classes/new`
- **Class Management**: View at `/dashboard/coach/classes`
- **Participant Management**: Modal showing enrolled students
- **Zoom Integration**: One-click meeting start for virtual classes

### Student Interface
- **Class Browser**: Public page at `/classes` with search and filtering
- **Booking Flow**: Integrated Stripe checkout for paid classes
- **Free Classes**: Instant booking confirmation

### Navigation
- **Navbar**: Added "Classes" link for easy discovery
- **Mobile Menu**: Includes classes link for mobile users

## Payment Flow

### Paid Classes
1. Student clicks "Book Now"
2. System creates booking record with `pending_payment` status
3. Stripe checkout session is created
4. Student completes payment
5. Webhook confirms payment and updates booking to `confirmed`
6. Student is added to class participants
7. Confirmation email/notification sent

### Free Classes
1. Student clicks "Join Free Class"
2. Booking is immediately confirmed
3. Student is added to class participants
4. Confirmation notification sent

## Zoom Integration

### Setup Requirements
- Zoom API Key (`ZOOM_API_KEY`)
- Zoom API Secret (`ZOOM_API_SECRET`)

### Automatic Meeting Creation
- When creating virtual classes, coaches can enable automatic Zoom meeting creation
- System creates Zoom meeting with class details
- Meeting links are stored and shared with participants
- Coaches get host start URL for easy meeting control

### Manual Integration
- Coaches can also provide their own Zoom meeting links
- Useful for coaches who prefer to manage their own Zoom accounts

## Environment Variables Required

```env
# Zoom Integration
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret

# Stripe (already required for existing features)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Firebase (already configured)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

## Security Features

- **Authentication Required**: All booking and class management requires authentication
- **Coach Verification**: Only class owners can modify their classes
- **Stripe Connect**: Payments go directly to coach accounts with platform fees
- **Booking Validation**: Prevents overbooking and duplicate bookings
- **Cancellation Policy**: 24-hour cancellation policy (configurable)

## Future Enhancements

- **Class Reviews**: Allow students to review classes after completion
- **Waitlists**: Enable waitlists for fully booked classes
- **Class Recordings**: Store and share virtual class recordings
- **Advanced Scheduling**: More flexible recurring patterns
- **Group Discounts**: Bulk booking discounts
- **Coach Analytics**: Detailed analytics for class performance
- **Mobile App**: Native mobile app support
- **Live Chat**: Real-time chat during virtual classes

## Testing

To test the classes system:

1. **Set up environment variables** for Zoom and Stripe
2. **Create a coach profile** with Stripe Connect enabled
3. **Create a test class** using the new class creation form
4. **Browse classes** as a student on the public classes page
5. **Test booking flow** with Stripe test cards
6. **Test Zoom integration** by starting a virtual class

## Support

For issues with the classes system:
- Check Firebase Admin SDK connection
- Verify Stripe Connect account setup
- Ensure Zoom API credentials are valid
- Review webhook endpoint configuration