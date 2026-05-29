import axios from 'axios';

export const API = axios.create({
    baseURL : `${import.meta.env.VITE_API_URL}/api/users`,
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access') // localStorage is the browser's built-in storage — it stores small pieces of data even after you close and reopen the tab. getItem('access') reads the access token we saved there after login. If the user is logged in, this will return their token. If not, it returns null.
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const signup = (data) => API.post('/signup/', data);

export const login = (data) => API.post('/login/', data);

export const googleLogin = (token) => API.post('/auth/google/', { token }); // it wraps the token in an object because Django expects JSON, not a plain string.

export const logout = (refresh) => API.post('/logout/', { refresh });

export const getMe = () => API.get('/me/'); // no data needed, it's a get request.

export const refreshToken = (refresh) => API.post('/token/refresh/', { refresh }); // When the access token expires, React calls this with the refresh token to silently get a new access token — without making the user log in again.
