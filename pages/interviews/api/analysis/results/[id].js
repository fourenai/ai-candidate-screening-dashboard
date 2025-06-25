import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id: requirementId } = req.query;
  const { 
    page = 1, 
    limit = 50, 
    sort = 'score_desc',
    minScore,
    recommendation,
    search
  } = req.query;

  if (!requirementId) {
    return res.status(400).json({ error: 'Requirement ID is required' });
  }

  try {
    // First check if the analysis exists and is complete
    const jobCheck = await query(
      'SELECT status, total_candidates FROM analysis_jobs WHERE requirement_id = $1',
      [requirementId]
    );

    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Analysis not found',
        message: 'No analysis found with the provided ID'
      });
    }

    const job = jobCheck.rows[0];
    
    if (job.status !== 'completed' && job.status !== 'error') {
      return res.status(400).json({ 
        error: 'Analysis not complete',
        message: `Analysis is currently ${job.status}. Please wait for completion.`,
        status: job.status
      });
    }

    // Build the query with filters
    let whereConditions = ['ce.job_id = $1'];
    let queryParams = [requirementId];
    let paramIndex = 2;

    if (minScore) {
      whereConditions.push(`ce.overall_score >= $${paramIndex}`);
      queryParams.push(parseInt(minScore));
      paramIndex++;
    }

    if (recommendation) {
      whereConditions.push(`ce.recommendation = $${paramIndex}`);
      queryParams.push(recommendation);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        c.candidate_name ILIKE $${paramIndex} OR 
        c.email ILIKE $${paramIndex} OR 
        c.curent_role ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Determine sort order
    let orderBy = 'ce.overall_score DESC';
    switch (sort) {
      case 'score_asc':
        orderBy = 'ce.overall_score ASC';
        break;
      case 'name':
        orderBy = 'c.candidate_name ASC';
        break;
      case 'recent':
        orderBy = 'ce.evaluated_at DESC';
        break;
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get candidates with evaluations
    const candidatesQuery = `
      SELECT 
        c.candidate_id,
        c.candidate_name,
        c.email,
        c.phone,
        c.curent_role as current_role,
        ce.evaluation_id,
        ce.overall_score,
        ce.technical_score,
        ce.experience_score,
        ce.soft_skills_score,
        ce.cultural_fit_score,
        ce.recommendation,
        ce.score_justification,
        ce.strengths,
        ce.concerns,
        ce.interview_focus,
        ce.candidate_persona_analysis,
        ce.hr_recommendation,
        ce.development_potential,
        ce.evaluated_at,
        CASE 
          WHEN ce.candidate_persona_analysis->>'risk_profile'->>'level' IS NOT NULL 
          THEN ce.candidate_persona_analysis->>'risk_profile'->>'level'
          ELSE 'medium'
        END as risk_level,
        CASE 
          WHEN ce.strengths->>'list' IS NOT NULL 
          THEN ce.strengths->'list'
          ELSE '[]'::jsonb
        END as key_strengths
      FROM candidate_evaluations ce
      INNER JOIN candidates c ON ce.candidate_id = c.candidate_id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const candidatesResult = await query(candidatesQuery, queryParams);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM candidate_evaluations ce
      INNER JOIN candidates c ON ce.candidate_id = c.candidate_id
      WHERE ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams.slice(0, -2)); // Remove limit and offset
    const totalCount = parseInt(countResult.rows[0].total);

    // Get job requirements
    const requirementsQuery = `
      SELECT * FROM job_requirements 
      WHERE job_id = $1
      LIMIT 1
    `;
    const requirementsResult = await query(requirementsQuery, [requirementId]);
    const requirements = requirementsResult.rows[0];

    // Get summary
    const summaryQuery = `
      SELECT * FROM analysis_summaries 
      WHERE job_id = $1
      LIMIT 1
    `;
    const summaryResult = await query(summaryQuery, [requirementId]);
    const summary = summaryResult.rows[0];

    // Process candidate data
    const candidates = candidatesResult.rows.map(candidate => {
      // Parse JSONB fields
      let keyStrengths = [];
      try {
        if (candidate.key_strengths && typeof candidate.key_strengths === 'object') {
          keyStrengths = Array.isArray(candidate.key_strengths) 
            ? candidate.key_strengths 
            : candidate.key_strengths.list || [];
        }
      } catch (e) {
        console.error('Error parsing key_strengths:', e);
      }

      return {
        ...candidate,
        key_strengths: keyStrengths.slice(0, 3), // Top 3 strengths
        strengths: parseJsonbField(candidate.strengths),
        concerns: parseJsonbField(candidate.concerns),
        interview_focus: parseJsonbField(candidate.interview_focus),
        candidate_persona_analysis: parseJsonbField(candidate.candidate_persona_analysis),
      };
    });

    return res.status(200).json({
      success: true,
      candidates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      },
      requirements,
      summary,
      filters: {
        minScore,
        recommendation,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching analysis results:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch analysis results'
    });
  }
}

// Helper function to parse JSONB fields
function parseJsonbField(field) {
  if (!field) return null;
  if (typeof field === 'object') return field;
  
  try {
    return JSON.parse(field);
  } catch (e) {
    return field;
  }
}