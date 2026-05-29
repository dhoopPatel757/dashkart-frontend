import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {

    const { user, loading } = useAuth()

    if (loading) {
        return <div className="text-center mt-20 text-gray-500">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login"/>
    }

    return children
}

export default ProtectedRoute
