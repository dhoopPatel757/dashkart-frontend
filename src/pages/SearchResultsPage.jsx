import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
// useSearchParams is a react router hook that allows to read the ?q=mac part from the URL.
// without this, page has no idea what the use searched for.
import { searchProducts } from '../api/products'

function SearchResultsPage() {

    const [searchParams] = useSearchParams()
    // searchParams is an object that holds everything after ? in the URL. For example,  /search?q=macbook, it holds { q: "macbook" }.

    const query = searchParams.get('q') || '' 
    // it reads the value of q from the URL.

    const [products, setProducts] = useState([])
    // it store the matching products which is returned by the backend.

    const [loading, setLoading] = useState(true)

    // it runs every time the query changes.
    useEffect(() => {
        if (!query) {
            setProducts([])
            setLoading(false)
            return
        }
        setLoading(true)
        searchProducts(query)
            .then(res => setProducts(res.data.products || []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))
    }, [query])

    return (
        <div className='max-w-6xl mx-auto px-6 py-8'>

            <div className='mb-6'>
                <h1 className='text-xl font-semibold text-gray-900'>
                    {loading
                        ? 'Searching...'
                        : `${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`
                    }
                </h1>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
                    ))}
                </div>

            ) : products.length === 0 ? (
                <div className='text-center py-20'>
                    <p className='text-4xl mb-4'>🔍</p>
                    <p className='text-gray-900 font-medium text-lg'>No results for "{query}"</p>
                    <p className='text-gray-400 text-sm mt-1'>Try a different search term</p>
                    <Link to='/' className='mt-6 inline-block text-sm bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 transition font-medium'>
                        Browse all products
                    </Link>
                </div>

            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <Link
                            key={product.slug}
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
                            </div>
                        </Link>
                    ))}
                </div>
            )}

        </div>
    )
}

export default SearchResultsPage



