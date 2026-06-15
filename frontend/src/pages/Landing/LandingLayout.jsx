import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { getPublicLandingSettings } from '../../services/api'

export default function LandingLayout() {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    getPublicLandingSettings()
      .then(res => {
        if (res?.data) {
          setSettings(res.data)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
    </div>
  )
}
