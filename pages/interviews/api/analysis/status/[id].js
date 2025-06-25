import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id: requirementId } = req.query;

  if (!requirementId) {
    return res.status(400).json({ error: 'Requirement ID is required' });
  }

  try {
    // Get analysis job status
    const jobQuery = `
      SELECT 
        aj.*,
        COUNT(DISTINCT ce.candidate_id) as evaluated_candidates,
        COUNT(DISTINCT pq.queue_id) FILTER (WHERE pq.status = 'skipped') as skipped_candidates
      FROM analysis_jobs aj
      LEFT JOIN candidate_evaluations ce ON aj.requirement_id = ce.job_id
      LEFT JOIN processing_queue pq ON aj.requirement_id = pq.requirement_id
      WHERE aj.requirement_id = $1
      GROUP BY aj.requirement_id
    `;

    const jobResult = await query(jobQuery, [requirementId]);

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Analysis not found',
        message: 'No analysis found with the provided ID'
      });
    }

    const analysis = jobResult.rows[0];

    // Get summary if analysis is complete
    let summary = null;
    if (analysis.status === 'completed') {
      const summaryQuery = `
        SELECT * FROM analysis_summaries 
        WHERE job_id = $1
        LIMIT 1
      `;
      const summaryResult = await query(summaryQuery, [requirementId]);
      if (summaryResult.rows.length > 0) {
        summary = summaryResult.rows[0];
      }
    }

    // Get recent errors if any
    let recentError = null;
    if (analysis.status === 'error' || analysis.last_error_id) {
      const errorQuery = `
        SELECT * FROM error_logs 
        WHERE requirement_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const errorResult = await query(errorQuery, [requirementId]);
      if (errorResult.rows.length > 0) {
        recentError = errorResult.rows[0];
      }
    }

    // Calculate effective progress
    let effectiveProgress = analysis.progress;
    if (analysis.status === 'completed') {
      effectiveProgress = 100;
    } else if (analysis.status === 'error') {
      effectiveProgress = analysis.progress || 0;
    }

    return res.status(200).json({
      success: true,
      analysis: {
        requirement_id: analysis.requirement_id,
        job_id: analysis.job_id,
        status: analysis.status,
        progress: effectiveProgress,
        current_step: analysis.current_step,
        job_title: analysis.job_title,
        job_description: analysis.job_description,
        input_type: analysis.input_type,
        experience_level: analysis.experience_level,
        submitted_at: analysis.submitted_at,
        completed_at: analysis.completed_at,
        total_candidates: analysis.total_candidates || 0,
        evaluated_candidates: parseInt(analysis.evaluated_candidates) || 0,
        skipped_candidates: parseInt(analysis.skipped_candidates) || 0,
        estimated_time: analysis.estimated_time,
        retry_attempts: analysis.retry_attempts || 0,
        error_message: analysis.error_message,
        created_by: analysis.created_by
      },
      summary,
      error: recentError,
      metadata: {
        canRetry: analysis.status === 'error' && (analysis.retry_attempts || 0) < 3,
        isStale: analysis.status === 'processing' && 
          new Date() - new Date(analysis.updated_at) > 15 * 60 * 1000, // 15 minutes
      }
    });

  } catch (error) {
    console.error('Error fetching analysis status:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch analysis status'
    });
  }
}