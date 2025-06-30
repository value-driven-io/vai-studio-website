// src/components/journey/JourneyTab.jsx
import React from 'react'

const JourneyTab = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="pt-8 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            📅 My Journey
          </h1>
          <p className="text-slate-400">
            Your bookings and favorites
          </p>
        </div>

        {/* Bookings Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            🎫 Active Bookings
          </h2>
          <div className="text-center py-8">
            <p className="text-slate-400">No active bookings yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Book your first adventure!
            </p>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            ❤️ Favorites
          </h2>
          <div className="text-center py-8">
            <p className="text-slate-400">No favorites yet</p>
            <p className="text-slate-500 text-sm mt-2">
              Save tours you're interested in!
            </p>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            🌟 Experience History
          </h2>
          <div className="text-center py-8">
            <p className="text-slate-400">No completed experiences</p>
            <p className="text-slate-500 text-sm mt-2">
              Your adventure story starts here!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JourneyTab