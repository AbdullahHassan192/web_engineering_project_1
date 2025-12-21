/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting
 */
const rateLimitMap = new Map();

const cleanOldEntries = () => {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(key);
    }
  }
};

// Clean old entries every 5 minutes
setInterval(cleanOldEntries, 5 * 60 * 1000);

/**
 * Rate limiter middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 */
const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100 // 100 requests per window default
  } = options;

  return (req, res, next) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();
    
    const record = rateLimitMap.get(key);
    
    if (!record || now > record.resetTime) {
      // Create new record
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter,
        message: `Rate limit exceeded. Please try again after ${retryAfter} seconds.`
      });
    }
    
    record.count++;
    next();
  };
};

/**
 * Chat-specific rate limiter (more restrictive)
 */
const chatRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 messages per minute
});

/**
 * Auth-specific rate limiter (very restrictive)
 */
const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50 // 50 login attempts per 15 minutes
});

module.exports = {
  rateLimiter,
  chatRateLimiter,
  authRateLimiter
};








