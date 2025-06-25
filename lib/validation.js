/**
 * Validation rules and helpers
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * URL validation regex
 */
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

/**
 * UUID validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Phone validation regex (international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Validate request data against schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result
 */
export function validateRequest(data, schema) {
  const errors = [];
  const validated = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({ 
        field, 
        message: `${field} is required`,
        code: 'REQUIRED_FIELD'
      });
      continue;
    }

    // Skip optional fields that are not provided
    if (!rules.required && (value === undefined || value === null)) {
      if (rules.default !== undefined) {
        validated[field] = rules.default;
      }
      continue;
    }

    // Type validation
    if (rules.type) {
      const typeError = validateType(value, rules.type, field);
      if (typeError) {
        errors.push(typeError);
        continue;
      }
    }

    // String validations
    if (typeof value === 'string') {
      // Min length
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push({ 
          field, 
          message: `${field} must be at least ${rules.minLength} characters`,
          code: 'MIN_LENGTH'
        });
      }

      // Max length
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push({ 
          field, 
          message: `${field} must be at most ${rules.maxLength} characters`,
          code: 'MAX_LENGTH'
        });
      }

      // Pattern matching
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({ 
          field, 
          message: `${field} has invalid format`,
          code: 'INVALID_FORMAT'
        });
      }
    }

    // Number validations
    if (typeof value === 'number') {
      // Min value
      if (rules.min !== undefined && value < rules.min) {
        errors.push({ 
          field, 
          message: `${field} must be at least ${rules.min}`,
          code: 'MIN_VALUE'
        });
      }

      // Max value
      if (rules.max !== undefined && value > rules.max) {
        errors.push({ 
          field, 
          message: `${field} must be at most ${rules.max}`,
          code: 'MAX_VALUE'
        });
      }
    }

    // Array validations
    if (Array.isArray(value)) {
      // Min items
      if (rules.minItems !== undefined && value.length < rules.minItems) {
        errors.push({ 
          field, 
          message: `${field} must have at least ${rules.minItems} items`,
          code: 'MIN_ITEMS'
        });
      }

      // Max items
      if (rules.maxItems !== undefined && value.length > rules.maxItems) {
        errors.push({ 
          field, 
          message: `${field} must have at most ${rules.maxItems} items`,
          code: 'MAX_ITEMS'
        });
      }

      // Item validation
      if (rules.items) {
        value.forEach((item, index) => {
          const itemErrors = validateRequest(
            { [field]: item }, 
            { [field]: rules.items }
          );
          if (!itemErrors.valid) {
            itemErrors.errors.forEach(error => {
              errors.push({
                ...error,
                field: `${field}[${index}].${error.field.replace(field + '.', '')}`
              });
            });
          }
        });
      }
    }

    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push({ 
        field, 
        message: `${field} must be one of: ${rules.enum.join(', ')}`,
        code: 'INVALID_ENUM'
      });
    }

    // Custom validation function
    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value, data);
      if (customError) {
        errors.push({ 
          field, 
          message: customError,
          code: 'CUSTOM_VALIDATION'
        });
      }
    }

    validated[field] = value;
  }

  return {
    valid: errors.length === 0,
    errors,
    data: validated
  };
}

/**
 * Validate data type
 * @param {*} value - Value to validate
 * @param {string} type - Expected type
 * @param {string} field - Field name
 * @returns {Object|null} Error object or null
 */
function validateType(value, type, field) {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return { 
          field, 
          message: `${field} must be a string`,
          code: 'INVALID_TYPE'
        };
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return { 
          field, 
          message: `${field} must be a number`,
          code: 'INVALID_TYPE'
        };
      }
      break;

    case 'integer':
      if (!Number.isInteger(value)) {
        return { 
          field, 
          message: `${field} must be an integer`,
          code: 'INVALID_TYPE'
        };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { 
          field, 
          message: `${field} must be a boolean`,
          code: 'INVALID_TYPE'
        };
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return { 
          field, 
          message: `${field} must be an array`,
          code: 'INVALID_TYPE'
        };
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { 
          field, 
          message: `${field} must be an object`,
          code: 'INVALID_TYPE'
        };
      }
      break;

    case 'email':
      if (!EMAIL_REGEX.test(value)) {
        return { 
          field, 
          message: `${field} must be a valid email`,
          code: 'INVALID_EMAIL'
        };
      }
      break;

    case 'url':
      if (!URL_REGEX.test(value)) {
        return { 
          field, 
          message: `${field} must be a valid URL`,
          code: 'INVALID_URL'
        };
      }
      break;

    case 'uuid':
      if (!UUID_REGEX.test(value)) {
        return { 
          field, 
          message: `${field} must be a valid UUID`,
          code: 'INVALID_UUID'
        };
      }
      break;

    case 'phone':
      if (!PHONE_REGEX.test(value)) {
        return { 
          field, 
          message: `${field} must be a valid phone number`,
          code: 'INVALID_PHONE'
        };
      }
      break;

    case 'date':
      if (!(value instanceof Date) && isNaN(Date.parse(value))) {
        return { 
          field, 
          message: `${field} must be a valid date`,
          code: 'INVALID_DATE'
        };
      }
      break;

    case 'datetime':
      if (isNaN(Date.parse(value))) {
        return { 
          field, 
          message: `${field} must be a valid datetime`,
          code: 'INVALID_DATETIME'
        };
      }
      break;
  }

  return null;
}

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/"/g, '\\"'); // Escape double quotes
}

/**
 * Sanitize object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Validate pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Validated pagination
 */
export function validatePagination(params) {
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
  
  return { page, limit };
}

/**
 * Validate sort parameters
 * @param {string} sort - Sort parameter
 * @param {Array} allowedFields - Allowed sort fields
 * @returns {Object} Validated sort
 */
export function validateSort(sort, allowedFields) {
  if (!sort) return null;
  
  const [field, direction = 'ASC'] = sort.split(':');
  
  if (!allowedFields.includes(field)) {
    throw new Error(`Invalid sort field: ${field}`);
  }
  
  if (!['ASC', 'DESC'].includes(direction.toUpperCase())) {
    throw new Error(`Invalid sort direction: ${direction}`);
  }
  
  return { field, direction: direction.toUpperCase() };
}

/**
 * Common validation schemas
 */
export const schemas = {
  // User registration
  userRegistration: {
    email: { 
      required: true, 
      type: 'email',
      maxLength: 255
    },
    password: { 
      required: true, 
      type: 'string',
      minLength: 8,
      maxLength: 100,
      custom: (value) => {
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special character';
        return null;
      }
    },
    name: { 
      required: true, 
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    role: { 
      type: 'string',
      enum: ['admin', 'manager', 'recruiter', 'viewer'],
      default: 'viewer'
    }
  },

  // Job creation
  jobCreation: {
    jobTitle: { 
      required: true, 
      type: 'string',
      minLength: 3,
      maxLength: 255
    },
    jobDescription: { 
      type: 'string',
      maxLength: 10000
    },
    experienceLevel: { 
      type: 'string',
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: 'mid'
    },
    skills: {
      type: 'array',
      maxItems: 50,
      items: {
        type: 'string',
        maxLength: 100
      }
    }
  },

  // Interview scheduling
  interviewScheduling: {
    job_id: { 
      required: true, 
      type: 'uuid'
    },
    candidate_id: { 
      required: true, 
      type: 'uuid'
    },
    scheduled_at: { 
      required: true, 
      type: 'datetime',
      custom: (value) => {
        const date = new Date(value);
        if (date < new Date()) {
          return 'Scheduled time must be in the future';
        }
        return null;
      }
    },
    duration_minutes: { 
      type: 'integer',
      min: 15,
      max: 480,
      default: 60
    },
    interview_type: { 
      type: 'string',
      enum: ['technical', 'behavioral', 'video', 'phone', 'hr', 'final'],
      default: 'technical'
    },
    interviewer_email: { 
      type: 'email'
    },
    meeting_link: { 
      type: 'url'
    },
    notes: { 
      type: 'string',
      maxLength: 1000
    }
  }
};

// Export all functions
export default {
  validateRequest,
  sanitizeString,
  sanitizeObject,
  validatePagination,
  validateSort,
  schemas,
  EMAIL_REGEX,
  URL_REGEX,
  UUID_REGEX,
  PHONE_REGEX
};