import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_INVALID_EVENT, AUTH_STORAGE_KEY } from '../services/api'
import { getCurrentUser, logoutUser } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const clearSession = useCallback(() => {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // Keep the in-memory session clear even when browser storage is unavailable.
    }
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const signIn = useCallback((authenticatedUser) => {
    if (!authenticatedUser?.username) return false
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, authenticatedUser.username)
    } catch {
      // The current page remains signed in even when persistence is unavailable.
    }
    setUser(authenticatedUser)
    setIsAuthenticated(true)
    return true
  }, [])

  useEffect(() => {
    let isCurrent = true

    const restoreSession = async () => {
      let username = ''
      try {
        username = window.localStorage.getItem(AUTH_STORAGE_KEY) || ''
      } catch {
        username = ''
      }

      if (!username) {
        if (isCurrent) setAuthLoading(false)
        return
      }

      try {
        const response = await getCurrentUser(username)
        if (isCurrent && response?.user) {
          setUser(response.user)
          setIsAuthenticated(true)
        } else if (isCurrent) {
          clearSession()
        }
      } catch {
        if (isCurrent) clearSession()
      } finally {
        if (isCurrent) setAuthLoading(false)
      }
    }

    const handleInvalidSession = () => clearSession()
    window.addEventListener(AUTH_INVALID_EVENT, handleInvalidSession)
    restoreSession()

    return () => {
      isCurrent = false
      window.removeEventListener(AUTH_INVALID_EVENT, handleInvalidSession)
    }
  }, [clearSession])

  const logout = useCallback(() => {
    logoutUser().catch(() => {})
    clearSession()
  }, [clearSession])

  const value = useMemo(
    () => ({ user, isAuthenticated, authLoading, signIn, logout }),
    [user, isAuthenticated, authLoading, signIn, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
