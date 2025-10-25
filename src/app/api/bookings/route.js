import sql from '@/app/api/utils/sql';

// GET /api/bookings - List bookings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const client_id = searchParams.get('client_id');
    const driver_id = searchParams.get('driver_id');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, 
             r.origin_address, r.destination_address, r.departure_date, r.departure_time, r.price_per_seat,
             driver.first_name as driver_first_name, driver.last_name as driver_last_name, 
             driver.phone as driver_phone, driver.vehicle_make, driver.vehicle_model, driver.vehicle_color,
             client.first_name as client_first_name, client.last_name as client_last_name,
             client.phone as client_phone, client.email as client_email
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      JOIN users driver ON r.driver_id = driver.id
      JOIN users client ON b.client_id = client.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (client_id) {
      paramCount++;
      query += ` AND b.client_id = $${paramCount}`;
      values.push(client_id);
    }

    if (driver_id) {
      paramCount++;
      query += ` AND r.driver_id = $${paramCount}`;
      values.push(driver_id);
    }

    if (status) {
      paramCount++;
      query += ` AND b.booking_status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const bookings = await sql(query, values);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN rides r ON b.ride_id = r.id
      WHERE 1=1
    `;
    const countValues = [];
    let countParamCount = 0;

    if (client_id) {
      countParamCount++;
      countQuery += ` AND b.client_id = $${countParamCount}`;
      countValues.push(client_id);
    }

    if (driver_id) {
      countParamCount++;
      countQuery += ` AND r.driver_id = $${countParamCount}`;
      countValues.push(driver_id);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND b.booking_status = $${countParamCount}`;
      countValues.push(status);
    }

    const countResult = await sql(countQuery, countValues);
    const total = parseInt(countResult[0].total);

    return Response.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings - Create new booking
export async function POST(request) {
  try {
    const data = await request.json();
    const { ride_id, client_id, seats_booked, pickup_location, special_requests } = data;

    // First, get the ride details to calculate total amount
    const rideResult = await sql`
      SELECT price_per_seat, available_seats 
      FROM rides 
      WHERE id = ${ride_id} AND status = 'active'
    `;

    if (rideResult.length === 0) {
      return Response.json({ error: 'Ride not found or not available' }, { status: 404 });
    }

    const ride = rideResult[0];
    
    if (ride.available_seats < seats_booked) {
      return Response.json({ error: 'Not enough seats available' }, { status: 400 });
    }

    const total_amount = parseFloat(ride.price_per_seat) * seats_booked;

    // Check if client already has a booking for this ride
    const existingBooking = await sql`
      SELECT id FROM bookings 
      WHERE ride_id = ${ride_id} AND client_id = ${client_id}
    `;

    if (existingBooking.length > 0) {
      return Response.json({ error: 'You already have a booking for this ride' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO bookings (
        ride_id, client_id, seats_booked, total_amount, pickup_location, special_requests
      )
      VALUES (
        ${ride_id}, ${client_id}, ${seats_booked}, ${total_amount}, ${pickup_location || null}, ${special_requests || null}
      )
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.code === '23505') { // Unique constraint violation
      return Response.json({ error: 'You already have a booking for this ride' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}