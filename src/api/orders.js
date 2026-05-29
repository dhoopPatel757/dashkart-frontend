import axios from 'axios'

const API = axios.create({
    baseURL : `${import.meta.env.VITE_API_URL}/api/orders`,
})

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const createPaymentIntent = () => API.post('/create-payment-intent/')

export const confirmOrder = (paymentIntentId) => API.post('/confirm/', { payment_intent_id: paymentIntentId })

export const getOrders = () => API.get('/')