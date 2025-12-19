import { NextRequest, NextResponse } from 'next/server';
import { adminDb, verifyFirebaseToken } from '../../lib/firebase-admin-server';

interface ClassData {
  title: string;
  description: string;
  sport: string;
  type: 'virtual' | 'physical';
  location?: string;
  zoom_link?: string;
  max_participants: number;
  price: number;
  currency: string;
  duration: number; // in minutes
  schedules: {
    date: string;
    start_time: string;
    end_time: string;
  }[];
  recurring_pattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    end_date?: string;
  };
  requirements?: string[];
  equipment?: string[];
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  tags?: string[];
}

// Use Firebase token verification (already exported from firebase-admin-server)

// GET - Fetch classes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coachId = searchParams.get('coachId');
    const sport = searchParams.get('sport');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = adminDb.collection('classes').orderBy('createdAt', 'desc').limit(limit);

    // Apply filters
    if (coachId) {
      query = query.where('coachId', '==', coachId) as any;
    }
    if (sport) {
      query = query.where('sport', '==', sport) as any;
    }
    if (type) {
      query = query.where('type', '==', type) as any;
    }

    const snapshot = await query.get();
    const classes = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({
      error: 'Failed to fetch classes',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Create new class
export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({
      error: 'Service temporarily unavailable. Please try again later.',
      details: 'Supabase connection not available'
    }, { status: 503 });
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    // Get user profile to find username
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const username = userData.username;
    
    // Try to get coach profile - first by username, then by userId
    let coachData = null;
    if (username) {
      const { data: coachByUsername } = await supabaseAdmin
        .from('coaches')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();
      coachData = coachByUsername;
    }
    
    // If no coach found with username, try userId
    if (!coachData) {
      const { data: coachByUserId } = await supabaseAdmin
        .from('coaches')
        .select('*')
        .eq('user_id', userId)
        .single();
      coachData = coachByUserId;
    }
    
    if (!coachData) {
      return NextResponse.json({ 
        error: 'Coach profile not found',
        message: 'Please complete your coach profile setup first'
      }, { status: 404 });
    }

    // Check if coach has Stripe Connect account
    if (!coachData.stripe_account_id) {
      return NextResponse.json({
        error: 'Stripe Connect account required',
        message: 'Please connect your Stripe account before creating classes'
      }, { status: 400 });
    }

    const classData: ClassData = await req.json();

    // Validate required fields
    if (!classData.title || !classData.sport || !classData.type || !classData.schedules?.length) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['title', 'sport', 'type', 'schedules']
      }, { status: 400 });
    }

    // Validate virtual class requirements
    if (classData.type === 'virtual' && !classData.zoom_link) {
      return NextResponse.json({
        error: 'Zoom link required for virtual classes'
      }, { status: 400 });
    }

    // Validate physical class requirements
    if (classData.type === 'physical' && !classData.location) {
      return NextResponse.json({
        error: 'Location required for physical classes'
      }, { status: 400 });
    }

    // Create Stripe product and price for the class
    const stripe = require('../../lib/stripe');
    let stripeProductId = null;
    let stripePriceId = null;

    if (classData.price > 0) {
      try {
        const product = await stripe.stripe.products.create({
          name: classData.title,
          description: classData.description,
          metadata: {
            type: 'class',
            coachId: username || userId,
            sport: classData.sport,
            classType: classData.type
          }
        }, {
          stripeAccount: coachData.stripe_account_id
        });

        const price = await stripe.stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(classData.price * 100), // Convert to cents
          currency: classData.currency || 'usd',
          metadata: {
            type: 'class_booking'
          }
        }, {
          stripeAccount: coachData.stripe_account_id
        });

        stripeProductId = product.id;
        stripePriceId = price.id;
      } catch (stripeError) {
        console.error('Stripe product/price creation failed:', stripeError);
        return NextResponse.json({
          error: 'Failed to set up payment processing',
          details: 'Please check your Stripe Connect setup'
        }, { status: 500 });
      }
    }

    // Create class document
    const newClass = {
      title: classData.title,
      description: classData.description,
      sport: classData.sport,
      type: classData.type,
      location: classData.location || null,
      zoom_link: classData.zoom_link || null,
      max_participants: classData.max_participants,
      price: classData.price,
      currency: classData.currency || 'usd',
      duration: classData.duration,
      schedules: classData.schedules,
      recurring_pattern: classData.recurring_pattern || null,
      requirements: classData.requirements || [],
      equipment: classData.equipment || [],
      level: classData.level,
      tags: classData.tags || [],
      coach_id: username || userId,
      coach_name: coachData.display_name,
      stripe_account_id: coachData.stripe_account_id,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
      participants: [],
      current_participants: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertedClass, error: insertError } = await supabaseAdmin
      .from('classes')
      .insert(newClass)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting class:', insertError);
      return NextResponse.json({
        error: 'Failed to create class',
        details: insertError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      id: insertedClass.id,
      ...insertedClass,
      createdAt: insertedClass.created_at,
      updatedAt: insertedClass.updated_at,
      zoomLink: insertedClass.zoom_link,
      maxParticipants: insertedClass.max_participants,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({
      error: 'Failed to create class',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update class
export async function PUT(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    // Get user profile to find username
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    const username = userData?.username;

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('id');

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 });
    }

    // Check if user owns this class
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check ownership using both username and userId patterns
    const isOwner = (username && classData.coach_id === username) || 
                    classData.coach_id === userId;
    
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData = await req.json();
    // Convert camelCase to snake_case for database
    const updateDataSnakeCase: any = {
      updated_at: new Date().toISOString()
    };

    // Map camelCase fields to snake_case
    if (updateData.title !== undefined) updateDataSnakeCase.title = updateData.title;
    if (updateData.description !== undefined) updateDataSnakeCase.description = updateData.description;
    if (updateData.sport !== undefined) updateDataSnakeCase.sport = updateData.sport;
    if (updateData.type !== undefined) updateDataSnakeCase.type = updateData.type;
    if (updateData.location !== undefined) updateDataSnakeCase.location = updateData.location;
    if (updateData.zoomLink !== undefined) updateDataSnakeCase.zoom_link = updateData.zoomLink;
    if (updateData.maxParticipants !== undefined) updateDataSnakeCase.max_participants = updateData.maxParticipants;
    if (updateData.price !== undefined) updateDataSnakeCase.price = updateData.price;
    if (updateData.currency !== undefined) updateDataSnakeCase.currency = updateData.currency;
    if (updateData.duration !== undefined) updateDataSnakeCase.duration = updateData.duration;
    if (updateData.schedules !== undefined) updateDataSnakeCase.schedules = updateData.schedules;
    if (updateData.recurringPattern !== undefined) updateDataSnakeCase.recurring_pattern = updateData.recurringPattern;
    if (updateData.requirements !== undefined) updateDataSnakeCase.requirements = updateData.requirements;
    if (updateData.equipment !== undefined) updateDataSnakeCase.equipment = updateData.equipment;
    if (updateData.level !== undefined) updateDataSnakeCase.level = updateData.level;
    if (updateData.tags !== undefined) updateDataSnakeCase.tags = updateData.tags;
    if (updateData.status !== undefined) updateDataSnakeCase.status = updateData.status;

    const { data: updatedClass, error: updateError } = await supabaseAdmin
      .from('classes')
      .update(updateDataSnakeCase)
      .eq('id', classId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating class:', updateError);
      return NextResponse.json({
        error: 'Failed to update class',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      id: updatedClass.id,
      ...updatedClass,
      createdAt: updatedClass.created_at,
      updatedAt: updatedClass.updated_at,
      zoomLink: updatedClass.zoom_link,
      maxParticipants: updatedClass.max_participants,
    });

  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({
      error: 'Failed to update class',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete class
export async function DELETE(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({
      error: 'Service temporarily unavailable'
    }, { status: 503 });
  }

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 });
    }

    const decodedToken = await verifyFirebaseToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }
    const userId = decodedToken.uid;

    // Get user profile to find username
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    const username = userData?.username;

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('id');

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 });
    }

    // Check if user owns this class
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Check ownership using both username and userId patterns
    const isOwner = (username && classData.coach_id === username) || 
                    classData.coach_id === userId;
    
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if class has participants
    if (classData.current_participants > 0) {
      return NextResponse.json({
        error: 'Cannot delete class with active participants',
        message: 'Please cancel all bookings before deleting the class'
      }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('classes')
      .delete()
      .eq('id', classId);

    if (deleteError) {
      console.error('Error deleting class:', deleteError);
      return NextResponse.json({
        error: 'Failed to delete class',
        details: deleteError.message
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Class deleted successfully' });

  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({
      error: 'Failed to delete class',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
