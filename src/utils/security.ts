import DOMPurify from 'dompurify';

/**
 * Security utility functions for input validation and sanitization
 */

// Generate cryptographically secure UUID
export const generateSecureId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Sanitize HTML content to prevent XSS
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

// Validate and sanitize text input
export const sanitizeText = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';
  
  // Remove any HTML/script tags
  let sanitized = sanitizeHtml(input);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Validate task title
export const validateTaskTitle = (title: string): { valid: boolean; error?: string } => {
  const sanitized = sanitizeText(title, 200);
  
  if (!sanitized || sanitized.length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }
  
  if (sanitized.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }
  
  if (sanitized.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  
  return { valid: true };
};

// Validate task description
export const validateDescription = (description: string): { valid: boolean; error?: string } => {
  const sanitized = sanitizeText(description, 1000);
  
  if (sanitized.length > 1000) {
    return { valid: false, error: 'Description must be less than 1000 characters' };
  }
  
  return { valid: true };
};

// Validate and sanitize tags
export const sanitizeTags = (tags: string[]): string[] => {
  return tags
    .map(tag => sanitizeText(tag, 50))
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .slice(0, 10); // Max 10 tags
};

// Validate project name
export const validateProjectName = (name: string): { valid: boolean; error?: string } => {
  const sanitized = sanitizeText(name, 100);
  
  if (!sanitized || sanitized.length === 0) {
    return { valid: false, error: 'Project name cannot be empty' };
  }
  
  if (sanitized.length < 2) {
    return { valid: false, error: 'Project name must be at least 2 characters' };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, error: 'Project name must be less than 100 characters' };
  }
  
  return { valid: true };
};

// Rate limiting helper
class RateLimiter {
  private actions: Map<string, number[]> = new Map();
  private readonly maxActions: number;
  private readonly timeWindow: number; // in milliseconds

  constructor(maxActions: number = 10, timeWindowMs: number = 60000) {
    this.maxActions = maxActions;
    this.timeWindow = timeWindowMs;
  }

  canPerformAction(actionType: string): boolean {
    const now = Date.now();
    const timestamps = this.actions.get(actionType) || [];
    
    // Remove old timestamps outside the time window
    const recentTimestamps = timestamps.filter(ts => now - ts < this.timeWindow);
    
    if (recentTimestamps.length >= this.maxActions) {
      return false;
    }
    
    recentTimestamps.push(now);
    this.actions.set(actionType, recentTimestamps);
    return true;
  }

  reset(actionType?: string): void {
    if (actionType) {
      this.actions.delete(actionType);
    } else {
      this.actions.clear();
    }
  }
}

export const rateLimiter = new RateLimiter(10, 60000); // 10 actions per minute

// Encrypt data for localStorage (simple XOR encryption for demo - use proper encryption in production)
export const encryptData = (data: string, key: string = 'task-app-key'): string => {
  try {
    const encrypted = btoa(
      data.split('').map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
      ).join('')
    );
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return data;
  }
};

// Decrypt data from localStorage
export const decryptData = (encryptedData: string, key: string = 'task-app-key'): string => {
  try {
    const decrypted = atob(encryptedData)
      .split('')
      .map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
      )
      .join('');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData;
  }
};

// Validate UUID format
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Safe JSON parse with error handling
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
};

// Sanitize error messages for user display
export const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Don't expose stack traces or internal details
    return 'An error occurred. Please try again.';
  }
  return 'An unexpected error occurred.';
};
