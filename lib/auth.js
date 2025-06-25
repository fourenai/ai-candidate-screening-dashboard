import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret';

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Password hash
 * @returns {Promise<boolean>} Match result
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate request
 * @param {Object} req - Request object
 * @returns {Promise<Object|null>} User object or null
 */
export async function authenticate(req) {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    // Extract and verify token
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // Get user from database
    const result = await query(
      'SELECT * FROM users WHERE user_id = $1 AND is_active = true',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    
    // Remove sensitive data
    delete user.password_hash;
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Create session
 * @param {Object} user - User object
 * @returns {Object} Session data
 */
export function createSession(user) {
  const sessionData = {
    userId: user.user_id,
    email: user.email,
    role: user.role,
    createdAt: new Date().toISOString()
  };

  const token = generateToken(sessionData);
  
  return {
    token,
    expiresIn: '7d',
    user: {
      id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
}

/**
 * Require authentication middleware
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function requireAuth(handler) {
  return async (req, res) => {
    const user = await authenticate(req);
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    req.user = user;
    return handler(req, res);
  };
}

/**
 * Require specific role middleware
 * @param {string|Array} roles - Required role(s)
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function requireRole(roles, handler) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return requireAuth(async (req, res) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    return handler(req, res);
  });
}

/**
 * Get current user
 * @param {Object} req - Request object
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser(req) {
  return authenticate(req);
}

/**
 * Check if user has permission
 * @param {Object} user - User object
 * @param {string} permission - Permission name
 * @returns {Promise<boolean>} Permission check result
 */
export async function hasPermission(user, permission) {
  // Simple role-based check - extend as needed
  const rolePermissions = {
    admin: ['all'],
    manager: ['view_all', 'edit_all', 'create', 'delete'],
    recruiter: ['view_all', 'edit_own', 'create'],
    viewer: ['view_own']
  };

  const userPermissions = rolePermissions[user.role] || [];
  
  return userPermissions.includes('all') || userPermissions.includes(permission);
}

/**
 * Generate password reset token
 * @param {string} email - User email
 * @returns {Promise<string>} Reset token
 */
export async function generatePasswordResetToken(email) {
  const token = generateToken({ email, type: 'password_reset' }, '1h');
  
  // Store token in database
  await query(
    `UPDATE users 
     SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '1 hour'
     WHERE email = $2`,
    [token, email]
  );
  
  return token;
}

/**
 * Verify password reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} User data
 */
export async function verifyPasswordResetToken(token) {
  const decoded = verifyToken(token);
  
  if (decoded.type !== 'password_reset') {
    throw new Error('Invalid token type');
  }
  
  const result = await query(
    `SELECT * FROM users 
     WHERE email = $1 
     AND reset_token = $2 
     AND reset_token_expires > NOW()`,
    [decoded.email, token]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid or expired token');
  }
  
  return result.rows[0];
}

// Export all functions
export default {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticate,
  createSession,
  requireAuth,
  requireRole,
  getCurrentUser,
  hasPermission,
  generatePasswordResetToken,
  verifyPasswordResetToken
};