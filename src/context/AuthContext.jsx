import {createContext, useContext, useState, useEffect} from 'react'
import {getMe, refreshToken} from '../api/auth.js'

const AuthContext = createContext() // This creates the global container. Think of it like a box that holds the logged-in user's data. Any component anywhere in the app can reach into this box and read the data.

export function AuthProvider({children}){ // AuthProvider is a wrapper component. We will wrap our entire app inside it. children means whatever is inside it — in our case, all of our pages. This is how the global data becomes available everywhere
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const initAuth = async() => {
            const access = localStorage.getItem('access');
            const refresh = localStorage.getItem('refresh');

            if(!access || !refresh){
                setLoading(false);
                return;
            }

            try{
                const res = await getMe();
                setUser(res.data.user);
            }catch{ // If /me/ failed — it means the access token expired. So we try to get a new one using the refresh token. If that works, we save the new access token and try /me/ again. If even the refresh token is expired — we clear everything from localStorage and set user to null. The user needs to log in again.
                try{
                    const res = await refreshToken(refresh);
                    localStorage.setItem('access', res.data.access);
                    const meRes = await getMe();
                    setUser(meRes.data.user)
                }catch{
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    setUser(null);
                }
            }
            finally{
                setLoading(false); //finally runs no matter what — success or failure. Once we know the auth status, we set loading to false so the app can render. 
            }
        }

        initAuth();

    },[]) // [] means that this code runs onece, when the app first loads

    const loginUser = (userData, tokens) => {
        localStorage.setItem('access', tokens.access);
        localStorage.setItem('refresh', tokens.refresh);
        setUser(userData);
    }

    const logoutUser = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setUser(null);
    }

    const updateUser = (userData) => {
        setUser(userData);
    }

    return (
        <AuthContext.Provider value = {{user, loading, loginUser, logoutUser, updateUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    return useContext(AuthContext)
}

