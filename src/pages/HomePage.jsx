import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProducts, getProductsByCategory } from '../api/products'
import { useAuth } from '../context/AuthContext'
import ProfileModal from '../components/ProfileModal'

const CATEGORIES = [
    { label: 'All', value: null },
    { label: 'Phones', value: 'phone' },
    { label: 'Laptops', value: 'laptop' },
    { label: 'Tablets', value: 'tablet' },
    { label: "Headphones", value: "headphones" }
]


function HomePage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState(null)

    const { user } = useAuth()
    const [profileModalOpen, setProfileModalOpen] = useState(false)


    useEffect(() => {
        if (!user) return

        const isProfileIncomplete = !user.phone || !user.address || !user.city || !user.state || !user.zip_code

        if (!isProfileIncomplete) return

        const timer = setTimeout(() => {
            setProfileModalOpen(true)
        }, 1000)

        return () => clearTimeout(timer)
    }, [user])


    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {
                let res;
                if (!activeCategory) {
                    res = await getAllProducts()
                } else {
                    res = await getProductsByCategory(activeCategory)
                }
                setProducts(res.data.products ?? [])
            } catch (err) {
                console.error('Failed to load products:', err)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [activeCategory])

    return (
        <>
            <div className="min-h-screen bg-white">

                {/* ── Hero Section ── */}
                <section className="bg-gradient-to-b from-gray-50 to-white px-6 py-24 text-center pt-40">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                        Welcome to Dashkart
                    </p>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                        The Ecommerce store.<br />
                        <span className="text-gray-400">Engineered different.</span>
                    </h1>
                    <p className="mt-5 text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
                        Premium electronics. Fast delivery. Honest prices.
                    </p>

                    <div className="mt-8 flex justify-center gap-3">
                        <a
                            href="#products"
                            className="bg-gray-900 text-white text-sm font-medium px-7 py-3 rounded-full hover:bg-gray-700 transition"
                        >
                            Shop now
                        </a>
                        <Link
                            to="/cart"
                            className="bg-white text-gray-900 text-sm font-medium px-7 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                        >
                            View cart
                        </Link>
                    </div>
                </section>

                {/* ── Category Filter ── */}
                <section id="products" className="max-w-6xl mx-auto px-6 pt-45 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
                        Browse products
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.label}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.value
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}

                    </div>
                </section>

                {/* ── Product Grid ── */}
                <section className="max-w-6xl mx-auto px-6 pb-24">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-24">
                            <p className="text-gray-400 text-lg">No products found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>

            </div>
            <ProfileModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
        </>
    )
}

function ProductCard({ product }) {
    return (
        <Link
            to={`/products/${product.slug}`}
            className="group bg-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
        >
            <div className="aspect-square bg-white rounded-xl flex items-center justify-center mb-5 overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                )}
            </div>

            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">
                {product.category}
            </p>
            <h3 className="text-base font-semibold text-gray-900 leading-snug">
                {product.name}
            </h3>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {product.description}
            </p>

            <div className="flex items-center justify-between mt-5">
                <span className="text-xl font-bold text-gray-900">
                    ${product.price}
                </span>
                <span className="text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition font-medium">
                    View
                </span>
            </div>
        </Link>
    )
}

export default HomePage
