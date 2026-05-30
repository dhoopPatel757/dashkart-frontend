import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate} from 'react-router-dom'
import { getProductBySlug } from '../api/products'
import { useCart } from '../context/CartContext'
import { useAuth} from '../context/AuthContext'

function ProductDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const { addToCart, cartItems } = useCart(); // addToCart is a function from CartContext that allows us to add a product to the cart.
    const {user} = useAuth();
    const alreadyInCart = cartItems.some(item => item.product_id === product?.id)

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true)
            try {
                const res = await getProductBySlug(slug)
                setProduct(res.data.product)
            } catch (err) {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [slug]) // [slug] means run this effect whenever the slug changes (i.e. user clicks on a different product)

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        )
    }

    // if backend returns an error or product is null, show "Product not found" message with a link back to home page
    if (error || !product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <p className="text-gray-400 text-lg">Product not found.</p>
                <Link to="/" className="text-sm bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-gray-700 transition">
                    Back to store
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Back */}
                <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition mb-10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </Link>

                {/* Card */}
                <div className="bg-gray-50 rounded-3xl p-8 flex flex-col lg:flex-row gap-10">

                    {/* Image */}
                    <div className="w-full lg:w-80 h-72 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain p-6"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-xl" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-between flex-1">
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">
                                {product.category}
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {product.name}
                            </h1>
                            <p className="text-3xl font-bold text-gray-900 mt-3">
                                ${product.price}
                            </p>
                            <p className={`text-sm font-medium mt-1.5 ${product.stock > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                {product.stock > 0 ? `In stock — ${product.stock} left` : 'Out of stock'}
                            </p>
                            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="mt-8">
                            <button
                                onClick={() => {
                                    if(!user) {
                                        navigate("/login", {state: { from: `/products/${product.slug}` }});
                                        return;
                                    }
                                    if(!alreadyInCart) {
                                        addToCart(product);
                                    }
                                }}
                                disabled={alreadyInCart}
                                className={`w-full py-3 rounded-xl text-sm font-semibold transition ${alreadyInCart
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-900 text-white hover:bg-gray-700'
                                    }`}
                            >
                                {alreadyInCart ? 'Added to cart' : 'Add to cart'}
                            </button>
                        </div>



                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProductDetailPage

