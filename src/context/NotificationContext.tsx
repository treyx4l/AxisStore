import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { Snackbar, Alert } from '@mui/material'

interface NotificationContextType {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
})

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setNotification({ open: true, message, severity })
  }

  const handleClose = () => {
    setNotification({ ...notification, open: false })
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

