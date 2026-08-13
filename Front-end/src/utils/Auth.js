const TOKEN_KEY = 'access_token'
const USER_KEY = 'user'

export function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
}

export function getUser() {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export function saveSession(token, user, persist) {
    const storage = persist ? localStorage : sessionStorage
    storage.setItem(TOKEN_KEY, token)
    storage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
}

export function isAuthenticated() {
    return Boolean(getToken())
}

export function authHeader() {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}
