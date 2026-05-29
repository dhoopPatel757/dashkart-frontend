import axios from 'axios';

const API = axios.create({
    baseURL : `${import.meta.env.VITE_API_URL}/api/products`,
});

export const getAllProducts = () => API.get("/");

export const getProductsByCategory = (category) => API.get(`/?category=${category}`);

export const getProductBySlug = (slug) => API.get(`/${slug}`);

export const searchProducts = (query) => API.get(`/?search=${encodeURIComponent(query)}`);
// the function take one input parameter query. So if user types mac then query = "mac".
// API is the axios instance we created with the baseURL set to "http://127.0.0.1:8000/api/products"
// API.get is used to make a get request to the specified endpoint.
// encodedURIComponent is a built-in JavaScript function that encodes special characters in the query string to ensure that it is properly formatted for a URL. For example, if the user types "mac book", the space will be encoded as "%20", resulting in "mac%20book". This ensures that the search query is correctly interpreted by the server when making the request.