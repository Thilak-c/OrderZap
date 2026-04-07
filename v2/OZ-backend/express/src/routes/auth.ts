import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, getClient } from '../config/database';
import { mutationConvex } from '../services/convexClient';
import { sendSuccess, sendError } from '../utils/responseUtils';
import { authenticateRestaurant } from '../middleware/auth';
import type { Restaurant, Staff } from '../types/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'orderzap_secret_2024_secure_v2';

/**
 * POST /api/auth/register
 * ───────────────────────
 * Registers a new restaurant and its owner.
 */
router.post('/register', async (req: Request, res: Response) => {
  const client = await getClient();
  try {
    const { 
      short_id, name, email, password, phone, 
      logo = '', status = 'trial', active = true 
    } = req.body;

    if (!short_id || !name || !email || !password) {
      return sendError(res, 400, 'short_id, name, email, and password are required');
    }

    // 1. Transaction Start
    await client.query('BEGIN');

    // 2. Check for existing restaurant or email
    const existingRestaurant = await client.query('SELECT id FROM restaurants WHERE short_id = $1', [short_id]);
    if (existingRestaurant.rows.length > 0) {
      await client.query('ROLLBACK');
      return sendError(res, 400, `Restaurant with short_id "${short_id}" already exists`);
    }

    const existingStaff = await client.query('SELECT id FROM staff WHERE email = $1', [email]);
    if (existingStaff.rows.length > 0) {
      await client.query('ROLLBACK');
      return sendError(res, 400, `Email "${email}" is already registered`);
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create Restaurant
    const now = Date.now();
    const restResult = await client.query<Restaurant>(
      `INSERT INTO restaurants (short_id, name, email, phone, logo, status, active, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [short_id, name, email, phone, logo, status, active, now]
    );
    const restaurant = restResult.rows[0];

    // 5. Create Owner Staff
    const staffResult = await client.query<Staff>(
      `INSERT INTO staff (restaurant_id, name, role, email, password, active, joining_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [restaurant.id, 'Owner', 'owner', email, hashedPassword, true, now]
    );
    const owner = staffResult.rows[0];

    // 6. Transaction Commit
    await client.query('COMMIT');

    // 7. Sync to Convex (Fire and forget, but logged)
    try {
      await mutationConvex('menu:upsertRestaurantMirror', {
        pgId: restaurant.id,
        shortId: restaurant.short_id,
        name: restaurant.name,
        active: restaurant.active
      });
      await mutationConvex('menu:upsertStaffMirror', {
        pgId: owner.id,
        restaurantId: restaurant.short_id,
        name: owner.name,
        role: owner.role,
        isActive: owner.active
      });
    } catch (syncErr) {
      console.warn('⚠️ Register Convex Sync Warning:', syncErr);
    }

    // 8. Generate Token
    const token = jwt.sign(
      { id: owner.id, restaurantId: restaurant.short_id, role: owner.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendSuccess(res, {
      token,
      restaurant: {
        short_id: restaurant.short_id,
        name: restaurant.name,
        logo: restaurant.logo
      }
    }, 201);

  } catch (err) {
    await client.query('ROLLBACK');
    const message = err instanceof Error ? err.message : String(err);
    console.error('Registration Error:', message);
    sendError(res, 500, `Registration failed: ${message}`);
  } finally {
    client.release();
  }
});

/**
 * POST /api/auth/login
 * ────────────────────
 * Authenticates a restaurant staff member.
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    // 1. Find staff member
    const staffRows = await query<Staff>('SELECT * FROM staff WHERE email = $1 AND active = true', [email]);
    if (staffRows.length === 0) {
      return sendError(res, 401, 'Invalid email or password');
    }
    const staff = staffRows[0];

    // 2. Verify Password
    const isValid = await bcrypt.compare(password, staff.password || '');
    if (!isValid) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // 3. Find Restaurant Metadata
    const restRows = await query<Restaurant>('SELECT short_id, name, logo FROM restaurants WHERE id = $1', [staff.restaurant_id]);
    if (restRows.length === 0) {
      return sendError(res, 404, 'Associated restaurant not found');
    }
    const restaurant = restRows[0];

    // 4. Generate Token
    const token = jwt.sign(
      { id: staff.id, restaurantId: restaurant.short_id, role: staff.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendSuccess(res, {
      token,
      restaurant: {
        short_id: restaurant.short_id,
        name: restaurant.name,
        logo: restaurant.logo
      },
      staff: {
        id: staff.id,
        name: staff.name,
        role: staff.role
      }
    });

  } catch (err) {
    console.error('Login Error:', err);
    sendError(res, 500, 'Authentication failed');
  }
});

/**
 * GET /api/auth/me
 * ────────────────
 * Returns the current staff member's profile and restaurant data.
 */
router.get('/me', authenticateRestaurant, async (req: any, res: Response) => {
  try {
    const { id, restaurantId } = req.user;

    // 1. Fetch Staff
    const staffRows = await query<Staff>('SELECT id, name, role, email, phone FROM staff WHERE id = $1', [id]);
    if (staffRows.length === 0) {
      return sendError(res, 404, 'Staff profile not found');
    }
    const staff = staffRows[0];

    // 2. Fetch Restaurant
    const restRows = await query<Restaurant>('SELECT short_id, name, logo FROM restaurants WHERE short_id = $1', [restaurantId]);
    if (restRows.length === 0) {
      return sendError(res, 404, 'Restaurant data not found');
    }
    const restaurant = restRows[0];

    sendSuccess(res, {
      staff,
      restaurant
    });
  } catch (err) {
    console.error('AuthMe Error:', err);
    sendError(res, 500, 'Failed to fetch session profile');
  }
});

export default router;
