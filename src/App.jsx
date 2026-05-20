import { useState } from 'react'
import AppSearchScreen from './components/AppSearchScreen'
import ReceiptModal from './components/ReceiptModal'
import FullAuditPage from './components/FullAuditPage'

export default function App() {
  const [selectedApp, setSelectedApp] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [showAudit, setShowAudit] = useState(false)
  const [skippedApps, setSkippedApps] = useState([])
  const [installedApps, setInstalledApps] = useState([])
  const [downloadingApp, setDownloadingApp] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  function handleAppClick(app) {
    setSelectedApp(app)
    setShowReceipt(true)
  }

  function handleDownload() {
    const appId = selectedApp.id
    setShowReceipt(false)
    setDownloadingApp(appId)
    setTimeout(() => {
      setDownloadingApp(null)
      setInstalledApps((prev) => [...prev, appId])
    }, 2000)
  }

  function handleSkip() {
    setSkippedApps((prev) => [...prev, selectedApp.id])
    setShowReceipt(false)
    setSelectedApp(null)
  }

  function handleCloseReceipt() {
    setShowReceipt(false)
    setSelectedApp(null)
  }

  function handleOpenAudit() {
    setShowReceipt(false)
    setShowAudit(true)
  }

  function handleCloseAudit() {
    setShowAudit(false)
    setSelectedApp(null)
  }

  // Full audit page replaces the whole screen
  if (showAudit && selectedApp) {
    return <FullAuditPage app={selectedApp} onBack={handleCloseAudit} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppSearchScreen
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAppClick={handleAppClick}
        skippedApps={skippedApps}
        installedApps={installedApps}
        downloadingApp={downloadingApp}
      />

      {/* Receipt modal — unmounts/remounts each open so timer resets automatically */}
      {showReceipt && selectedApp && (
        <ReceiptModal
          key={selectedApp.id + '-' + Date.now()}
          app={selectedApp}
          onClose={handleCloseReceipt}
          onDownload={handleDownload}
          onSkip={handleSkip}
          onOpenAudit={handleOpenAudit}
        />
      )}
    </div>
  )
}
