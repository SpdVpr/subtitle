import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminDb } from '@/lib/firebase-admin'

const replySchema = z.object({
  reply: z.string().min(10, 'Reply must be at least 10 characters').max(2000, 'Reply must be less than 2000 characters'),
  adminId: z.string(),
  adminName: z.string(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log('📝 ========================================')
    console.log('📝 Reply API called for feedback:', id)
    console.log('📝 Reply data:', body)
    console.log('📝 ========================================')
    
    // Validate the request body
    const validatedData = replySchema.parse(body)
    
    const db = getAdminDb()
    const feedbackRef = db.collection('feedback').doc(id)
    
    // Get the feedback document
    const feedbackDoc = await feedbackRef.get()
    
    if (!feedbackDoc.exists) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }
    
    const feedbackData = feedbackDoc.data()
    
    // Update feedback with reply
    await feedbackRef.update({
      adminReply: validatedData.reply,
      adminId: validatedData.adminId,
      adminName: validatedData.adminName,
      repliedAt: new Date().toISOString(),
      status: 'replied',
      updatedAt: new Date().toISOString(),
    })
    
    console.log('✅ Feedback reply saved')
    
    // Create notification for user if they have userId
    if (feedbackData?.userId) {
      try {
        const notificationRef = db.collection('notifications').doc()
        await notificationRef.set({
          userId: feedbackData.userId,
          type: 'feedback_reply',
          title: 'Admin replied to your feedback',
          message: `${validatedData.adminName} replied to your feedback`,
          feedbackId: id,
          read: false,
          createdAt: new Date().toISOString(),
        })
        
        console.log('✅ Notification created for user:', feedbackData.userId)
      } catch (notifError) {
        console.error('❌ Error creating notification:', notifError)
        // Don't fail the request if notification fails
      }
    }
    
    // TODO: Send email notification if user has email
    if (feedbackData?.userEmail) {
      console.log('📧 Email notification would be sent to:', feedbackData.userEmail)
      // Future: Integrate with email service (SendGrid, Resend, etc.)
      /*
      await sendEmail({
        to: feedbackData.userEmail,
        subject: 'Admin replied to your feedback - SubtitleBot',
        html: `
          <h2>We replied to your feedback!</h2>
          <p>Hi ${feedbackData.userName || 'there'},</p>
          <p>An admin has replied to your feedback:</p>
          <blockquote>${validatedData.reply}</blockquote>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/my-feedback">View your feedback</a></p>
          <hr>
          <p>Best regards,<br>The SubtitleBot Team</p>
        `,
      })
      */
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Reply sent successfully',
        notificationSent: !!feedbackData?.userId,
        emailSent: false, // Will be true when email service is integrated
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Feedback reply API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}

