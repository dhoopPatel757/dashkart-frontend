import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function GuestRoute({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <div className="text-center mt-20 text-gray-500">Loading...</div>
    }

    if (user) {
        const from = location.state?.from || '/'
        return <Navigate to={from} />
    }

    return children
}

