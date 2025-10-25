import sql from '@/app/api/utils/sql';

// GET /api/rides/[id] - Get ride by ID with driver details
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      SELECT r.*, 
             u.first_name as driver_first_name, 
             u.last_name as driver_last_name,
             u.phone as driver_phone,
             u.email as driver_email,
             u.average_rating as driver_rating,
             u.total_rides_completed as driver_total_rides,
             u.vehicle_make, u.vehicle_model, u.vehicle_year, u.vehicle_color, u.vehicle_plate,
             u.profile_image_url as driver_profile_image
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Ride not found' }, { status: 404 });
    }

    // Get bookings for this ride
    const bookings = await sql`
      SELECT b.*, 
             u.first_name as client_first_name, 
             u.last_name as client_last_name,
             u.phone as client_phone,
             u.email as client_email
      FROM bookings b
      JOIN users u ON b.client_id = u.id
      WHERE b.ride_id = ${id}
      ORDER BY b.created_at DESC
    `;

    const ride = { ...result[0], bookings };
    return Response.json(ride);
  } catch (error) {
    console.error('Error fetching ride:', error);
    return Response.json({ error: 'Failed to fetch ride' }, { status: 500 });
  }
}

// PUT /api/rides/[id] - Update ride
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      'origin_address', 'destination_address', 'origin_latitude', 'origin_longitude',
      'destination_latitude', 'destination_longitude', 'departure_date', 'departure_time',
      'available_seats', 'total_seats', 'price_per_seat', 'description',
      'smoking_allowed', 'pets_allowed', 'luggage_allowed', 'status'
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
      UPDATE rides 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'Ride not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating ride:', error);
    return Response.json({ error: 'Failed to update ride' }, { status: 500 });
  }
}

// DELETE /api/rides/[id] - Delete ride
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      DELETE FROM rides 
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Ride not found' }, { status: 404 });
    }

    return Response.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Error deleting ride:', error);
    return Response.json({ error: 'Failed to delete ride' }, { status: 500 });
  }
}