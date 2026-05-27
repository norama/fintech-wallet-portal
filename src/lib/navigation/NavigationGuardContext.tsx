'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type NavigationGuardContextValue = {
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
}

const NavigationGuardContext = createContext<NavigationGuardContextValue>({
  isDirty: false,
  setIsDirty: () => {},
})

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)
  return (
    <NavigationGuardContext.Provider value={{ isDirty, setIsDirty }}>
      {children}
    </NavigationGuardContext.Provider>
  )
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext)
}
