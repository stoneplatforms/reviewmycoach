import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '../../lib/firebase-admin';

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const { reportedItemType, reportedItemId, reason, description } = await request.json();

    // Validate required fields
    if (!reportedItemType || !reportedItemId || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: reportedItemType, reportedItemId, reason' 
      }, { status: 400 });
    }

    // Check if user has already reported this item
    const reportsRef = db.collection('reports');
    const existingReportQuery = reportsRef
      .where('reporterId', '==', decodedToken.uid)
      .where('reportedItemId', '==', reportedItemId);
    
    const existingReports = await existingReportQuery.get();
    if (!existingReports.empty) {
      return NextResponse.json({ 
        error: 'You have already reported this item' 
      }, { status: 400 });
    }

    // Create the report
    const reportData = {
      reporterId: decodedToken.uid,
      reportedItemType,
      reportedItemId,
      reason,
      description: description || '',
      status: 'pending',
      createdAt: new Date(),
    };

    const docRef = await reportsRef.add(reportData);

    return NextResponse.json({ 
      success: true, 
      reportId: docRef.id,
      message: 'Report submitted successfully'
    });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET - Fetch reports (admin only)
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user is admin (you may want to implement proper admin role checking)
    // For now, we'll check if they have admin custom claims
    if (!decodedToken.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    let reportsQuery = db.collection('reports').orderBy('createdAt', 'desc');

    if (status) {
      reportsQuery = reportsQuery.where('status', '==', status);
    }

    reportsQuery = reportsQuery.limit(limit);

    const snapshot = await reportsQuery.get();
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ reports });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 