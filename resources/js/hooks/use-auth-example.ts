/**
 * Exemplo de Hook de Autenticação usando Sanctum SPA Authentication
 *
 * Este é um exemplo de como implementar autenticação no frontend.
 * Adapte conforme necessário para seu caso de uso.
 */

import { useState } from 'react'
import { httpPost, httpGet, toApiError, isApiError } from '@/lib/http'
import type { ApiError } from '@/lib/http'

interface User {
    id: number
    name: string
    email: string
    roles: string[]
    // ... outros campos
}

interface LoginCredentials {
    email: string
    password: string
    remember?: boolean
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)

    /**
     * Login - Cria sessão via cookie
     */
    const login = async (credentials: LoginCredentials) => {
        setLoading(true)
        setError(null)

        try {
            // CSRF é buscado automaticamente pelo interceptor
            const response = await httpPost<{ user: User }>('/api/v1/auth', credentials)

            setUser(response.user)
            return response.user
        } catch (err) {
            const apiError = toApiError(err)
            setError(apiError)
            throw apiError
        } finally {
            setLoading(false)
        }
    }

    /**
     * Logout - Invalida sessão
     */
    const logout = async () => {
        setLoading(true)

        try {
            await httpPost('/api/v1/logout')
            setUser(null)
        } catch (err) {
            const apiError = toApiError(err)
            setError(apiError)
            throw apiError
        } finally {
            setLoading(false)
        }
    }

    /**
     * Fetch User - Busca usuário autenticado
     */
    const fetchUser = async () => {
        setLoading(true)

        try {
            const response = await httpGet<{ user: User }>('/api/v1/me')
            setUser(response.user)
            return response.user
        } catch (err) {
            const apiError = toApiError(err)

            // Se 401, usuário não está autenticado
            if (apiError.status === 401) {
                setUser(null)
            }

            setError(apiError)
            return null
        } finally {
            setLoading(false)
        }
    }

    /**
     * Check Role - Verifica se usuário tem role específica
     */
    const hasRole = (role: string): boolean => {
        return user?.roles?.includes(role) ?? false
    }

    /**
     * Is Authenticated
     */
    const isAuthenticated = !!user

    return {
        user,
        loading,
        error,
        login,
        logout,
        fetchUser,
        hasRole,
        isAuthenticated,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exemplo de uso em componente
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exemplo 1: Login Form
 */
/*
function LoginForm() {
    const { login, loading, error } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await login({ email, password })
            // Redirecionar para dashboard
            window.location.href = '/dashboard'
        } catch (err) {
            // Erro já está no state
            console.error(err)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />

            {error && error.type === 'validation' && (
                <div>
                    {Object.entries(error.errors).map(([field, message]) => (
                        <p key={field}>{message}</p>
                    ))}
                </div>
            )}

            {error && error.type === 'auth' && (
                <p>{error.message}</p>
            )}

            <button type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
        </form>
    )
}
*/

/**
 * Exemplo 2: Protected Route
 */
/*
function AdminDashboard() {
    const { user, hasRole, fetchUser } = useAuth()

    useEffect(() => {
        // Busca usuário ao montar componente
        fetchUser()
    }, [])

    if (!user) {
        return <div>Carregando...</div>
    }

    if (!hasRole('admin')) {
        return <div>Acesso negado. Você não tem permissão para acessar esta página.</div>
    }

    return (
        <div>
            <h1>Dashboard Admin</h1>
            <p>Bem-vindo, {user.name}!</p>
        </div>
    )
}
*/

/**
 * Exemplo 3: Fazer requisição autenticada
 */
/*
function UsersList() {
    const [users, setUsers] = useState([])
    const [error, setError] = useState<ApiError | null>(null)

    const loadUsers = async () => {
        try {
            // Cookie é enviado automaticamente, não precisa de headers especiais
            const response = await httpGet<{ data: User[] }>('/api/v1/admin/users')
            setUsers(response.data)
        } catch (err) {
            const apiError = toApiError(err)
            setError(apiError)

            // Trata erros específicos
            if (apiError.status === 401) {
                // Usuário não está autenticado
                window.location.href = '/login'
            } else if (apiError.status === 403) {
                // Usuário não tem permissão
                alert('Você não tem permissão para acessar esta página')
            }
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    if (error) {
        return <div>Erro: {error.message}</div>
    }

    return (
        <div>
            {users.map(user => (
                <div key={user.id}>{user.name}</div>
            ))}
        </div>
    )
}
*/
