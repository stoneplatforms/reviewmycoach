import { NextRequest, NextResponse } from 'next/server';

// Lazy initialization of Firebase Admin SDK
let auth: any = null;
let db: any = null;

try {
  const firebaseAdmin = require('../../../lib/firebase-admin');
  auth = firebaseAdmin.auth;
  db = firebaseAdmin.db;
} catch (error) {
  console.error('Failed to initialize Firebase Admin in zoom route:', error);
}

// Zoom SDK helper functions
async function generateZoomToken() {
  const jwt = require('jsonwebtoken');
  
  const payload = {
    iss: process.env.ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
  };
  
  return jwt.sign(payload, process.env.ZOOM_API_SECRET);
}

async function createZoomMeeting(meetingData: any) {
  const token = await generateZoomToken();
  
  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(meetingData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Zoom API error: ${error.message || 'Unknown error'}`);
  }

  return response.json();
}

// POST - Create Zoom meeting for virtual class
export async function POST(req: NextRequest) {
  if (!db || !auth) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { classId, classData } = await req.json();

    // Verify user owns this class
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const existingClassData = classDoc.data();
    if (existingClassData.coachId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if Zoom credentials are configured
    if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
      return NextResponse.json({
        error: 'Zoom integration not configured',
        message: 'Please contact support to set up Zoom integration'
      }, { status: 500 });
    }

    // Prepare Zoom meeting data
    const startTime = new Date(classData.schedules[0].date + 'T' + classData.schedules[0].startTime);
    const meetingData = {
      topic: classData.title,
      type: 2, // Scheduled meeting
      start_time: startTime.toISOString(),
      duration: classData.duration,
      timezone: 'UTC',
      agenda: classData.description,
      settings: {
        host_video: true,
        participant_video: true,
        cn_meeting: false,
        in_meeting: false,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 0, // Automatically approve
        audio: 'both',
        auto_recording: 'none',
        waiting_room: true,
        registrants_confirmation_email: true
      },
      recurrence: classData.recurringPattern ? {
        type: classData.recurringPattern.type === 'weekly' ? 2 : 
              classData.recurringPattern.type === 'daily' ? 1 : 3,
        repeat_interval: classData.recurringPattern.interval,
        end_date_time: classData.recurringPattern.endDate ? 
          new Date(classData.recurringPattern.endDate).toISOString() : undefined
      } : undefined
    };

    // Create Zoom meeting
    const zoomMeeting = await createZoomMeeting(meetingData);

    // Update class with Zoom meeting details
    await db.collection('classes').doc(classId).update({
      zoomMeetingId: zoomMeeting.id,
      zoomJoinUrl: zoomMeeting.join_url,
      zoomStartUrl: zoomMeeting.start_url,
      zoomMeetingPassword: zoomMeeting.password,
      updatedAt: new Date()
    });

    return NextResponse.json({
      meetingId: zoomMeeting.id,
      joinUrl: zoomMeeting.join_url,
      startUrl: zoomMeeting.start_url,
      password: zoomMeeting.password,
      message: 'Zoom meeting created successfully'
    });

  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    return NextResponse.json({
      error: 'Failed to create Zoom meeting',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update Zoom meeting
export async function PUT(req: NextRequest) {
  if (!db || !auth) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { classId, meetingId, updateData } = await req.json();

    // Verify user owns this class
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const classData = classDoc.data();
    if (classData.coachId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update Zoom meeting
    const token_zoom = await generateZoomToken();
    
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token_zoom}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Zoom API error: ${error.message || 'Unknown error'}`);
    }

    return NextResponse.json({
      message: 'Zoom meeting updated successfully'
    });

  } catch (error) {
    console.error('Error updating Zoom meeting:', error);
    return NextResponse.json({
      error: 'Failed to update Zoom meeting',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete Zoom meeting
export async function DELETE(req: NextRequest) {
  if (!db || !auth) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const meetingId = searchParams.get('meetingId');

    if (!classId || !meetingId) {
      return NextResponse.json({ error: 'Class ID and Meeting ID required' }, { status: 400 });
    }

    // Verify user owns this class
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const classData = classDoc.data();
    if (classData.coachId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete Zoom meeting
    const token_zoom = await generateZoomToken();
    
    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token_zoom}`
      }
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new Error(`Zoom API error: ${error.message || 'Unknown error'}`);
    }

    // Remove Zoom details from class
    await db.collection('classes').doc(classId).update({
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomStartUrl: null,
      zoomMeetingPassword: null,
      updatedAt: new Date()
    });

    return NextResponse.json({
      message: 'Zoom meeting deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting Zoom meeting:', error);
    return NextResponse.json({
      error: 'Failed to delete Zoom meeting',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}