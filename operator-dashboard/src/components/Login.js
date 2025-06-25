// src/components/Login.js
import React, { useState } from 'react'

const Login = ({ onLogin, loading }) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email')
      return
    }

    const result = await onLogin(email)
    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏝️ VAI Tickets</h1>
          <p className="text-slate-300">Operator Dashboard</p>
        </div>

        <div onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="your-email@example.com"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Don't have access? Contact{' '}
            <a href="mailto:hello@vai.studio" className="text-blue-400 hover:text-blue-300">
              hello@vai.studio
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login