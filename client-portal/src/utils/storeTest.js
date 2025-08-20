// Store test utility
import { useClientStore } from '../store/clientStore'

export const testStore = () => {
  console.log('🧪 Testing VAI Client Store...')
  
  const store = useClientStore.getState()
  
  console.log('📊 Store State:')
  console.log('- isAuthenticated:', store.isAuthenticated)
  console.log('- clientData exists:', !!store.clientData)
  console.log('- proposalData exists:', !!store.proposalData)
  
  console.log('🔧 Available Functions:')
  const functions = Object.keys(store).filter(key => typeof store[key] === 'function')
  functions.forEach(func => {
    console.log(`- ${func}: ${typeof store[func]}`)
  })
  
  console.log('💾 Testing Save Functions:')
  console.log('- saveProfile exists:', typeof store.saveProfile === 'function')
  console.log('- savePackageConfig exists:', typeof store.savePackageConfig === 'function')
  console.log('- submitConfiguration exists:', typeof store.submitConfiguration === 'function')
  
  if (typeof store.saveProfile !== 'function') {
    console.error('❌ saveProfile function missing!')
    return false
  }
  
  if (typeof store.savePackageConfig !== 'function') {
    console.error('❌ savePackageConfig function missing!')
    return false
  }
  
  if (typeof store.submitConfiguration !== 'function') {
    console.error('❌ submitConfiguration function missing!')
    return false
  }
  
  console.log('✅ All store functions available')
  return true
}

// Call this in development
if (import.meta.env.DEV) {
  window.testStore = testStore
}