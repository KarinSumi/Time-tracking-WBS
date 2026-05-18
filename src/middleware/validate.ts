import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure required fields are present in the request body.
 * @param fields - Array of field names that must be present and non-empty.
 */
export const requireFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = fields.filter(f => {
      const val = req.body[f];
      return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
    });

    if (missing.length > 0) {
      res.status(400).json({ 
        error: `Missing required fields: ${missing.join(', ')}` 
      });
      return;
    }
    next();
  };
};

/**
 * Middleware to validate specific field types or values.
 * Can be expanded as needed.
 */
export const validateType = (field: string, type: 'number' | 'string' | 'date') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const val = req.body[field];
    if (val === undefined || val === null) return next();

    let valid = true;
    if (type === 'number') valid = !isNaN(Number(val));
    else if (type === 'date') valid = !isNaN(new Date(val).getTime());
    else if (type === 'string') valid = typeof val === 'string';

    if (!valid) {
      res.status(400).json({ error: `Invalid type for field ${field}: expected ${type}` });
      return;
    }
    next();
  };
};
