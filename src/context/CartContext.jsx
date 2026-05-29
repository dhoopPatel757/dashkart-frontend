import { createContext, useContext, useState, useEffect } from 'react'
import { getCart, addToCart as addToCartAPI, updateQuantity as updateQuantityAPI, removeFromCart as removeFromCartAPI } from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])
    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            fetchCart()
        } else {
            setCartItems([])
        }
    }, [user])

    const fetchCart = async () => {
        try {
            const res = await getCart()
            setCartItems(res.data.cart.items)
        } catch {
            setCartItems([])
        }
    }

    const addToCart = async (product) => {
        try {
            const res = await addToCartAPI(product.id)
            setCartItems(res.data.cart.items)
        } catch (err) {
            console.error('Failed to add to cart', err)
        }
    }

    const updateQuantity = async (itemId, quantity) => {
        try {
            const res = await updateQuantityAPI(itemId, quantity)
            setCartItems(res.data.cart.items)
        } catch (err) {
            console.error('Failed to update quantity', err)
        }
    }

    const removeFromCart = async (itemId) => {
        try {
            const res = await removeFromCartAPI(itemId)
            setCartItems(res.data.cart.items)
        } catch (err) {
            console.error('Failed to remove from cart', err)
        }
    }

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, fetchCart }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}
