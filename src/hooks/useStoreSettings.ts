import { useState, useEffect } from 'react'
import { storeSettingsService, type StoreSettings } from '../services/rtdbService'

const defaultSettings: StoreSettings = {
  storeName: 'AXIS STORE',
  storeEmail: 'admin@axisstore.com',
  taxRate: 0,
  shippingCost: 15,
}

export const useStoreSettings = () => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await storeSettingsService.get()
        setSettings(data || defaultSettings)
      } catch (error) {
        // Error loading store settings - handled silently
        setSettings(defaultSettings)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()

    // Subscribe to settings changes
    const unsubscribe = storeSettingsService.subscribe((data) => {
      setSettings(data || defaultSettings)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Always return settings, fallback to defaults if undefined
  return { settings: settings || defaultSettings, loading }
}

