import sql from '@/app/api/utils/sql';

// GET /api/users/[id] - Get user by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      SELECT id, email, first_name, last_name, phone, role, is_verified, is_banned, 
             profile_image_url, date_of_birth, address, driver_license_number, 
             vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate,
             total_earnings, total_rides_completed, average_rating, created_at, updated_at
      FROM users 
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      'first_name', 'last_name', 'phone', 'is_verified', 'is_banned',
      'profile_image_url', 'date_of_birth', 'address', 'driver_license_number',
      'vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_color', 
      'vehicle_plate', 'total_earnings', 'total_rides_completed', 'average_rating'
    ];

    for (const field of allowedFields) {
      if (data.hasOwnProperty(field)) {
        paramCount++;
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field]);
      }
    }

    if (fields.length === 0) {
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add updated_at
    paramCount++;
    fields.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    // Add id for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, role, is_verified, is_banned,
                profile_image_url, total_earnings, total_rides_completed, average_rating, updated_at
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      DELETE FROM users 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}