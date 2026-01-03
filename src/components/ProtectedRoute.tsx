import { Navigate } from 'react-router-dom'
import { useFirebaseAuth } from '../context/FirebaseAuthContext'
import { isAdminEmail } from '../utils/adminConfig'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useFirebaseAuth()

  // Show loading state
  if (loading) {
    return null // Or a loading spinner
  }

  // Check if user is authenticated and is admin
  if (!user || !isAdminEmail(user.email)) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

