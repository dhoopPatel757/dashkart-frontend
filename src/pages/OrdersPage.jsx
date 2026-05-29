import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders } from '../api/orders'

function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await getOrders()
                setOrders(res.data.orders)
            } catch {
                setOrders([])
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading orders...</p>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <p className="text-gray-400 text-lg">You have no orders yet.</p>
                <Link to="/" className="text-sm bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-gray-700 transition">
                    Start shopping
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

                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Your orders</h1>

                <div className="flex flex-col gap-6">
                    {orders.map(order => (
                        <div key={order.id} className="border border-gray-100 rounded-2xl overflow-hidden">

                            <div className="bg-gray-50 px-5 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Order #{order.id}</p>
                                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                    <p className="text-sm font-bold text-gray-900">${parseFloat(order.total_amount).toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {order.items.map(item => (
                                    <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                            {item.product_image ? (
                                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-contain p-1.5" />
                                            ) : (
                                                <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">${parseFloat(item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default OrdersPage
