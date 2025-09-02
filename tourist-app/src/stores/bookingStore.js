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
        timeframe: 'all', // Default to all for explore tab
        duration: 'all',
        search: '',
        sortBy: 'date',
        // Advanced filters
        dateRange: null, // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
        priceRange: null, // { min: number, max: number }
      },
      
      // Journey state
      bookings: [],
      favorites: [],
      userProfile: {
        email: '',
        whatsapp: '',
        name: ''
      },

      // Journey stage management
      journeyStage: null, // Default stage  
      
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
      setSearch: (search) => set((state) => ({
        filters: { ...state.filters, search }
      })),
      setSortBy: (sortBy) => set((state) => ({
        filters: { ...state.filters, sortBy }
      })),
      setDateRange: (dateRange) => set((state) => ({
        filters: { ...state.filters, dateRange }
      })),
      setPriceRange: (priceRange) => set((state) => ({
        filters: { ...state.filters, priceRange }
      })),
      
      // Journey actions
      setBookings: (bookings) => set({ bookings }),
      addBooking: (booking) => set((state) => ({
        bookings: [...state.bookings, booking]
      })),
      updateUserProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile }
      })),
      toggleFavorite: (tourId) => set((state) => ({
        favorites: state.favorites.includes(tourId)
          ? state.favorites.filter(id => id !== tourId)
          : [...state.favorites, tourId]
      })),

      // 🆕 ADD THIS: Journey stage actions  
       setJourneyStage: (stage) => set({ journeyStage: stage }),
       resetJourneyStage: () => set({ journeyStage: 'dashboard' }),
      
      // Language actions
      setLanguage: (language) => set({ currentLanguage: language }),
      
      // Utility actions
      clearFilters: () => set({
        filters: {
          island: 'all',
          tourType: 'all',
          timeframe: 'all',
          duration: 'all',
          search: '',
          sortBy: 'date',
          dateRange: null,
          priceRange: null,
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
        activeTab: state.activeTab,
        userProfile: state.userProfile
      })
    }
  )
)