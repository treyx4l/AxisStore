// Admin email configuration
// Add admin emails here - these users will have admin access
export const ADMIN_EMAILS = [
  'tredway4k@gmail.com',
  // Add more admin emails here
]

/**
 * Check if an email is an admin email
 */
export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false
  return ADMIN_EMAILS.some(adminEmail => 
    email.toLowerCase() === adminEmail.toLowerCase()
  )
}

