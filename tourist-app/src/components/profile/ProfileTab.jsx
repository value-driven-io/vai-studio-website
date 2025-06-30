// src/components/profile/ProfileTab.jsx
import React from 'react'

const ProfileTab = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="pt-8 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            👤 Profile & Support
          </h1>
          <p className="text-slate-400">
            Settings and help
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            🛡️ Personal Info
          </h2>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Your name"
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2"
            />
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2"
            />
            <input 
              type="tel" 
              placeholder="WhatsApp number"
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            💬 Support
          </h2>
          <div className="space-y-3">
            <a 
              href="https://wa.me/68987269065" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-3 transition-colors"
            >
              📱 WhatsApp Support
            </a>
            <a 
              href="mailto:contact@vai.studio"
              className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 transition-colors"
            >
              ✉️ Email Support
            </a>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            ❓ How VAI Works
          </h2>
          <div className="text-slate-300 text-sm space-y-2">
            <p>1. Browse last-minute tour deals</p>
            <p>2. Book instantly with WhatsApp</p>
            <p>3. Pay directly with the operator</p>
            <p>4. Enjoy authentic Polynesian experiences!</p>
          </div>
        </div>

        {/* Island Passport */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            🏆 Island Passport
          </h2>
          <div className="text-center py-6">
            <p className="text-slate-400">Coming Soon!</p>
            <p className="text-slate-500 text-sm mt-2">
              Track your Polynesian adventure journey
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileTab