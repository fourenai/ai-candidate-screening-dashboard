import { query } from '../../../lib/db';
import { authenticate } from '../../../lib/auth';
import { validateRequest } from '../../../lib/validation';
import { logActivity } from '../../../lib/audit';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get interview ID from query
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Interview ID is required' });
  }

  try {
    // Authenticate user (implement based on your auth strategy)
    // const user = await authenticate(req);
    // if (!user) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    switch (req.method) {
      case 'GET':
        return await getInterview(req, res, id);
      case 'PUT':
        return await updateInterview(req, res, id);
      case 'DELETE':
        return await deleteInterview(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Interview API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function getInterview(req, res, interviewId) {
  try {
    const interviewQuery = `
      SELECT 
        i.*,
        c.candidate_name,
        c.email as candidate_email,
        c.phone as candidate_phone,
        c.curent_role as candidate_current_role,
        j.job_title,
        j.input_type,
        j.experience_level,
        j.status as job_status,
        ce.overall_score,
        ce.recommendation,
        ce.evaluated_at,
        ce.technical_score,
        ce.experience_score,
        ce.soft_skills_score,
        ce.cultural_fit_score
      FROM interview_schedules i
      LEFT JOIN candidates c ON i.candidate_id = c.candidate_id
      LEFT JOIN analysis_jobs j ON i.job_id = j.requirement_id
      LEFT JOIN candidate_evaluations ce ON 
        ce.candidate_id = i.candidate_id AND 
        ce.job_id = i.job_id
      WHERE i.interview_id = $1
    `;

    const result = await query(interviewQuery, [interviewId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const interview = result.rows[0];

    // Get interview feedback if completed
    let feedback = null;
    if (interview.status === 'completed' && interview.feedback_score) {
      const feedbackQuery = `
        SELECT * FROM interview_feedback
        WHERE interview_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const feedbackResult = await query(feedbackQuery, [interviewId]);
      if (feedbackResult.rows.length > 0) {
        feedback = feedbackResult.rows[0];
      }
    }

    // Get interview history
    const historyQuery = `
      SELECT 
        action,
        details,
        created_at,
        user_id
      FROM audit_log
      WHERE entity_type = 'interview' 
        AND entity_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const historyResult = await query(historyQuery, [interviewId]);

    return res.status(200).json({
      success: true,
      interview: {
        ...interview,
        feedback,
        history: historyResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching interview:', error);
    throw error;
  }
}

async function updateInterview(req, res, interviewId) {
  try {
    // Check if interview exists
    const checkQuery = 'SELECT * FROM interview_schedules WHERE interview_id = $1';
    const checkResult = await query(checkQuery, [interviewId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const currentInterview = checkResult.rows[0];

    // Validate request body
    const validation = validateRequest(req.body, {
      scheduled_at: { type: 'datetime' },
      duration_minutes: { type: 'number', min: 15, max: 480 },
      interview_type: { 
        type: 'string', 
        enum: ['technical', 'behavioral', 'video', 'phone', 'hr', 'final']
      },
      interviewer_email: { type: 'email' },
      meeting_link: { type: 'url' },
      status: { 
        type: 'string', 
        enum: ['scheduled', 'completed', 'cancelled', 'no_show']
      },
      notes: { type: 'string', maxLength: 1000 },
      feedback_score: { type: 'number', min: 1, max: 10 }
    });

    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      'scheduled_at', 'duration_minutes', 'interview_type',
      'interviewer_email', 'meeting_link', 'status', 'notes',
      'feedback_score'
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add interview ID to values
    values.push(interviewId);

    const updateQuery = `
      UPDATE interview_schedules 
      SET ${updates.join(', ')}
      WHERE interview_id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const updatedInterview = result.rows[0];

    // Log activity
    await logActivity({
      action: 'interview_updated',
      entity_type: 'interview',
      entity_id: interviewId,
      job_id: updatedInterview.job_id,
      candidate_id: updatedInterview.candidate_id,
      details: {
        changes: req.body,
        previous_status: currentInterview.status,
        new_status: updatedInterview.status
      },
      user_id: req.user?.id || 'system',
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

    // If interview is completed, create feedback record
    if (req.body.status === 'completed' && req.body.feedback_score) {
      await createInterviewFeedback(interviewId, {
        score: req.body.feedback_score,
        notes: req.body.notes,
        interviewer_email: updatedInterview.interviewer_email
      });
    }

    // Send notification if status changed
    if (currentInterview.status !== updatedInterview.status) {
      // Queue status change notification
      // await sendStatusChangeNotification(updatedInterview);
    }

    return res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      interview: updatedInterview
    });

  } catch (error) {
    console.error('Error updating interview:', error);
    throw error;
  }
}

async function deleteInterview(req, res, interviewId) {
  try {
    // Check if interview exists
    const checkQuery = 'SELECT * FROM interview_schedules WHERE interview_id = $1';
    const checkResult = await query(checkQuery, [interviewId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const interview = checkResult.rows[0];

    // Don't delete completed interviews
    if (interview.status === 'completed') {
      return res.status(400).json({ 
        error: 'Cannot delete completed interviews. Please cancel instead.' 
      });
    }

    // Soft delete by updating status to cancelled
    const updateQuery = `
      UPDATE interview_schedules 
      SET 
        status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
      WHERE interview_id = $1
      RETURNING *
    `;

    const result = await query(updateQuery, [interviewId]);
    const cancelledInterview = result.rows[0];

    // Log activity
    await logActivity({
      action: 'interview_cancelled',
      entity_type: 'interview',
      entity_id: interviewId,
      job_id: interview.job_id,
      candidate_id: interview.candidate_id,
      details: {
        reason: req.body.reason || 'No reason provided',
        previous_scheduled_time: interview.scheduled_at
      },
      user_id: req.user?.id || 'system',
      ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

    // Send cancellation notification
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      // Queue cancellation email
      // await sendCancellationNotification(cancelledInterview);
    }

    return res.status(200).json({
      success: true,
      message: 'Interview cancelled successfully',
      interview: cancelledInterview
    });

  } catch (error) {
    console.error('Error deleting interview:', error);
    throw error;
  }
}

async function createInterviewFeedback(interviewId, feedbackData) {
  try {
    const insertQuery = `
      INSERT INTO interview_feedback (
        interview_id,
        score,
        technical_assessment,
        communication_rating,
        cultural_fit_rating,
        strengths,
        weaknesses,
        recommendation,
        notes,
        interviewer_email,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      interviewId,
      feedbackData.score,
      feedbackData.technical_assessment || null,
      feedbackData.communication_rating || null,
      feedbackData.cultural_fit_rating || null,
      JSON.stringify(feedbackData.strengths || []),
      JSON.stringify(feedbackData.weaknesses || []),
      feedbackData.recommendation || null,
      feedbackData.notes || null,
      feedbackData.interviewer_email
    ];

    await query(insertQuery, values);
  } catch (error) {
    console.error('Error creating interview feedback:', error);
    // Don't throw - feedback creation should not break the main flow
  }
}