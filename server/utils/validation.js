const mongoose = require('mongoose');

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
exports.isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates email format
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes string input to prevent XSS
 */
exports.sanitizeString = (str, maxLength = 1000) => {
  if (typeof str !== 'string') return '';
  let sanitized = str.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  // Escape HTML characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  return sanitized;
};

/**
 * Validates date and ensures it's in the future
 */
exports.isValidFutureDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  return dateObj > new Date();
};

/**
 * Validates date range
 */
exports.isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  return end > start;
};

/**
 * Validates booking duration (15 minutes to 8 hours)
 */
exports.isValidBookingDuration = (startDate, endDate) => {
  if (!this.isValidDateRange(startDate, endDate)) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationHours = (end - start) / (1000 * 60 * 60);
  return durationHours >= 0.25 && durationHours <= 8;
};

/**
 * Validates rating (1-5)
 */
exports.isValidRating = (rating) => {
  const num = Number(rating);
  return !isNaN(num) && num >= 1 && num <= 5 && Number.isInteger(num);
};

/**
 * Validates password strength
 */
exports.isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6; // Minimum 6 characters
};

/**
 * Validates name
 */
exports.isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
};

/**
 * Validates subject array
 */
exports.isValidSubjects = (subjects) => {
  if (!Array.isArray(subjects)) return false;
  return subjects.every(subject => typeof subject === 'string' && subject.trim().length > 0);
};

/**
 * Validates hourly rate
 */
exports.isValidHourlyRate = (rate) => {
  const num = Number(rate);
  return !isNaN(num) && num >= 0 && num <= 10000; // Max $10,000/hr
};

/**
 * General input validator
 */
exports.validateInput = (data, rules) => {
  const errors = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    if (value !== undefined && value !== null && value !== '') {
      if (rule.type && typeof value !== rule.type) {
        errors[field] = `${field} must be of type ${rule.type}`;
        continue;
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
        continue;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field} must be at most ${rule.maxLength} characters`;
        continue;
      }
      
      if (rule.min !== undefined && Number(value) < rule.min) {
        errors[field] = `${field} must be at least ${rule.min}`;
        continue;
      }
      
      if (rule.max !== undefined && Number(value) > rule.max) {
        errors[field] = `${field} must be at most ${rule.max}`;
        continue;
      }
      
      if (rule.custom && !rule.custom(value)) {
        errors[field] = rule.customError || `${field} is invalid`;
        continue;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};








