
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const validation = await authService.validateSession(token);

  if (!validation.valid) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Attach user info to request
  (req as any).userId = validation.userId;
  (req as any).faceVerified = validation.faceVerified;

  next();
}

export async function requireFaceVerification(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).faceVerified) {
    return res.status(403).json({ message: 'Face verification required' });
  }
  next();
}
