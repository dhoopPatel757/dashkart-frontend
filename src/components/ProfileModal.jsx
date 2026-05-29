import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../api/profile'

function ProfileModal({ isOpen, onClose }) {

    const { user, updateUser } = useAuth()

    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: ''
    })

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zip_code: user.zip_code || ''
            })
            setError('')
        }
    }, [isOpen, user])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        if (!formData.phone || !formData.address || !formData.city || !formData.state || !formData.zip_code) {
            setError('Please fill in all fields')
            return
        }
        setSaving(true)
        setError('')
        try {
            const res = await updateProfile(formData)
            updateUser(res.data.profile)
            onClose()
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4'>
            <div className='bg-white rounded-2xl p-6 w-full max-w-md shadow-xl'>

                {/* Header */}
                <div className='flex items-center justify-between mb-2'>
                    <h2 className='text-lg font-semibold text-gray-900'>Complete your profile</h2>
                    <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition'>
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>

                <p className='text-sm text-gray-400 mb-6'>
                    Add your details so we know where to deliver your orders.
                </p>

                {/* Error message */}
                {error && (
                    <div className='mb-4 px-4 py-3 bg-red-50 text-red-500 text-sm rounded-xl'>
                        {error}
                    </div>
                )}

                {/* Input fields */}
                <div className='flex flex-col gap-4'>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Phone number
                        </label>
                        <input
                            type='tel'
                            name='phone'
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder='Enter your phone number'
                            className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Address
                        </label>
                        <input
                            type='text'
                            name='address'
                            value={formData.address}
                            onChange={handleChange}
                            placeholder='Street address, apartment, landmark'
                            className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            City
                        </label>
                        <input
                            type='text'
                            name='city'
                            value={formData.city}
                            onChange={handleChange}
                            placeholder='Your city'
                            className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            State
                        </label>
                        <input
                            type='text'
                            name='state'
                            value={formData.state}
                            onChange={handleChange}
                            placeholder='Your state'
                            className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition'
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                            Zip code
                        </label>
                        <input
                            type='text'
                            name='zip_code'
                            value={formData.zip_code}
                            onChange={handleChange}
                            placeholder='Enter zip code'
                            className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 transition'
                        />
                    </div>

                </div>

                {/* Buttons */}
                <div className='flex gap-3 mt-6'>
                    <button
                        onClick={onClose}
                        className='flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition'
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className='flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-700 transition disabled:opacity-50'
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default ProfileModal

