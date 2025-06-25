// src/stores/bookingStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookingStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,
      
      // Booking state
      currentBookings: [],
      bookingHistory: [],
      favorites: [],
      
      // UI state
      notifications: [],
      isOffline: false,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      addBooking: (booking) => set((state) => ({
        currentBookings: [...state.currentBookings, booking]
      })),
      
      updateBooking: (bookingId, updates) => set((state) => ({
        currentBookings: state.currentBookings.map(booking =>
          booking.id === bookingId ? { ...booking, ...updates } : booking
        )
      })),
      
      addToFavorites: (tourId) => set((state) => ({
        favorites: [...state.favorites, tourId]
      })),
      
      removeFromFavorites: (tourId) => set((state) => ({
        favorites: state.favorites.filter(id => id !== tourId)
      })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
          ...notification,
          id: Date.now(),
          timestamp: new Date()
        }]
      })),
      
      removeNotification: (notificationId) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== notificationId)
      })),
      
      setOfflineStatus: (isOffline) => set({ isOffline }),
      
      // Clear all data (logout)
      clearData: () => set({
        user: null,
        isAuthenticated: false,
        currentBookings: [],
        bookingHistory: [],
        favorites: [],
        notifications: []
      })
    }),
    {
      name: 'vai-tickets-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        favorites: state.favorites,
        notifications: state.notifications
      })
    }
  )
)