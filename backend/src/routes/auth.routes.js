import { Router } from 'express';
import { requireAuth,verifyToken } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// Supabase Auth handles the actual signup/login (email+password) on the
// frontend directly. These routes handle what happens *after* that:
// creating the app-level profile row, and role-specific verification steps.

// Create the app-level `users` row + department membership after
// Supabase Auth signup. Body: { role: 'student' | 'professor', departmentIds, universityIdDocumentUrl }
router.post('/complete-profile', verifyToken, authController.completeProfile);

// Redeem a superadmin-issued admin key. Body: { key, email, departmentId }
// Single-use: succeeds once, then the key is marked redeemed regardless of expiry.
router.post('/redeem-admin-key', verifyToken, authController.redeemAdminKey);

router.get('/me', requireAuth, authController.getMe);//MEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEMEEEEEEEEEEEEEEEEeeeeeeeeee

export default router;
