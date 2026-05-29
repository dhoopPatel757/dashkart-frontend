import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchProducts } from '../api/products'
import ProfileModal from './ProfileModal'
import { useCart } from '../context/CartContext'


function Navbar() {
    const { user, logoutUser } = useAuth();
    const { cartItems } = useCart()
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [profileModalOpen, setProfileModalOpen] = useState(false)

    const [searchQuery, setSearchQuery] = useState('');
    // whatever the user has typed in the search box. Starts as empty string ''.
    const [searchResults, setSearchResults] = useState([]);
    // the array of products Django returns. Starts as empty array [].
    const [showDropdown, setShowDropdown] = useState(false);
    // true when we want to show the search results dropdown, false when we want to hide it. Starts as false.
    const [searchLoading, setSearchLoading] = useState(false);
    // true while the API call is running. We show a tiny spinning circle during this time.

    const searchDesktopRef = useRef();
    const searchMobileRef = useRef();

    useEffect(() => {
        function handleClickOutside(e) {
            const inDesktop = searchDesktopRef.current?.contains(e.target);
            const inMobile = searchMobileRef.current?.contains(e.target);
            if (!inDesktop && !inMobile) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []); // this whole effect runs only once when the Navbar first loads. Not on every render.

    // without debounce: User types "macbook" = 7 keystrokes = 7 API calls fired simultaneously. Django gets hammered. Responses come back out of order. Results flicker. Bad experience, wasteful.
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([])
            setShowDropdown(false)
            return
        }

        const timer = setTimeout(async () => {
            setSearchLoading(true)
            try {
                const res = await searchProducts(searchQuery.trim())
                setSearchResults(res.data.products || [])
                setShowDropdown(true)
            } catch {
                setSearchResults([])
            } finally {
                setSearchLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer) // it is killing the previous timer before starting a new one.
    }, [searchQuery]) // this effect runs every time searchQuery changes. So whenever user types something new in the search box, this effect runs.


    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setShowDropdown(false)
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
        }
    }

    const handleResultClick = (slug) => {
        setShowDropdown(false)
        setSearchQuery('')
        navigate(`/products/${slug}`)
    }



    const handleLogout = () => {
        logoutUser(); // this clears tokens from the localstorage and set user to null.
        navigate('/login'); // navigating user to login page.
        setDropdownOpen(false);
        setMobileMenuOpen(false);
    }

    const getDisplayName = () => {
        if (user.first_name) return user.first_name
        const prefix = user.email.split('@')[0]; // .split('@') breaks the email into an array at the @ symbol. "dhoopspatel757@gmail.com".split('@') becomes ["dhoopspatel757", "gmail.com"]. [0] takes the first item → "dhoopspatel757".
        const name = prefix.split(/[._0-9]/)[0]; // /[._0-9]/ is a regex, means any character that is dot, underscore, or digit. So "dhoopspatel757".split(/[._0-9]/) splits at every digit → ["dhoopspatel", "", ""]. [0] takes first piece → "dhoopspatel".
        return name.charAt(0).toUpperCase() + name.slice(1)
    }

    const navLink = (path) => {
        const isActive = location.pathname === path
        return `flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition font-medium ${isActive
            ? 'text-gray-900 bg-gray-100'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`
    }

    return (
        <>
            <nav className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60'>
                <div className='max-w-6xl mx-auto px-6 py-3'>

                    <div className='flex items-center gap-4'>

                        {/* Logo */}
                        <Link to='/' className='text-xl font-bold text-gray-900 tracking-tight shrink-0'>
                            Dashkart
                        </Link>

                        {/* Desktop Search Bar */}
                        <div className='hidden md:block flex-1 max-w-lg relative' ref={searchDesktopRef}>
                            <div className='relative'>

                                <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0' />
                                </svg>

                                <input
                                    type='text'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder='Search products...'
                                    className='w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 transition placeholder-gray-400'
                                />

                                {searchLoading && (
                                    <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                        <div className='w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin'></div>
                                    </div>
                                )}
                            </div>

                            {showDropdown && (
                                <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50'>
                                    {searchResults.length === 0 ? (
                                        <div className='px-4 py-3 text-sm text-gray-400'>No products found</div>
                                    ) : (
                                        <>
                                            {searchResults.slice(0, 6).map((product) => (
                                                <button
                                                    key={product.slug}
                                                    onClick={() => handleResultClick(product.slug)}
                                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left'
                                                >
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className='w-10 h-10 object-contain rounded-lg bg-gray-100 shrink-0'
                                                    />
                                                    <div className='min-w-0'>
                                                        <p className='text-sm font-medium text-gray-900 truncate'>{product.name}</p>
                                                        <p className='text-xs text-gray-400'>${product.price}</p>
                                                    </div>
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false)
                                                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                                                    setSearchQuery('')
                                                }}
                                                className='w-full px-4 py-2.5 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 transition border-t border-gray-100 text-center'
                                            >
                                                See all results for "{searchQuery}"
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>


                        {/* Right side — all nav links + user section together */}
                        <div className='hidden md:flex items-center gap-1 ml-auto'>

                            <Link to='/' className={navLink('/')}>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                                </svg>
                                Home
                            </Link>

                            <Link to='/cart' className={navLink('/cart')}>
                                <div className='relative'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
                                    </svg>
                
                                    {itemCount > 0 && (
                                        <span className='absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-gray-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none'>
                                            {itemCount}
                                        </span>
                                    )}
                                    
                                </div>
                                Cart
                            </Link>


                            {/* Divider */}
                            <div className='w-px h-5 bg-gray-200 mx-2'></div>

                            {user ? (
                                <div
                                    className='relative'
                                    onMouseEnter={() => setDropdownOpen(true)}
                                    onMouseLeave={() => setDropdownOpen(false)}
                                >
                                    <button className='flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition'>
                                        <div className='w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold'>
                                            {getDisplayName().charAt(0).toUpperCase()}
                                        </div>
                                        <span>Hey, {getDisplayName()}</span>
                                        <svg
                                            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                            fill='none' stroke='currentColor' viewBox='0 0 24 24'
                                        >
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                                        </svg>
                                    </button>

                                    {dropdownOpen && (
                                        <div className='absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50'>
                                            <div className='px-4 py-2.5 border-b border-gray-100'>
                                                <p className='text-sm font-medium text-gray-900'>{getDisplayName()}</p>
                                                <p className='text-xs text-gray-400 mt-0.5'>{user.email}</p>
                                            </div>
                                            <Link
                                                to='/orders'
                                                onClick={() => setDropdownOpen(false)}
                                                className='flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition'
                                            >
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                                                </svg>
                                                My Orders
                                            </Link>





                                            <button
                                                onClick={() => {
                                                    setProfileModalOpen(true)
                                                    setDropdownOpen(false)
                                                }}
                                                className='w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition'
                                            >
                                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                                </svg>
                                                Edit Profile
                                            </button>




                                            <div className='border-t border-gray-100 mt-1 pt-1'>
                                                <button
                                                    onClick={handleLogout}
                                                    className='w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition'
                                                >
                                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                                                    </svg>
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to='/login'
                                    className='text-sm bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition font-medium ml-1'
                                >
                                    Sign in
                                </Link>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className='md:hidden ml-auto p-2 text-gray-600 hover:text-gray-900 transition'
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            ) : (
                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                                </svg>
                            )}
                        </button>

                    </div>

                    {/* Mobile Search Bar */}
                    <div className='md:hidden mt-3 relative' ref={searchMobileRef}>
                        <div className='relative'>

                            <svg className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0' />
                            </svg>

                            <input
                                type='text'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder='Search products...'
                                className='w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-gray-300 transition placeholder-gray-400'
                            />

                            {searchLoading && (
                                <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                                    <div className='w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin'></div>
                                </div>
                            )}
                        </div>

                        {showDropdown && (
                            <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50'>
                                {searchResults.length === 0 ? (
                                    <div className='px-4 py-3 text-sm text-gray-400'>No products found</div>
                                ) : (
                                    <>
                                        {searchResults.slice(0, 5).map((product) => (
                                            <button
                                                key={product.slug}
                                                onClick={() => handleResultClick(product.slug)}
                                                className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left'
                                            >
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className='w-10 h-10 object-contain rounded-lg bg-gray-100 shrink-0'
                                                />
                                                <div className='min-w-0'>
                                                    <p className='text-sm font-medium text-gray-900 truncate'>{product.name}</p>
                                                    <p className='text-xs text-gray-400'>${product.price}</p>
                                                </div>
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false)
                                                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
                                                setSearchQuery('')
                                            }}
                                            className='w-full px-4 py-2.5 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 transition border-t border-gray-100 text-center'
                                        >
                                            See all results for "{searchQuery}"
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>


                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className='md:hidden border-t border-gray-100 mt-4 pt-4 pb-2 flex flex-col gap-1'>

                            <Link to='/' onClick={() => setMobileMenuOpen(false)} className={navLink('/')}>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                                </svg>
                                Home
                            </Link>

                            <Link to='/cart' onClick={() => setMobileMenuOpen(false)} className={navLink('/cart')}>
                                <div className='relative'>
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' />
                                    </svg>
                                    {itemCount > 0 && (
                                        <span className='absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-gray-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none'>
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                                Cart
                            </Link>



                            <Link to='/orders' onClick={() => setMobileMenuOpen(false)} className={navLink('/orders')}>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                                </svg>
                                My Orders
                            </Link>

                            <div className='border-t border-gray-100 my-2'></div>

                            {user ? (
                                <>
                                    <div className='flex items-center gap-3 px-3 py-2'>
                                        <div className='w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold'>
                                            {getDisplayName().charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className='text-sm font-medium text-gray-900'>{getDisplayName()}</p>
                                            <p className='text-xs text-gray-400'>{user.email}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setProfileModalOpen(true)
                                            setMobileMenuOpen(false)
                                        }}
                                        className='w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition'
                                    >
                                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                                        </svg>
                                        Edit Profile
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className='text-sm text-red-500 hover:bg-red-50 px-3 py-2.5 rounded-lg transition text-left'
                                    >
                                        Sign out
                                    </button>

                                </>
                            ) : (
                                <Link
                                    to='/login'
                                    onClick={() => setMobileMenuOpen(false)}
                                    className='text-sm bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition text-center font-medium mt-1'
                                >
                                    Sign in
                                </Link>
                            )}

                        </div>
                    )}

                </div>
            </nav>

            <ProfileModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
        </>
    )
}

export default Navbar




