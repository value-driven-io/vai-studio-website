import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'

// Layout components
import MobileHeader from './MobileHeader'
import TabNavigation from './TabNavigation'
import DesktopSidebar from './DesktopSidebar'

// Tab content components
import OverviewTab from '../tabs/OverviewTab'
import ScopeTab from '../tabs/ScopeTab'
import FinancesTab from '../tabs/FinancesTab'
import FAQTab from '../tabs/FAQTab'
import ActionsTab from '../tabs/ActionsTab'

const PortalLayout = () => {
  const { t } = useTranslation()
  const { activeTab, clientData, isMobile } = useClientStore()

  useEffect(() => {
    // Update page title with client name
    if (clientData) {
      document.title = t('meta.title', { clientName: clientData.company_name })
    }
  }, [clientData, t])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'scope':
        return <ScopeTab />
      case 'finances':
        return <FinancesTab />
      case 'faq':
        return <FAQTab />
      case 'actions':
        return <ActionsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className="min-h-screen bg-vai-gradient">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col min-h-screen">
          {/* Mobile Header */}
          <MobileHeader />
          
          {/* Main Content */}
          <main className="flex-1 px-4 py-6 pb-24">
            {renderTabContent()}
          </main>
          
          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-50 mobile-safe-area">
            <TabNavigation />
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <DesktopSidebar />
          </aside>
          
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <div className="h-full overflow-auto">
              <div className="max-w-7xl mx-auto px-6 py-8">
                {renderTabContent()}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  )
}

export default PortalLayout