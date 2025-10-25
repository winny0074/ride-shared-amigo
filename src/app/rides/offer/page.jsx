"use client";

import { useState } from "react";
import { MapPin, Calendar, Clock, Users, DollarSign, Car, Plus, AlertCircle } from "lucide-react";

export default function OfferRidePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    originAddress: '',
    destinationAddress: '',
    departureDate: '',
    departureTime: '',
    totalSeats: 4,
    pricePerSeat: '',
    description: '',
    smokingAllowed: false,
    petsAllowed: false,
    luggageAllowed: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.originAddress || !formData.destinationAddress || !formData.departureDate || 
        !formData.departureTime || !formData.pricePerSeat) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // For now, just show success message - need authentication to create rides
      alert('Sign in as a driver to create rides! This feature requires authentication.');
      setSuccess(true);
    } catch (err) {
      setError('Failed to create ride. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <a href="/rides/search" className="text-slate-600 hover:text-violet-600 font-medium">Find Rides</a>
              <a href="/rides/offer" className="text-violet-600 font-medium">Offer Ride</a>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Offer a Ride</h1>
          <p className="text-slate-600">Share your journey and earn money by offering rides to fellow travelers</p>
        </div>

        {/* Notice */}
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-violet-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-violet-800 mb-1">Driver Account Required</h3>
              <p className="text-sm text-violet-700">
                To offer rides, you need to sign up as a driver and complete your vehicle information. 
                This helps ensure safety for all passengers.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Route Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-violet-600" />
                Route Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    From (Origin) *
                  </label>
                  <input
                    type="text"
                    name="originAddress"
                    value={formData.originAddress}
                    onChange={handleInputChange}
                    placeholder="e.g., New York, NY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    To (Destination) *
                  </label>
                  <input
                    type="text"
                    name="destinationAddress"
                    value={formData.destinationAddress}
                    onChange={handleInputChange}
                    placeholder="e.g., Philadelphia, PA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-violet-600" />
                Date & Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Departure Date *
                  </label>
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Departure Time *
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Capacity and Pricing */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-violet-600" />
                Capacity & Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Available Seats
                  </label>
                  <select
                    name="totalSeats"
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="1">1 seat</option>
                    <option value="2">2 seats</option>
                    <option value="3">3 seats</option>
                    <option value="4">4 seats</option>
                    <option value="5">5+ seats</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price per Seat ($) *
                  </label>
                  <input
                    type="number"
                    name="pricePerSeat"
                    value={formData.pricePerSeat}
                    onChange={handleInputChange}
                    placeholder="25.00"
                    step="0.01"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Ride Preferences */}
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2 text-violet-600" />
                Ride Preferences
              </h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="smokingAllowed"
                    checked={formData.smokingAllowed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Smoking allowed</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="petsAllowed"
                    checked={formData.petsAllowed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Pets allowed</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="luggageAllowed"
                    checked={formData.luggageAllowed}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Luggage allowed</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add any additional details about your ride (pickup locations, route preferences, etc.)"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-700">
                  Your ride has been posted successfully! Passengers will be able to find and book your ride.
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 bg-gray-100 text-slate-700 py-3 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Ride..." : "Offer This Ride"}
              </button>
            </div>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for a Great Ride</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Be specific about pickup and drop-off locations</li>
            <li>• Set fair prices based on distance and fuel costs</li>
            <li>• Communicate clearly with passengers</li>
            <li>• Keep your vehicle clean and comfortable</li>
          </ul>
        </div>
      </div>
    </div>
  );
}