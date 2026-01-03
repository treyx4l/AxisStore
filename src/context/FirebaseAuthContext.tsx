import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, googleProvider, appleProvider, facebookProvider, db } from '../FirebaseConfig'

// Check if Firebase is properly initialized (logging removed for security)

interface UserProfile {
  displayName?: string
  email?: string
  photoURL?: string
  phoneNumber?: string
  address?: string
  checkoutInfo?: {
    fullName?: string
    phone?: string
    address?: string
    region?: string
    gpsCode?: string
  }
}

interface FirebaseAuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>
  updateUserEmail: (email: string) => Promise<void>
  updateUserPassword: (password: string) => Promise<void>
  userProfile: UserProfile | null
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
  signInWithFacebook: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  updateUserEmail: async () => {},
  updateUserPassword: async () => {},
  userProfile: null,
})

export const useFirebaseAuth = () => useContext(FirebaseAuthContext)

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser && db) {
        try {
          // Load user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile)
          } else {
            // Create user profile if it doesn't exist
            const profile: UserProfile = {
              displayName: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
            }
            await setDoc(doc(db, 'users', firebaseUser.uid), profile)
            setUserProfile(profile)
          }
        } catch (error: any) {
          // Handle offline errors gracefully - don't log as error if it's just offline
          if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
            // Client is offline - use cached data or default profile
            const defaultProfile: UserProfile = {
              displayName: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
            }
            setUserProfile(defaultProfile)
          } else {
            // Error loading user profile - will be handled by components
          }
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase authentication is not configured.')
    }
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth || !db) {
      throw new Error('Firebase is not configured.')
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName })
      const profile: UserProfile = {
        displayName,
        email,
      }
      await setDoc(doc(db, 'users', userCredential.user.uid), profile)
    } catch (error: any) {
      throw error
    }
  }

  const signInWithGoogle = async () => {
    if (!auth || !db || !googleProvider) {
      throw new Error('Firebase is not configured.')
    }
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const profile: UserProfile = {
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
      }
      await setDoc(doc(db, 'users', result.user.uid), profile, { merge: true })
    } catch (error: any) {
      throw error
    }
  }

  const signInWithApple = async () => {
    if (!auth || !db || !appleProvider) {
      throw new Error('Firebase is not configured.')
    }
    try {
      const result = await signInWithPopup(auth, appleProvider)
      const profile: UserProfile = {
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
      }
      await setDoc(doc(db, 'users', result.user.uid), profile, { merge: true })
    } catch (error: any) {
      throw error
    }
  }

  const signInWithFacebook = async () => {
    if (!auth || !db || !facebookProvider) {
      throw new Error('Firebase is not configured.')
    }
    try {
      const result = await signInWithPopup(auth, facebookProvider)
      const profile: UserProfile = {
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
      }
      await setDoc(doc(db, 'users', result.user.uid), profile, { merge: true })
    } catch (error: any) {
      throw error
    }
  }

  const logout = async () => {
    if (!auth) {
      throw new Error('Firebase is not configured.')
    }
    try {
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      throw error
    }
  }

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    if (!db) {
      throw new Error('Firebase is not configured.')
    }
    
    try {
      const updates: any = {}
      if (profile.displayName) {
        await updateProfile(user, { displayName: profile.displayName })
        updates.displayName = profile.displayName
      }
      if (profile.photoURL) {
        await updateProfile(user, { photoURL: profile.photoURL })
        updates.photoURL = profile.photoURL
      }
      if (profile.phoneNumber) updates.phoneNumber = profile.phoneNumber
      if (profile.address) updates.address = profile.address

      await setDoc(doc(db, 'users', user.uid), updates, { merge: true })
      setUserProfile((prev) => ({ ...prev, ...updates }))
    } catch (error) {
      throw error
    }
  }

  const updateUserEmail = async (email: string) => {
    if (!user) throw new Error('No user logged in')
    if (!db) {
      throw new Error('Firebase is not configured.')
    }
    try {
      await updateEmail(user, email)
      await setDoc(doc(db, 'users', user.uid), { email }, { merge: true })
      setUserProfile((prev) => (prev ? { ...prev, email } : null))
    } catch (error) {
      throw error
    }
  }

  const updateUserPassword = async (password: string) => {
    if (!user) throw new Error('No user logged in')
    try {
      await updatePassword(user, password)
    } catch (error) {
      throw error
    }
  }

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithApple,
        signInWithFacebook,
        logout,
        updateUserProfile,
        updateUserEmail,
        updateUserPassword,
        userProfile,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  )
}

