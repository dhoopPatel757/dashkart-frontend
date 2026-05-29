import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { googleLogin } from '../api/auth'
import { useGoogleLogin } from '@react-oauth/google'


function SignupPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const { loginUser } = useAuth()
    const navigate = useNavigate()

    const handleGoogleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await googleLogin(tokenResponse.access_token)
                loginUser(res.data.user, res.data.tokens)
                navigate('/')
            } catch {
                setError('Google signup failed. Please try again.')
            }
        },
        onError: () => {
            setError('Google signup failed. Please try again.')
        }
    })


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await signup({ username, email, password, password2 })
            loginUser(res.data.user, res.data.tokens)
            navigate('/')
        } catch (err) {
            const errors = err.response?.data?.errors
            if (errors) {
                const firstError = Object.values(errors)[0]
                setError(firstError)
            } else {
                setError(err.response?.data?.message || 'Signup failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-white flex items-center justify-center px-4'>
            <div className='w-full max-w-md bg-gray-50 rounded-2xl p-6 shadow-sm'>

                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Create account</h1>
                <p className='text-gray-500 mb-6'>Signup to your Dashkart account</p>

                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-gray-700'>Username</label>
                        <input
                            type='text'
                            placeholder='Choose a username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className='border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-900 transition'
                        />
                    </div>

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
                            placeholder='Create a password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-gray-900 transition'
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label className='text-sm font-medium text-gray-700'>Confirm Password</label>
                        <input
                            type='password'
                            placeholder='Confirm your password'
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
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
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>

                </form>

                <div className='flex items-center gap-3 my-6'>
                    <div className='flex-1 h-px bg-gray-200'></div>
                    <span className='text-sm text-gray-400'>or</span>
                    <div className='flex-1 h-px bg-gray-200'></div>
                </div>

                <button
                    onClick={() => handleGoogleSignup()}
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
                    Already have an account?{' '}
                    <Link to='/login' className='text-gray-900 font-medium hover:underline'>
                        Login
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default SignupPage
