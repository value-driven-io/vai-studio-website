// src/stores/bookingStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Navigation state
      activeTab: 'discover',
      
      // Tours state
      tours: [],
      loading: false,
      lastUpdate: null,
      selectedMood: null,
      
      // Filters state  
      filters: {
        island: 'all',
        tourType: 'all',
        timeframe: 'today',
        priceRange: 'all'
      },
      
      // Journey state
      bookings: [],
      favorites: [],
      
      // App state
      currentLanguage: 'en',
      
      // Navigation actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Tours actions
      setTours: (tours) => set({ 
        tours, 
        lastUpdate: new Date().toISOString() 
      }),
      setLoading: (loading) => set({ loading }),
      setMood: (mood) => set({ selectedMood: mood }),
      
      // Filter actions
      setFilters: (filters) => set({ filters }),
      updateFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
      })),
      
      // Journey actions
      setBookings: (bookings) => set({ bookings }),
      addBooking: (booking) => set((state) => ({
        bookings: [...state.bookings, booking]
      })),
      toggleFavorite: (tourId) => set((state) => ({
        favorites: state.favorites.includes(tourId)
          ? state.favorites.filter(id => id !== tourId)
          : [...state.favorites, tourId]
      })),
      
      // Language actions
      setLanguage: (language) => set({ currentLanguage: language }),
      
      // Utility actions
      clearFilters: () => set({
        filters: {
          island: 'all',
          tourType: 'all',
          timeframe: 'today',
          priceRange: 'all'
        }
      }),
      
      // Get filtered tours
      getFilteredTours: () => {
        const { tours, filters, selectedMood } = get()
        let filtered = [...tours]
        
        // Apply mood filter
        if (selectedMood) {
          const moodMapping = {
            adventure: ['Adrenalin', 'Hiking', 'Diving'],
            relax: ['Mindfulness', 'Lagoon Tour', 'Cultural'],
            culture: ['Cultural', 'Traditional'],
            ocean: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour']
          }
          const relevantTypes = moodMapping[selectedMood] || []
          filtered = filtered.filter(tour => 
            relevantTypes.includes(tour.tour_type)
          )
        }
        
        // Apply other filters
        if (filters.island !== 'all') {
          filtered = filtered.filter(tour => tour.operator_island === filters.island)
        }
        
        if (filters.tourType !== 'all') {
          filtered = filtered.filter(tour => tour.tour_type === filters.tourType)
        }
        
        if (filters.timeframe !== 'all') {
          const today = new Date()
          const tomorrow = new Date(today)
          tomorrow.setDate(today.getDate() + 1)
          
          filtered = filtered.filter(tour => {
            const tourDate = new Date(tour.tour_date)
            switch (filters.timeframe) {
              case 'today':
                return tourDate.toDateString() === today.toDateString()
              case 'tomorrow':
                return tourDate.toDateString() === tomorrow.toDateString()
              case 'week':
                const weekFromNow = new Date(today)
                weekFromNow.setDate(today.getDate() + 7)
                return tourDate >= today && tourDate <= weekFromNow
              default:
                return true
            }
          })
        }
        
        return filtered
      }
    }),
    {
      name: 'vai-tickets-store',
      partialize: (state) => ({
        favorites: state.favorites,
        currentLanguage: state.currentLanguage,
        activeTab: state.activeTab
      })
    }
  )
)