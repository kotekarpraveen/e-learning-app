/**
 * NOTE: This is the Backend logic for the project. 
 * Since this is a browser-based demo, this file is provided as a reference implementation
 * for the "Secure Node.js Backend" requirement.
 * 
 * To run this:
 * 1. npm init -y
 * 2. npm install express cors helmet jsonwebtoken bcryptjs mongoose dotenv
 * 3. npx ts-node server/index.ts
 */

import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// --- CONFIG ---
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_in_prod';

// --- MIDDLEWARE ---
app.use(helmet() as unknown as RequestHandler); // Security Headers
app.use(cors()); // Allow frontend
app.use(express.json());

// --- TYPES ---
interface AuthRequest extends Request {
  user?: any;
}

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    (req as AuthRequest).user = user;
    next();
  });
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin') {
    res.sendStatus(403);
    return;
  }
  next();
};

// --- MOCK DATABASE ---
const users: any[] = []; // In a real app, connect to MongoDB
const courses: any[] = [];

// --- ROUTES ---

// Auth
app.post('/api/auth/login', async (req: Request, res: Response) => {
  // Mock login logic
  const { email, password } = req.body;
  // Verify password with bcrypt in real app
  const user = { id: '1', email, role: email.includes('admin') ? 'admin' : 'student' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user });
});

// Student: Get Courses
app.get('/api/courses', authenticateToken, (req: Request, res: Response) => {
  res.json(courses); // Return public info
});

// Admin: Create Course
app.post('/api/courses', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const newCourse = { id: Date.now(), ...req.body };
  courses.push(newCourse);
  res.status(201).json(newCourse);
});

// Admin: Upload Content (Stub for S3/Upload)
app.post('/api/upload', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  // Use multer for file handling here
  res.json({ url: 'https://cdn.lumina.com/uploads/video1.mp4' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});