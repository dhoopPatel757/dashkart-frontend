import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, googleLogin } from '../api/auth'
// login — the function that sends email + password to Django
// googleLogin — the function that sends Google token to Django
import { useAuth } from '../context/AuthContext'

import { useGoogleLogin } from '@react-oauth/google'


function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    // destructuring loginUser. 
    const { loginUser } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault(); // it stops from being a page refresh.
        setLoading(true)
        setError(null)

        try {
            const res = await login({ email, password }) // sending inputed email and password to the backend and get the response through data object.
            loginUser(res.data.user, res.data.tokens) // storing tokens in localStorage so we can access it global throughout the website.
            navigate('/') // navigating automatically to the home page without any user actions.
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.') // ? is optional chaining.
            // err.response is the response sent back by Django. .data is the data inside that. If there is no data inside it then return undefined.
            // || means if the Django did not send the messafe this is the default message shown on the page to the user.
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = useGoogleLogin({ // useGoogleLogin is the react hook which we helps us to get popup of the user's email to get login by user, we don't have to build anything manually, react is already providing it.
        onSuccess: async (tokenResponse) => { // onSuccess callback runs automaticallt when the user picks their google account successfully. tokenResponse is what google gives back to the react, it contains the access_tokens, which is the proff that the user authenticated with google.
            try {
                const res = await googleLogin(tokenResponse.access_token) // we send this token to the Django to verify it and get the backend token.
                loginUser(res.data.user, res.data.tokens)
                navigate('/')
            } catch {
                setError('Google login failed. Please try again.')
            }
        },
        onError: () => { // 
            setError('Google login failed. Please try again.')
        }
    })

    return (
        <div className='min-h-screen bg-white flex items-center justify-center px-4'>
            <div className='w-full max-w-md bg-gray-50 rounded-2xl p-8 shadow-sm'>

                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome back</h1>
                <p className='text-gray-500 mb-8'>Login to your Dashkart account</p>

                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-gray-700'>Email</label>
                        <input
                            type='email'
                            placeholder='Enter your email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-900 transition'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-gray-700'>Password</label>
                        <input
                            type='password'
                            placeholder='Enter your password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-900 transition'
                        />
                    </div>

                    {error && (
                        <p className='text-red-500 text-sm'>{error}</p>
                    )}

                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50'
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>

                <div className='flex items-center gap-3 my-6'>
                    <div className='flex-1 h-px bg-gray-200'></div>
                    <span className='text-sm text-gray-400'>or</span>
                    <div className='flex-1 h-px bg-gray-200'></div>
                </div>

                <button
                    onClick={() => handleGoogleLogin()}
                    className='w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition'
                >
                    <img
                        src='https://www.google.com/favicon.ico'
                        alt='Google'
                        className='w-4 h-4'
                    />
                    Continue with Google
                </button>

                <p className='text-sm text-gray-500 text-center mt-6'>
                    Don't have an account?{' '}
                    <Link to='/signup' className='text-gray-900 font-medium hover:underline'>
                        Sign up
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default LoginPage
