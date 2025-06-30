// src/components/explore/ExploreTab.jsx
import React from 'react'

const ExploreTab = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="pt-8 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            🔍 Explore Tours
          </h1>
          <p className="text-slate-400">
            Browse all available experiences
          </p>
        </div>

        {/* Filter Placeholder */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select className="bg-slate-700 text-white rounded-lg px-3 py-2">
              <option>🗓️ Today</option>
            </select>
            <select className="bg-slate-700 text-white rounded-lg px-3 py-2">
              <option>🏝️ All Islands</option>
            </select>
            <select className="bg-slate-700 text-white rounded-lg px-3 py-2">
              <option>🎨 All Types</option>
            </select>
            <select className="bg-slate-700 text-white rounded-lg px-3 py-2">
              <option>💰 All Prices</option>
            </select>
          </div>
        </div>

        {/* Tour Grid Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-4">
              <div className="bg-slate-700 h-32 rounded-lg mb-3"></div>
              <h3 className="text-white font-semibold">Tour {i}</h3>
              <p className="text-slate-400 text-sm">Loading...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExploreTab