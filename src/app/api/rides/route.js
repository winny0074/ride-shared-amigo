import sql from '@/app/api/utils/sql';

// GET /api/rides - Search and list rides
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    const seats = searchParams.get('seats');
    const driver_id = searchParams.get('driver_id');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, 
             u.first_name as driver_first_name, 
             u.last_name as driver_last_name,
             u.phone as driver_phone,
             u.average_rating as driver_rating,
             u.vehicle_make, u.vehicle_model, u.vehicle_year, u.vehicle_color, u.vehicle_plate
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.status = $1
    `;
    const values = [status];
    let paramCount = 1;

    if (driver_id) {
      paramCount++;
      query += ` AND r.driver_id = $${paramCount}`;
      values.push(driver_id);
    }

    if (origin) {
      paramCount++;
      query += ` AND LOWER(r.origin_address) LIKE LOWER($${paramCount})`;
      values.push(`%${origin}%`);
    }

    if (destination) {
      paramCount++;
      query += ` AND LOWER(r.destination_address) LIKE LOWER($${paramCount})`;
      values.push(`%${destination}%`);
    }

    if (date) {
      paramCount++;
      query += ` AND r.departure_date = $${paramCount}`;
      values.push(date);
    }

    if (seats) {
      paramCount++;
      query += ` AND r.available_seats >= $${paramCount}`;
      values.push(parseInt(seats));
    }

    query += ` ORDER BY r.departure_date, r.departure_time LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const rides = await sql(query, values);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM rides r
      WHERE r.status = $1
    `;
    const countValues = [status];
    let countParamCount = 1;

    if (driver_id) {
      countParamCount++;
      countQuery += ` AND r.driver_id = $${countParamCount}`;
      countValues.push(driver_id);
    }

    if (origin) {
      countParamCount++;
      countQuery += ` AND LOWER(r.origin_address) LIKE LOWER($${countParamCount})`;
      countValues.push(`%${origin}%`);
    }

    if (destination) {
      countParamCount++;
      countQuery += ` AND LOWER(r.destination_address) LIKE LOWER($${countParamCount})`;
      countValues.push(`%${destination}%`);
    }

    if (date) {
      countParamCount++;
      countQuery += ` AND r.departure_date = $${countParamCount}`;
      countValues.push(date);
    }

    if (seats) {
      countParamCount++;
      countQuery += ` AND r.available_seats >= $${countParamCount}`;
      countValues.push(parseInt(seats));
    }

    const countResult = await sql(countQuery, countValues);
    const total = parseInt(countResult[0].total);

    return Response.json({
      rides,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching rides:', error);
    return Response.json({ error: 'Failed to fetch rides' }, { status: 500 });
  }
}

// POST /api/rides - Create new ride
export async function POST(request) {
  try {
    const data = await request.json();
    const {
      driver_id,
      origin_address,
      destination_address,
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
      departure_date,
      departure_time,
      available_seats,
      total_seats,
      price_per_seat,
      description,
      smoking_allowed,
      pets_allowed,
      luggage_allowed
    } = data;

    const result = await sql`
      INSERT INTO rides (
        driver_id, origin_address, destination_address, origin_latitude, origin_longitude,
        destination_latitude, destination_longitude, departure_date, departure_time,
        available_seats, total_seats, price_per_seat, description, smoking_allowed,
        pets_allowed, luggage_allowed
      )
      VALUES (
        ${driver_id}, ${origin_address}, ${destination_address}, ${origin_latitude}, ${origin_longitude},
        ${destination_latitude}, ${destination_longitude}, ${departure_date}, ${departure_time},
        ${available_seats}, ${total_seats}, ${price_per_seat}, ${description}, ${smoking_allowed || false},
        ${pets_allowed || false}, ${luggage_allowed || true}
      )
      RETURNING *
    `;

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating ride:', error);
    return Response.json({ error: 'Failed to create ride' }, { status: 500 });
  }
}