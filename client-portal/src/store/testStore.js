// Simplified test store to verify Zustand is working
import { create } from 'zustand'

const useTestStore = create((set, get) => ({
  count: 0,
  
  increment: () => set((state) => ({ count: state.count + 1 })),
  
  testSave: async (data) => {
    console.log('🧪 Test save function called with:', data)
    return { success: true }
  },
  
  testFunction: () => {
    console.log('✅ Test function working!')
    return 'Function works!'
  }
}))

export { useTestStore }