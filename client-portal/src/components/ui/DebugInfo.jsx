import { useClientStore } from '../../store/clientStore'
import { useTestStore } from '../../store/testStore'

const DebugInfo = () => {
  if (import.meta.env.PROD) return null // Only show in development
  
  const store = useClientStore()
  const testStore = useTestStore()
  
  const testSaveProfile = () => {
    console.log('🧪 Testing saveProfile function...')
    console.log('saveProfile type:', typeof store.saveProfile)
    console.log('Available functions:', Object.keys(store).filter(key => typeof store[key] === 'function'))
    
    // Test with sample data
    if (typeof store.saveProfile === 'function') {
      console.log('✅ saveProfile exists, testing...')
      store.saveProfile({ company_name: 'Test Company' })
        .then(result => console.log('✅ Save test result:', result))
        .catch(error => console.error('❌ Save test failed:', error))
    } else {
      console.error('❌ saveProfile function not found!')
    }
  }
  
  const testBasicStore = () => {
    console.log('🧪 Testing basic store functionality...')
    console.log('Test store count:', testStore.count)
    testStore.increment()
    console.log('Test store after increment:', testStore.count)
    
    const result = testStore.testFunction()
    console.log('Test function result:', result)
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
      <div className="mb-2">
        <strong>Debug Info:</strong>
      </div>
      <div>Client: {store.clientData?.company_name || 'None'}</div>
      <div>Status: {store.clientData?.project_status || 'Unknown'}</div>
      <div>Functions: {Object.keys(store).filter(key => typeof store[key] === 'function').length}</div>
      <div>Test Count: {testStore.count}</div>
      
      <div className="mt-2 space-y-1">
        <button 
          onClick={testSaveProfile}
          className="block w-full bg-red-800 px-2 py-1 rounded text-xs hover:bg-red-700"
        >
          Test Save Functions
        </button>
        
        <button 
          onClick={testBasicStore}
          className="block w-full bg-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-700"
        >
          Test Basic Store
        </button>
      </div>
    </div>
  )
}

export default DebugInfo