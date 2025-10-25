"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Users, Star, Clock, Car, ChevronRight, User, Filter } from "lucide-react";

export default function FindRidesPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchForm, setSearchForm] = useState({
    origin: '',
    destination: '',
    date: '',
    seats: 1
  });

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async (searchParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams.origin) params.append('origin', searchParams.origin);
      if (searchParams.destination) params.append('destination', searchParams.destination);
      if (searchParams.date) params.append('date', searchParams.date);
      if (searchParams.seats) params.append('seats', searchParams.seats);
      
      const response = await fetch(`/api/rides?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }
      const data = await response.json();
      setRides(data.rides || []);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchRides(searchForm);
  };

  const handleBookRide = (rideId) => {
    // For now, just alert - later we'll implement booking
    alert(`Booking ride ${rideId}. Sign in to complete your booking!`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="text-xl font-semibold text-slate-800">AmigoExpress</a>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/rides/search" className="text-violet-600 font-medium">Find Rides</a>
              <a href="/rides/offer" className="text-slate-600 hover:text-violet-600 font-medium">Offer Ride</a>
              <a href="/#how-it-works" className="text-slate-600 hover:text-violet-600 font-medium">How it Works</a>
            </nav>
            <div className="flex items-center space-x-4">
              <a href="/account/signin" className="text-slate-600 hover:text-violet-600 font-medium">Sign In</a>
              <a href="/account/signup" className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 font-medium">
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Find Your Perfect Ride</h1>
          <p className="text-slate-600">Search through available rides and book your journey</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                From
              </label>
              <input
                type="text"
                placeholder="Origin city"
                value={searchForm.origin}
                onChange={(e) => setSearchForm({...searchForm, origin: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                To
              </label>
              <input
                type="text"
                placeholder="Destination city"
                value={searchForm.destination}
                onChange={(e) => setSearchForm({...searchForm, destination: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Date
              </label>
              <input
                type="date"
                value={searchForm.date}
                onChange={(e) => setSearchForm({...searchForm, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Passengers
              </label>
              <select
                value={searchForm.seats}
                onChange={(e) => setSearchForm({...searchForm, seats: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="1">1 passenger</option>
                <option value="2">2 passengers</option>
                <option value="3">3 passengers</option>
                <option value="4">4+ passengers</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">&nbsp;</label>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 font-medium flex items-center justify-center disabled:opacity-50"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {rides.length > 0 ? `${rides.length} rides found` : 'Available Rides'}
          </h2>
          <button className="flex items-center text-slate-600 hover:text-violet-600 text-sm font-medium">
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : rides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center text-slate-800 font-semibold mb-2">
                      <MapPin className="w-4 h-4 mr-1 text-violet-600" />
                      {ride.origin_address}
                    </div>
                    <div className="flex items-center text-slate-600 mb-2">
                      <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                      {ride.destination_address}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-violet-600">${ride.price_per_seat}</div>
                    <div className="text-sm text-slate-500">per seat</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(ride.departure_date)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(ride.departure_time)}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {ride.available_seats} seats
                  </div>
                </div>

                {ride.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{ride.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {ride.driver_first_name} {ride.driver_last_name}
                      </div>
                      <div className="flex items-center text-sm text-slate-500">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {ride.driver_rating || 'New'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Car className="w-4 h-4 mr-1" />
                    {ride.vehicle_make} {ride.vehicle_model}
                  </div>
                </div>

                <button 
                  onClick={() => handleBookRide(ride.id)}
                  className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 font-medium transition-colors"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No rides found</h3>
            <p className="text-slate-600">Try adjusting your search criteria or check back later for new rides.</p>
          </div>
        )}
      </div>
    </div>
  );
}