import sql from '@/app/api/utils/sql';
import { hash } from 'argon2';

// GET /api/users - List users (admin only)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, first_name, last_name, phone, role, is_verified, is_banned, total_earnings, total_rides_completed, average_rating, created_at FROM users WHERE 1=1';
    const values = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      values.push(role);
    }

    if (search) {
      paramCount++;
      query += ` AND (LOWER(first_name) LIKE LOWER($${paramCount}) OR LOWER(last_name) LIKE LOWER($${paramCount}) OR LOWER(email) LIKE LOWER($${paramCount}))`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const users = await sql(query, values);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countValues = [];
    let countParamCount = 0;

    if (role) {
      countParamCount++;
      countQuery += ` AND role = $${countParamCount}`;
      countValues.push(role);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (LOWER(first_name) LIKE LOWER($${countParamCount}) OR LOWER(last_name) LIKE LOWER($${countParamCount}) OR LOWER(email) LIKE LOWER($${countParamCount}))`;
      countValues.push(`%${search}%`);
    }

    const countResult = await sql(countQuery, countValues);
    const total = parseInt(countResult[0].total);

    return Response.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create user
export async function POST(request) {
  try {
    const data = await request.json();
    const { email, password, first_name, last_name, phone, role, driver_license_number, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate } = data;

    // Hash password
    const password_hash = await hash(password);

    const result = await sql`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role, driver_license_number, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate)
      VALUES (${email}, ${password_hash}, ${first_name}, ${last_name}, ${phone}, ${role}, ${driver_license_number || null}, ${vehicle_make || null}, ${vehicle_model || null}, ${vehicle_year || null}, ${vehicle_color || null}, ${vehicle_plate || null})
      RETURNING id, email, first_name, last_name, phone, role, is_verified, created_at
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') { // Unique constraint violation
      return Response.json({ error: 'Email already exists' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}