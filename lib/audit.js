import { query } from './db';

/**
 * Log an activity to the audit log
 * @param {Object} options - Audit log options
 * @returns {Promise<Object>} Created audit log entry
 */
export async function logActivity(options) {
  const {
    action,
    entity_type,
    entity_id,
    job_id = null,
    candidate_id = null,
    user_id = 'system',
    ip_address = null,
    user_agent = null,
    details = {}
  } = options;

  try {
    const result = await query(`
      INSERT INTO audit_log (
        action,
        entity_type,
        entity_id,
        job_id,
        candidate_id,
        user_id,
        ip_address,
        user_agent,
        details,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      action,
      entity_type,
      entity_id,
      job_id,
      candidate_id,
      user_id,
      ip_address,
      user_agent,
      JSON.stringify(details)
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - audit logging should not break the main flow
    return null;
  }
}

/**
 * Get audit logs with filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Audit log entries
 */
export async function getAuditLogs(filters = {}) {
  const {
    action,
    entity_type,
    entity_id,
    job_id,
    candidate_id,
    user_id,
    start_date,
    end_date,
    limit = 100,
    offset = 0
  } = filters;

  let whereConditions = [];
  let params = [];
  let paramIndex = 1;

  // Build WHERE conditions
  if (action) {
    whereConditions.push(`action = $${paramIndex++}`);
    params.push(action);
  }

  if (entity_type) {
    whereConditions.push(`entity_type = $${paramIndex++}`);
    params.push(entity_type);
  }

  if (entity_id) {
    whereConditions.push(`entity_id = $${paramIndex++}`);
    params.push(entity_id);
  }

  if (job_id) {
    whereConditions.push(`job_id = $${paramIndex++}`);
    params.push(job_id);
  }

  if (candidate_id) {
    whereConditions.push(`candidate_id = $${paramIndex++}`);
    params.push(candidate_id);
  }

  if (user_id) {
    whereConditions.push(`user_id = $${paramIndex++}`);
    params.push(user_id);
  }

  if (start_date) {
    whereConditions.push(`created_at >= $${paramIndex++}`);
    params.push(start_date);
  }

  if (end_date) {
    whereConditions.push(`created_at <= $${paramIndex++}`);
    params.push(end_date);
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Add pagination
  params.push(limit, offset);

  const auditQuery = `
    SELECT 
      al.*,
      c.candidate_name,
      aj.job_title
    FROM audit_log al
    LEFT JOIN candidates c ON al.candidate_id = c.candidate_id
    LEFT JOIN analysis_jobs aj ON al.job_id = aj.requirement_id
    ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const result = await query(auditQuery, params);
  return result.rows;
}

/**
 * Log analysis activity
 * @param {Object} options - Analysis activity options
 * @returns {Promise<Object>} Audit log entry
 */
export async function logAnalysisActivity(options) {
  const {
    job_id,
    action,
    details = {},
    user_id = 'system'
  } = options;

  return logActivity({
    action: `analysis_${action}`,
    entity_type: 'analysis_job',
    entity_id: job_id,
    job_id,
    user_id,
    details
  });
}

/**
 * Log candidate activity
 * @param {Object} options - Candidate activity options
 * @returns {Promise<Object>} Audit log entry
 */
export async function logCandidateActivity(options) {
  const {
    candidate_id,
    action,
    job_id = null,
    details = {},
    user_id = 'system'
  } = options;

  return logActivity({
    action: `candidate_${action}`,
    entity_type: 'candidate',
    entity_id: candidate_id,
    candidate_id,
    job_id,
    user_id,
    details
  });
}

/**
 * Log interview activity
 * @param {Object} options - Interview activity options
 * @returns {Promise<Object>} Audit log entry
 */
export async function logInterviewActivity(options) {
  const {
    interview_id,
    candidate_id,
    job_id,
    action,
    details = {},
    user_id = 'system'
  } = options;

  return logActivity({
    action: `interview_${action}`,
    entity_type: 'interview',
    entity_id: interview_id,
    candidate_id,
    job_id,
    user_id,
    details
  });
}

/**
 * Log error
 * @param {Object} options - Error options
 * @returns {Promise<Object>} Error log entry
 */
export async function logError(options) {
  const {
    requirement_id = null,
    candidate_id = null,
    error_type,
    error_severity = 'error',
    error_message,
    error_details = {},
    workflow_step = null,
    node_name = null,
    user_message = null
  } = options;

  try {
    const result = await query(`
      INSERT INTO error_logs (
        requirement_id,
        candidate_id,
        error_type,
        error_severity,
        error_message,
        error_details,
        workflow_step,
        node_name,
        user_message,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      requirement_id,
      candidate_id,
      error_type,
      error_severity,
      error_message,
      JSON.stringify(error_details),
      workflow_step,
      node_name,
      user_message
    ]);

    // Also log to audit trail
    await logActivity({
      action: 'error_occurred',
      entity_type: 'error',
      entity_id: result.rows[0].error_id,
      job_id: requirement_id,
      candidate_id,
      details: {
        error_type,
        error_severity,
        workflow_step
      }
    });

    return result.rows[0];
  } catch (error) {
    console.error('Failed to log error:', error);
    return null;
  }
}

/**
 * Get error logs
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Error log entries
 */
export async function getErrorLogs(filters = {}) {
  const {
    requirement_id,
    candidate_id,
    error_type,
    error_severity,
    resolved,
    start_date,
    end_date,
    limit = 100,
    offset = 0
  } = filters;

  let whereConditions = [];
  let params = [];
  let paramIndex = 1;

  // Build WHERE conditions
  if (requirement_id) {
    whereConditions.push(`requirement_id = $${paramIndex++}`);
    params.push(requirement_id);
  }

  if (candidate_id) {
    whereConditions.push(`candidate_id = $${paramIndex++}`);
    params.push(candidate_id);
  }

  if (error_type) {
    whereConditions.push(`error_type = $${paramIndex++}`);
    params.push(error_type);
  }

  if (error_severity) {
    whereConditions.push(`error_severity = $${paramIndex++}`);
    params.push(error_severity);
  }

  if (resolved !== undefined) {
    whereConditions.push(`resolved = $${paramIndex++}`);
    params.push(resolved);
  }

  if (start_date) {
    whereConditions.push(`created_at >= $${paramIndex++}`);
    params.push(start_date);
  }

  if (end_date) {
    whereConditions.push(`created_at <= $${paramIndex++}`);
    params.push(end_date);
  }

  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Add pagination
  params.push(limit, offset);

  const errorQuery = `
    SELECT 
      el.*,
      aj.job_title,
      c.candidate_name
    FROM error_logs el
    LEFT JOIN analysis_jobs aj ON el.requirement_id = aj.requirement_id
    LEFT JOIN candidates c ON el.candidate_id = c.candidate_id
    ${whereClause}
    ORDER BY el.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const result = await query(errorQuery, params);
  return result.rows;
}

/**
 * Mark error as resolved
 * @param {string} error_id - Error ID
 * @param {string} user_id - User who resolved the error
 * @returns {Promise<Object>} Updated error log
 */
export async function resolveError(error_id, user_id = 'system') {
  const result = await query(`
    UPDATE error_logs 
    SET 
      resolved = true,
      resolved_at = CURRENT_TIMESTAMP
    WHERE error_id = $1
    RETURNING *
  `, [error_id]);

  if (result.rows.length > 0) {
    await logActivity({
      action: 'error_resolved',
      entity_type: 'error',
      entity_id: error_id,
      user_id,
      details: {
        resolved_at: new Date().toISOString()
      }
    });
  }

  return result.rows[0];
}

/**
 * Get activity summary
 * @param {Object} options - Summary options
 * @returns {Promise<Object>} Activity summary
 */
export async function getActivitySummary(options = {}) {
  const {
    start_date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end_date = new Date(),
    group_by = 'action'
  } = options;

  const summaryQuery = `
    SELECT 
      ${group_by},
      COUNT(*) as count,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT job_id) as unique_jobs,
      COUNT(DISTINCT candidate_id) as unique_candidates
    FROM audit_log
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY ${group_by}
    ORDER BY count DESC
  `;

  const result = await query(summaryQuery, [start_date, end_date]);
  return result.rows;
}

/**
 * Clean up old audit logs
 * @param {number} daysToKeep - Number of days to keep logs
 * @returns {Promise<number>} Number of deleted records
 */
export async function cleanupAuditLogs(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await query(`
    DELETE FROM audit_log
    WHERE created_at < $1
    RETURNING log_id
  `, [cutoffDate]);

  await logActivity({
    action: 'audit_cleanup',
    entity_type: 'system',
    entity_id: 'audit_log',
    details: {
      deleted_count: result.rowCount,
      cutoff_date: cutoffDate.toISOString(),
      days_kept: daysToKeep
    }
  });

  return result.rowCount;
}

// Export all functions
export default {
  logActivity,
  getAuditLogs,
  logAnalysisActivity,
  logCandidateActivity,
  logInterviewActivity,
  logError,
  getErrorLogs,
  resolveError,
  getActivitySummary,
  cleanupAuditLogs
};