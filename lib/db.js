import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Error handling for pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

/**
 * Execute a query against the database
 * @param {string} text - The SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function query(text, params = []) {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.log('Slow query detected:', {
        query: text,
        duration: `${duration}ms`,
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', {
      query: text,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transaction support
 * @returns {Promise<Object>} Database client
 */
export async function getClient() {
  const client = await pool.connect();
  
  // Wrap the release method to ensure proper cleanup
  const originalRelease = client.release.bind(client);
  let released = false;
  
  client.release = () => {
    if (!released) {
      released = true;
      return originalRelease();
    }
  };
  
  // Set a timeout to automatically release the client
  setTimeout(() => {
    if (!released) {
      console.warn('Client was not released after 5 seconds, releasing automatically');
      client.release();
    }
  }, 5000);
  
  return client;
}

/**
 * Execute a transaction
 * @param {Function} callback - Async function that receives the client
 * @returns {Promise<*>} Transaction result
 */
export async function transaction(callback) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Batch insert helper
 * @param {string} table - Table name
 * @param {Array<string>} columns - Column names
 * @param {Array<Array>} values - Array of value arrays
 * @returns {Promise<Object>} Insert result
 */
export async function batchInsert(table, columns, values) {
  if (!values || values.length === 0) {
    return { rows: [], rowCount: 0 };
  }
  
  const placeholders = values.map((_, rowIndex) => {
    const rowPlaceholders = columns.map((_, colIndex) => {
      return `$${rowIndex * columns.length + colIndex + 1}`;
    });
    return `(${rowPlaceholders.join(', ')})`;
  });
  
  const flatValues = values.flat();
  const insertQuery = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES ${placeholders.join(', ')}
    RETURNING *
  `;
  
  return await query(insertQuery, flatValues);
}

/**
 * Build dynamic WHERE clause
 * @param {Object} conditions - Key-value pairs for conditions
 * @param {number} startIndex - Starting parameter index
 * @returns {Object} { clause, params, nextIndex }
 */
export function buildWhereClause(conditions, startIndex = 1) {
  const clauses = [];
  const params = [];
  let paramIndex = startIndex;
  
  for (const [key, value] of Object.entries(conditions)) {
    if (value === undefined || value === null) continue;
    
    if (Array.isArray(value)) {
      // Handle IN clause
      const placeholders = value.map(() => `$${paramIndex++}`);
      clauses.push(`${key} IN (${placeholders.join(', ')})`);
      params.push(...value);
    } else if (typeof value === 'object' && value.operator) {
      // Handle custom operators
      switch (value.operator) {
        case 'like':
          clauses.push(`${key} LIKE $${paramIndex++}`);
          params.push(`%${value.value}%`);
          break;
        case 'gt':
          clauses.push(`${key} > $${paramIndex++}`);
          params.push(value.value);
          break;
        case 'gte':
          clauses.push(`${key} >= $${paramIndex++}`);
          params.push(value.value);
          break;
        case 'lt':
          clauses.push(`${key} < $${paramIndex++}`);
          params.push(value.value);
          break;
        case 'lte':
          clauses.push(`${key} <= $${paramIndex++}`);
          params.push(value.value);
          break;
        case 'between':
          clauses.push(`${key} BETWEEN $${paramIndex++} AND $${paramIndex++}`);
          params.push(value.value[0], value.value[1]);
          break;
        case 'not':
          clauses.push(`${key} != $${paramIndex++}`);
          params.push(value.value);
          break;
        case 'is_null':
          clauses.push(`${key} IS NULL`);
          break;
        case 'is_not_null':
          clauses.push(`${key} IS NOT NULL`);
          break;
        default:
          clauses.push(`${key} = $${paramIndex++}`);
          params.push(value.value);
      }
    } else {
      // Handle simple equality
      clauses.push(`${key} = $${paramIndex++}`);
      params.push(value);
    }
  }
  
  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
    nextIndex: paramIndex
  };
}

/**
 * Build ORDER BY clause
 * @param {Object|string} sort - Sort configuration
 * @returns {string} ORDER BY clause
 */
export function buildOrderByClause(sort) {
  if (!sort) return '';
  
  if (typeof sort === 'string') {
    return `ORDER BY ${sort}`;
  }
  
  if (typeof sort === 'object') {
    const { field, direction = 'ASC' } = sort;
    return `ORDER BY ${field} ${direction.toUpperCase()}`;
  }
  
  if (Array.isArray(sort)) {
    const clauses = sort.map(s => {
      if (typeof s === 'string') return s;
      return `${s.field} ${(s.direction || 'ASC').toUpperCase()}`;
    });
    return `ORDER BY ${clauses.join(', ')}`;
  }
  
  return '';
}

/**
 * Build pagination clause
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} { clause, offset, limit }
 */
export function buildPaginationClause(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return {
    clause: `LIMIT ${limit} OFFSET ${offset}`,
    offset,
    limit
  };
}

/**
 * Execute a paginated query
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
export async function paginatedQuery({
  table,
  columns = '*',
  conditions = {},
  sort = null,
  page = 1,
  limit = 20,
  joins = []
}) {
  // Build query parts
  const { clause: whereClause, params } = buildWhereClause(conditions);
  const orderByClause = buildOrderByClause(sort);
  const { clause: paginationClause, offset } = buildPaginationClause(page, limit);
  
  // Build join clause
  const joinClause = joins.map(join => {
    if (typeof join === 'string') return join;
    const { type = 'INNER', table, on } = join;
    return `${type} JOIN ${table} ON ${on}`;
  }).join(' ');
  
  // Count total rows
  const countQuery = `
    SELECT COUNT(*) as total
    FROM ${table}
    ${joinClause}
    ${whereClause}
  `;
  
  const countResult = await query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);
  
  // Get paginated data
  const dataQuery = `
    SELECT ${columns}
    FROM ${table}
    ${joinClause}
    ${whereClause}
    ${orderByClause}
    ${paginationClause}
  `;
  
  const dataResult = await query(dataQuery, params);
  
  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}

/**
 * Upsert helper (INSERT ... ON CONFLICT UPDATE)
 * @param {Object} options - Upsert options
 * @returns {Promise<Object>} Upsert result
 */
export async function upsert({
  table,
  data,
  conflictColumns,
  updateColumns = null,
  returning = '*'
}) {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map((_, i) => `$${i + 1}`);
  
  let upsertQuery = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders.join(', ')})
    ON CONFLICT (${conflictColumns.join(', ')})
  `;
  
  if (updateColumns) {
    // Update specific columns
    const updateClauses = updateColumns.map(col => 
      `${col} = EXCLUDED.${col}`
    );
    upsertQuery += ` DO UPDATE SET ${updateClauses.join(', ')}`;
  } else {
    // Update all columns except conflict columns
    const updateClauses = columns
      .filter(col => !conflictColumns.includes(col))
      .map(col => `${col} = EXCLUDED.${col}`);
    
    if (updateClauses.length > 0) {
      upsertQuery += ` DO UPDATE SET ${updateClauses.join(', ')}`;
    } else {
      upsertQuery += ' DO NOTHING';
    }
  }
  
  if (returning) {
    upsertQuery += ` RETURNING ${returning}`;
  }
  
  return await query(upsertQuery, values);
}

/**
 * Soft delete helper
 * @param {string} table - Table name
 * @param {Object} conditions - Delete conditions
 * @param {string} column - Soft delete column (default: 'deleted_at')
 * @returns {Promise<Object>} Delete result
 */
export async function softDelete(table, conditions, column = 'deleted_at') {
  const { clause: whereClause, params } = buildWhereClause(conditions);
  
  const deleteQuery = `
    UPDATE ${table}
    SET ${column} = CURRENT_TIMESTAMP
    ${whereClause}
    RETURNING *
  `;
  
  return await query(deleteQuery, params);
}

/**
 * Bulk update helper
 * @param {string} table - Table name
 * @param {Array} updates - Array of { conditions, data } objects
 * @returns {Promise<Object>} Update result
 */
export async function bulkUpdate(table, updates) {
  return await transaction(async (client) => {
    const results = [];
    
    for (const update of updates) {
      const { conditions, data } = update;
      const { clause: whereClause, params: whereParams } = buildWhereClause(conditions);
      
      const setClauses = [];
      const setParams = [];
      let paramIndex = whereParams.length + 1;
      
      for (const [key, value] of Object.entries(data)) {
        setClauses.push(`${key} = $${paramIndex++}`);
        setParams.push(value);
      }
      
      const updateQuery = `
        UPDATE ${table}
        SET ${setClauses.join(', ')}
        ${whereClause}
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, [...whereParams, ...setParams]);
      results.push(...result.rows);
    }
    
    return results;
  });
}

/**
 * Close the database pool
 */
export async function closePool() {
  await pool.end();
}

// Export the pool for advanced use cases
export { pool };

// Default export for common query function
export default query;