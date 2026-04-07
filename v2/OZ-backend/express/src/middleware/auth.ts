import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/responseUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'orderzap_secret_2024_secure_v2';

interface AuthRequest extends Request {
  user?: {
    id: string;
    restaurantId: string;
    role: string;
  };
}

/**
 * authenticateRestaurant — JWT Middleware
 * ──────────────────────────────────────
 * Verifies the 'Authorization: Bearer <token>' header.
 * Attaches the decoded staff member info to req.user.
 */
export const authenticateRestaurant = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authorization token required (Bearer <token>)');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      restaurantId: decoded.restaurantId,
      role: decoded.role
    };
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    return sendError(res, 401, 'Invalid or expired token');
  }
};
