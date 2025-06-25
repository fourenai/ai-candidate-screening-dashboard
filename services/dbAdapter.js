// services/dbAdapter.js
import { Pool } from 'pg';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Error handler
const handleDbError = (error, context) => {
  console.error(`Database error in ${context}:`, error);
  throw new Error(`Database operation failed: ${context}`);
};

export const db = {
  // Analysis Jobs
  async getAnalysisJob(requirementId) {
    try {
      const query = `
        SELECT aj.*, 
               COUNT(DISTINCT ce.candidate_id) as evaluated_count,
               COUNT(DISTINCT pq.queue_id) FILTER (WHERE pq.status = 'skipped') as skipped_count
        FROM analysis_jobs aj
        LEFT JOIN candidate_evaluations ce ON aj.requirement_id = ce.job_id
        LEFT JOIN processing_queue pq ON aj.requirement_id = pq.requirement_id
        WHERE aj.requirement_id = $1
        GROUP BY aj.requirement_id
      `;
      const result = await pool.query(query, [requirementId]);
      return result.rows[0];
    } catch (error) {
      handleDbError(error, 'getAnalysisJob');
    }
  },

  async getAnalysisRuns(requirementId) {
    try {
      const query = `
        SELECT * FROM analysis_runs 
        WHERE requirement_id = $1 
        ORDER BY run_number DESC
      `;
      const result = await pool.query(query, [requirementId]);
      return result.rows;
    } catch (error) {
      handleDbError(error, 'getAnalysisRuns');
    }
  },

  // Candidates
  async getCandidatesWithEvaluations(requirementId) {
    try {
      const query = `
        SELECT 
          c.*,
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
          ce.technical_assessment,
          ce.risk_factors,
          ce.development_potential,
          ce.hr_recommendation,
          ce.evaluated_at
        FROM candidate_evaluations ce
        JOIN candidates c ON ce.candidate_id = c.candidate_id
        WHERE ce.job_id = $1
        ORDER BY ce.overall_score DESC
      `;
      const result = await pool.query(query, [requirementId]);
      return result.rows;
    } catch (error) {
      handleDbError(error, 'getCandidatesWithEvaluations');
    }
  },

  async getCandidateById(candidateId) {
    try {
      const query = 'SELECT * FROM candidates WHERE candidate_id = $1';
      const result = await pool.query(query, [candidateId]);
      return result.rows[0];
    } catch (error) {
      handleDbError(error, 'getCandidateById');
    }
  },

  // Analysis Summary
  async getAnalysisSummary(jobId) {
    try {
      const query = `
        SELECT 
          as.*,
          jr.technical_requirements,
          jr.soft_skills,
          jr.ideal_candidate_personas,
          jr.scoring_weights
        FROM analysis_summaries as
        LEFT JOIN job_requirements jr ON as.job_id = jr.job_id
        WHERE as.job_id = $1
        ORDER BY as.created_at DESC
        LIMIT 1
      `;
      const result = await pool.query(query, [jobId]);
      return result.rows[0];
    } catch (error) {
      handleDbError(error, 'getAnalysisSummary');
    }
  },

  // Interview Schedules
  async getInterviewSchedules(jobId) {
    try {
      const query = `
        SELECT 
          is.*,
          c.candidate_name,
          c.email as candidate_email,
          ce.overall_score,
          ce.recommendation
        FROM interview_schedules is
        JOIN candidates c ON is.candidate_id = c.candidate_id
        LEFT JOIN candidate_evaluations ce ON is.candidate_id = ce.candidate_id AND is.job_id = ce.job_id
        WHERE is.job_id = $1
        ORDER BY is.scheduled_at ASC
      `;
      const result = await pool.query(query, [jobId]);
      return result.rows;
    } catch (error) {
      handleDbError(error, 'getInterviewSchedules');
    }
  },

  async createInterviewSchedule(data) {
    try {
      const query = `
        INSERT INTO interview_schedules 
        (job_id, candidate_id, scheduled_at, duration_minutes, interview_type, 
         interviewer_email, meeting_link, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        data.job_id,
        data.candidate_id,
        data.scheduled_at,
        data.duration_minutes || 60,
        data.interview_type || 'technical',
        data.interviewer_email,
        data.meeting_link,
        data.status || 'scheduled',
        data.notes
      ];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      handleDbError(error, 'createInterviewSchedule');
    }
  },

  // Error Logs
  async getErrorLogs(requirementId) {
    try {
      const query = `
        SELECT * FROM error_logs 
        WHERE requirement_id = $1 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [requirementId]);
      return result.rows;
    } catch (error) {
      handleDbError(error, 'getErrorLogs');
    }
  },

  // Skills Analysis
  async getSkillsAnalysis(requirementId) {
    try {
      const query = `
        WITH skill_scores AS (
          SELECT 
            jsonb_object_keys(ce.technical_assessment->'skill_depth_analysis') as skill,
            AVG((ce.technical_assessment->'skill_depth_analysis'->jsonb_object_keys(ce.technical_assessment->'skill_depth_analysis')->>'score')::int) as avg_score,
            COUNT(DISTINCT ce.candidate_id) as candidate_count
          FROM candidate_evaluations ce
          WHERE ce.job_id = $1
          GROUP BY skill
        )
        SELECT 
          ss.*,
          sm.skill_category,
          sm.skill_domain
        FROM skill_scores ss
        LEFT JOIN skills_master sm ON LOWER(ss.skill) = LOWER(sm.skill_name)
        ORDER BY ss.avg_score DESC
      `;
      const result = await pool.query(query, [requirementId]);
      return result.rows;
    } catch (error) {
      handleDbError(error, 'getSkillsAnalysis');
    }
  },

  // Processing Queue
  async getProcessingQueue(requirementId) {
    try {
      const query = `
        SELECT 
          pq.*,
          c.candidate_name,
          ce.overall_score
        FROM processing_queue pq
        LEFT JOIN candidates c ON pq.candidate_email = c.email
        LEFT JOIN candidate_evaluations ce ON pq.evaluation_id = ce.evaluation_id
        WHERE pq.requirement_id = $1
        ORDER BY pq.queued_at DESC
      `;
      const result = await pool.query(query, [requirementId]);
      return result.rows;
    } catch (error) {
      handleDbError(error, 'getProcessingQueue');
    }
  },

  // Bulk operations
  async getJobsOverview(limit = 10) {
    try {
      const query = `
        SELECT 
          aj.*,
          as.total_candidates,
          as.recommended_candidates,
          as.average_score,
          COUNT(DISTINCT is.interview_id) as scheduled_interviews
        FROM analysis_jobs aj
        LEFT JOIN analysis_summaries as ON aj.requirement_id = as.job_id
        LEFT JOIN interview_schedules is ON aj.requirement_id = is.job_id
        GROUP BY aj.requirement_id, as.summary_id
        ORDER BY aj.submitted_at DESC
        LIMIT $1
      `;
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      handleDbError(error, 'getJobsOverview');
    }
  },

  // Custom queries
  async executeQuery(query, params = []) {
    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      handleDbError(error, 'executeQuery');
    }
  },

  // Connection management
  async testConnection() {
    try {
      const result = await pool.query('SELECT NOW()');
      return { connected: true, timestamp: result.rows[0].now };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  },

  async closeConnection() {
    await pool.end();
  }
};

export default db;