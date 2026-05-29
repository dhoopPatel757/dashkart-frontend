import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function CartPage() {
    const { cartItems, updateQuantity, removeFromCart } = useCart()

    const navigate = useNavigate();

    const total = cartItems.reduce((sum, item) => {
        return sum + parseFloat(item.product_price) * item.quantity
    }, 0)

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <p className="text-gray-400 text-lg">Your cart is empty.</p>
                <Link to="/" className="text-sm bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-gray-700 transition">
                    Continue shopping
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-6 py-10">

                <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition mb-10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Continue shopping
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Your cart</h1>

                <div className="flex flex-col gap-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="bg-gray-50 rounded-2xl p-5 flex items-center gap-5">

                            {/* Image */}
                            <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                {item.product_image ? (
                                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                                <p className="text-sm text-gray-500 mt-0.5">${item.product_price}</p>
                            </div>

                            {/* Quantity controls */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 rounded-lg bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition flex items-center justify-center"
                                >
                                    −
                                </button>
                                <span className="text-sm font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    disabled={item.quantity >= item.product_stock}
                                    className={`w-8 h-8 rounded-lg font-semibold transition flex items-center justify-center ${item.quantity >= item.product_stock
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-900 text-white hover:bg-gray-700'
                                        }`}
                                >
                                    +
                                </button>

                            </div>

                            {/* Remove */}
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-300 hover:text-red-400 transition ml-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
                </div>

                <button
                    onClick={() => navigate('/checkout')}
                    className="mt-6 w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition"
                >
                    Proceed to checkout
                </button>

            </div>
        </div>
    )
}

export default CartPage
