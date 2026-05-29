import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx'
import HomePage from "./pages/HomePage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import SearchResultsPage from "./pages/SearchResultsPage.jsx"
import { CartProvider } from "./context/CartContext.jsx";
import CartPage from "./pages/CartPage.jsx"
import CheckoutPage from "./pages/CheckoutPage.jsx"

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <Routes>

                        <Route path="/login" element={
                            <GuestRoute>
                                <LoginPage />
                            </GuestRoute>
                        } />

                        <Route path="/signup" element={
                            <GuestRoute>
                                <SignupPage />
                            </GuestRoute>
                        } />

                        <Route path="/" element={
                            <>
                                <Navbar />
                                <HomePage />
                            </>
                        } />

                        <Route path="/products/:slug" element={
                            <>
                                <Navbar />
                                <ProductDetailPage />
                            </>
                        } />

                        <Route path="/search" element={
                            <>
                                <Navbar />
                                <SearchResultsPage />
                            </>
                        } />


                        <Route path="/cart" element={
                            <ProtectedRoute>
                                <Navbar />
                                <CartPage />
                            </ProtectedRoute>
                        } />

                        <Route path="/checkout" element={
                            <ProtectedRoute>
                                <Navbar />
                                <CheckoutPage />
                            </ProtectedRoute>
                        } />


                        <Route path="/orders" element={
                            <ProtectedRoute>
                                <Navbar />
                                <OrdersPage/>
                            </ProtectedRoute>
                        } />

                    </Routes>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
