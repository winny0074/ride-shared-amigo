import sql from '@/app/api/utils/sql';

// GET /api/bookings/[id] - Get booking by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const result = await sql`
      SELECT b.*, 
             r.origin_address, r.destination_address, r.departure_date, r.departure_time, 
             r.price_per_seat, r.description as ride_description,
             driver.first_name as driver_first_name, driver.last_name as driver_last_name, 
             driver.phone as driver_phone, driver.email as driver_email,
             driver.vehicle_make, driver.vehicle_model, driver.vehicle_year, driver.vehicle_color, driver.vehicle_plate,
             driver.profile_image_url as driver_profile_image, driver.average_rating as driver_rating,
             client.first_name as client_first_name, client.last_name as client_last_name,
             client.phone as client_phone, client.email as client_email,
             client.profile_image_url as client_profile_image
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      JOIN users driver ON r.driver_id = driver.id
      JOIN users client ON b.client_id = client.id
      WHERE b.id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return Response.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      'booking_status', 'payment_status', 'pickup_location', 'special_requests',
      'client_rating', 'driver_rating', 'client_review', 'driver_review'
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
      UPDATE bookings 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating booking:', error);
    return Response.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Update booking status to cancelled instead of deleting
    const result = await sql`
      UPDATE bookings 
      SET booking_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    return Response.json({ message: 'Booking cancelled successfully', booking: result[0] });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return Response.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}