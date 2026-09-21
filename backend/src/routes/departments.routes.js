import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import * as departmentsController from '../controllers/departments.controller.js';

const router = Router();

router.get('/', departmentsController.listDepartments);

// Superadmin only — matches the "superadmin creates departments" rule.
router.post('/', requireAuth, requireRole('superadmin'), departmentsController.createDepartment);

export default router;
