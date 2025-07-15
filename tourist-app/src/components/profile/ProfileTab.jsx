// src/components/profile/ProfileTab.jsx
import React from 'react'
import VAILogo from '../shared/VAILogo'

const ProfileTab = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      
      {/*
      <div className="flex items-center justify-center py-4 border-b border-slate-700">
        {/* Wrapping the VAILogo with an anchor tag */}
        {/* 
        <a href="https://vai.studio/app/" target="_blank" rel="noopener noreferrer">
          <VAILogo size="sm" />
        </a>
      </div> 
      */}
      
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="pt-8 mb-6">
          <p className="text-slate-500 text-sm p-2">
            Here you'll find everything else you need to know. In case you have some troubles contact us via WhatsApp.
          </p>
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
            ❓ How to: VAI Tickets
          </h2>
          <div className="text-slate-300 text-sm space-y-2">
            <p>1. Browse last-minute tour deals 🔎</p>
            <p>2. Send booking request instantly with the app 🔥</p>
            <p>3. Get booking confirmation 😎</p>
            <p>4. Connect with the Operator 🗣️</p>
            <p>5. Pay directly with the Operator 💸</p>
            <p>6. Enjoy your Activity 🏝️</p>
            <p>7. Repeat! 🤙</p>
          </div>
        </div>

              {/* Footer */}
          <div>
            <p className="text-center text-slate-500 text-sm mt-4">VAI.studio © 2025 All rights reserved<br></br>From French Polynesia with ❤️</p>
       </div> 
      </div>
    </div>
  )
}

export default ProfileTab