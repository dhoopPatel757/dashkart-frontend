import axios from 'axios'

const API = axios.create({
    baseURL : `${import.meta.env.VITE_API_URL}/api/users`,
})


// interceptor is a function that runs automatically before every request.
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access'); // it reads the JWT token that was saved when the user logged in.
    if (token) {
        config.headers.Authorization = `Bearer ${token}` // add the token to the headers of the request, so that the backend can verify that the use is authenticated and authorized to perform the action.
    }
    return config // always return config, otherwise the request will not be sent.
})

export const getCart = () => API.get('/');

export const addToCart = (productId) => API.post('/add/', { product_id: productId });

export const updateQuantity = (itemId, quantity) => API.patch('/update/', { item_id: itemId, quantity })

export const removeFromCart = (itemId) => API.delete('/remove/', { data: { item_id: itemId } })
// { data : { item_id: itemId } } is how you send data in a DELETE request with axios, since DELETE requests don't have a body like POST or PATCH requests.
// this is called axios quirk.
