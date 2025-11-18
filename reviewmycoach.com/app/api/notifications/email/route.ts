import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase-admin';

interface EmailNotificationRequest {
  type: 'job_application' | 'booking_confirmation' | 'message_received' | 'application_status';
  recipientEmail: string;
  recipientName: string;
  data: any;
  idToken: string;
}

// Email templates
const emailTemplates = {
  job_application: {
    subject: 'New Job Application Received',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">New Job Application</h2>
        <p>You have received a new application for your job posting:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">${data.jobTitle}</h3>
          <p><strong>Applicant:</strong> ${data.applicantName}</p>
          <p><strong>Hourly Rate:</strong> $${data.hourlyRate}</p>
          <p><strong>Estimated Hours:</strong> ${data.estimatedHours}</p>
          <p><strong>Availability:</strong> ${data.availability}</p>
          <div style="margin-top: 15px;">
            <h4 style="color: #374151;">Cover Letter:</h4>
            <p style="background-color: white; padding: 15px; border-radius: 4px;">${data.coverLetter}</p>
          </div>
        </div>
        <p>You can review and respond to this application in your dashboard.</p>
      </div>
    `
  },
  booking_confirmation: {
    subject: 'New Booking Confirmation',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">New Booking Confirmed</h2>
        <p>You have a new booking for your coaching services:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">${data.serviceTitle}</h3>
          <p><strong>Student:</strong> ${data.studentName}</p>
          <p><strong>Date:</strong> ${data.scheduledDate}</p>
          <p><strong>Time:</strong> ${data.scheduledTime}</p>
          <p><strong>Duration:</strong> ${data.duration} minutes</p>
          <p><strong>Amount:</strong> $${data.amount}</p>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
        </div>
        <p>Please prepare for your session and contact the student if needed.</p>
      </div>
    `
  },
  message_received: {
    subject: 'New Message Received',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">New Message</h2>
        <p>You have received a new message from ${data.senderName}:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">${data.message}</p>
        </div>
        <p>You can reply to this message in your dashboard.</p>
      </div>
    `
  },
  application_status: {
    subject: 'Application Status Update',
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Application Status Update</h2>
        <p>Your application for "${data.jobTitle}" has been updated:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Status:</strong> <span style="color: ${data.status === 'accepted' ? '#059669' : '#dc2626'};">${data.status.toUpperCase()}</span></p>
          ${data.feedback ? `<p><strong>Feedback:</strong> ${data.feedback}</p>` : ''}
        </div>
        <p>You can view more details in your dashboard.</p>
      </div>
    `
  }
};

export async function POST(request: NextRequest) {
  try {
    const { type, recipientEmail, recipientName, data, idToken }: EmailNotificationRequest = await request.json();

    // Verify authentication
    if (!idToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

      try {
    await auth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
  }

    // Validate required fields
    if (!type || !recipientEmail || !recipientName || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get email template
    const template = emailTemplates[type];
    if (!template) {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // For development, we'll just log the email instead of sending it
    // In production, you would integrate with a service like SendGrid, Mailgun, etc.
    const emailContent = {
      to: recipientEmail,
      subject: template.subject,
      html: template.html(data)
    };

    console.log('Email notification would be sent:', emailContent);

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      message: 'Email notification sent successfully'
    });

  } catch (error) {
    console.error('Error sending email notification:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}

 