import type { Request, Response, NextFunction } from "express";

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
      };
    }
  }
}

// Mock authentication middleware - replace with actual auth implementation
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  // For development, we'll use a simple username/password check
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Extract credentials from the bearer token (base64 encoded username:password)
  const token = authHeader.substring(7); // Remove 'Bearer '
  
  try {
    const credentials = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      return res.status(401).json({ message: 'Invalid credentials format' });
    }

    // Import storage here to avoid circular dependency
    const { storage } = await import('./storage');
    const user = await storage.getUserByUsername(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Attach user to request (excluding password)
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  next();
};