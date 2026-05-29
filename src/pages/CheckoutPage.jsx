import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js' // loadStripe — loads Stripe's JavaScript in the browser. You pass it your publishable key and it returns a Stripe instance.
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
// Elements — Stripe's provider wrapper. Must wrap any component that uses Stripe
// CardElement — the actual card input UI that Stripe renders (number, expiry, CVC)
// useStripe — hook that gives you the stripe object with methods like confirmCardPayment
// useElements — hook that gives you access to the CardElement so you can read the card data
import { createPaymentIntent, confirmOrder } from '../api/orders'
import { useCart } from '../context/CartContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function CheckoutForm({ clientSecret, total, shippingAddress }) {
    const stripe = useStripe() // stripe gives us payment methods.
    const elements = useElements() // elements gives us access to the card input.
    const navigate = useNavigate()
    const { fetchCart } = useCart() // we will call fetchCart after successful payment to update the cart in the frontend (which will now be empty because Django clears it after order creation).
    const [loading, setLoading] = useState(false) // used to disable button and show "Processing..." while payment is being processed
    const [error, setError] = useState(null) // this stores the error messages to show under the form.

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setLoading(true)
        setError(null)


        // stripe.confirmCardPayment(clientSecret, ...) — sends the card details directly to Stripe. Your backend never sees the card number — only Stripe does
        // elements.getElement(CardElement) — reads the card data from the input field Stripe rendered
        // error: stripeError — destructuring with rename. { error } would clash with our error state so we rename it to stripeError
        // Returns two things: stripeError (if something went wrong) and paymentIntent (if it worked)

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement)
            }
        })

        // if stripe returns an error then show the message and stop.
        if (stripeError) {
            setError(stripeError.message)
            setLoading(false)
            return
        }

        if (paymentIntent.status === 'succeeded') {
            try {
                await confirmOrder(paymentIntent.id) // call Django's confirm_order with paymentIntent.id, Django verifies with Stripe, creates Order and OrderItems in the database, and clears the cart.
                await fetchCart()
                navigate('/orders') // then navigate to the orders history page.
            } catch (err) {
                setError('Payment succeeded but order creation failed. Please contact support.')
                setLoading(false)
            }
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-lg mx-auto px-6 py-10">

                <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition mb-10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to cart
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Checkout</h1>

                {/* Shipping address */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Shipping to</p>
                    <p className="text-sm text-gray-900">{shippingAddress}</p>
                </div>

                {/* Order total */}
                <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-xl font-bold text-gray-900">${parseFloat(total).toFixed(2)}</p>
                    </div>
                </div>

                {/* Card input */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">Card details</p>
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '14px',
                                    color: '#111827',
                                    '::placeholder': { color: '#9ca3af' }
                                }
                            }
                        }} />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 mb-4">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !stripe}
                        className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
                            loading || !stripe
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-900 text-white hover:bg-gray-700'
                        }`}
                    >
                        {loading ? 'Processing...' : `Pay $${parseFloat(total).toFixed(2)}`}
                    </button>
                </form>

            </div>
        </div>
    )
}

function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState(null)
    const [total, setTotal] = useState(null)
    const [shippingAddress, setShippingAddress] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Runs once when the page loads. Calls Django to create a payment intent. Django calculates the total, builds the shipping address, calls Stripe, and returns client_secret. If the user has no address, Django returns an error message which we store in error.
    // err.response?.data?.message — reads the error message from Django's JSON response. ?. means "only go deeper if this exists" — prevents a crash if the error has a different shape.

    useEffect(() => {
        const init = async () => {
            try {
                const res = await createPaymentIntent()
                setClientSecret(res.data.client_secret) // client secret is just an id of the payment intent that stripe use to indentify.
                setTotal(res.data.total)
                setShippingAddress(res.data.shipping_address)
            } catch (err) {
                setError(err.response?.data?.message || 'Something went wrong')
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
                <p className="text-gray-400 text-lg">{error}</p>
                <Link to="/cart" className="text-sm bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-gray-700 transition">
                    Back to cart
                </Link>
            </div>
        )
    }

    return (
        // <Elements> is a stripe providerm. We must pass clientSecret to it so Stripe knows which payment intent this form is for.
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
                clientSecret={clientSecret}
                total={total}
                shippingAddress={shippingAddress}
            />
        </Elements>
    )
}

export default CheckoutPage
