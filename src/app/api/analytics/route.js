import sql from '@/app/api/utils/sql';

// GET /api/analytics - Get platform analytics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Current day analytics
    const today = new Date().toISOString().split('T')[0];
    
    // Total users by role
    const userStats = await sql`
      SELECT 
        role,
        COUNT(*) as count,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count
      FROM users 
      GROUP BY role
    `;

    // Total rides and bookings
    const rideStats = await sql`
      SELECT 
        COUNT(*) as total_rides,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_rides,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_rides,
        SUM(total_seats - available_seats) as total_booked_seats
      FROM rides
    `;

    const bookingStats = await sql`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN booking_status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed_bookings,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_booking_value
      FROM bookings
    `;

    // Recent activity (last 30 days)
    const recentActivity = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const recentRides = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_rides
      FROM rides 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const recentBookings = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_bookings,
        SUM(total_amount) as daily_revenue
      FROM bookings 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    // Top performing drivers
    const topDrivers = await sql`
      SELECT 
        u.id, u.first_name, u.last_name, u.email,
        COUNT(r.id) as total_rides,
        SUM(r.total_seats - r.available_seats) as seats_filled,
        u.total_earnings,
        u.average_rating
      FROM users u
      JOIN rides r ON u.id = r.driver_id
      WHERE u.role = 'driver'
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.total_earnings, u.average_rating
      ORDER BY u.total_earnings DESC
      LIMIT 10
    `;

    // Popular routes
    const popularRoutes = await sql`
      SELECT 
        origin_address,
        destination_address,
        COUNT(*) as ride_count,
        AVG(price_per_seat) as avg_price
      FROM rides
      GROUP BY origin_address, destination_address
      ORDER BY ride_count DESC
      LIMIT 10
    `;

    // Update daily analytics
    await sql`
      INSERT INTO analytics (metric_name, metric_value, metric_date)
      VALUES 
        ('total_users', ${userStats.reduce((sum, stat) => sum + parseInt(stat.count), 0)}, ${today}),
        ('total_rides', ${rideStats[0].total_rides}, ${today}),
        ('total_bookings', ${bookingStats[0].total_bookings}, ${today}),
        ('total_revenue', ${bookingStats[0].total_revenue || 0}, ${today}),
        ('active_drivers', ${userStats.find(s => s.role === 'driver')?.count || 0}, ${today}),
        ('active_clients', ${userStats.find(s => s.role === 'client')?.count || 0}, ${today})
      ON CONFLICT (metric_name, metric_date) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        created_at = CURRENT_TIMESTAMP
    `;

    return Response.json({
      summary: {
        users: userStats,
        rides: rideStats[0],
        bookings: bookingStats[0]
      },
      trends: {
        users: recentActivity,
        rides: recentRides,
        bookings: recentBookings
      },
      insights: {
        topDrivers,
        popularRoutes
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}