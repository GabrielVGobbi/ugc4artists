import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface HeaderContextType {
    headerActions: ReactNode | null
    setHeaderActions: (actions: ReactNode | null) => void
}

const HeaderContext = createContext<HeaderContextType | null>(null)

let pendingActions: ReactNode | null = null
let pendingCallback: ((actions: ReactNode | null) => void) | null = null

export function HeaderProvider({ children }: { children: ReactNode }) {
    const [headerActions, setHeaderActionsState] = useState<ReactNode | null>(() => pendingActions)

    const setHeaderActions = useCallback((actions: ReactNode | null) => {
        setHeaderActionsState(actions)
    }, [])

    pendingCallback = setHeaderActions

    return (
        <HeaderContext.Provider value={{ headerActions, setHeaderActions }}>
            {children}
        </HeaderContext.Provider>
    )
}

export function useHeader() {
    const context = useContext(HeaderContext)

    if (!context) {
        return {
            headerActions: pendingActions,
            setHeaderActions: (actions: ReactNode | null) => {
                pendingActions = actions
                if (pendingCallback) {
                    pendingCallback(actions)
                }
            }
        }
    }

    return context
}
