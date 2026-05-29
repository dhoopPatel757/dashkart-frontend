# 🛒 Dashkart — Frontend

Dashkart is a full-stack e-commerce web application where users can browse products, add them to cart, and complete purchases using Stripe. Built as a personal project to learn React, REST APIs, and real-world deployment.

🌐 **Live Site:** https://dashkart-frontend.vercel.app

---

## 🚀 Tech Stack

| Technology      | Purpose             |
| --------------- | ------------------- |
| React 19        | UI framework        |
| Tailwind CSS v4 | Styling             |
| Vite            | Build tool          |
| Axios           | API requests        |
| React Router    | Client-side routing |
| Stripe.js       | Payment processing  |
| Vercel          | Deployment          |

---

## ✨ Features

* Browse products and filter by category
* Search products by name or description
* Google OAuth and email/password authentication
* JWT-based session management with auto token refresh
* Add to cart, update quantities, remove items
* Stripe card payment integration
* Order history with item details
* Profile completion modal for shipping address
* Fully responsive on mobile and desktop

---

## 📂 Project Structure

```text
src/
├── api/          # Axios API calls (auth, cart, orders, products)
├── components/   # Reusable components (Navbar, ProtectedRoute, etc.)
├── context/      # React Context (AuthContext, CartContext)
└── pages/        # Page components (HomePage, CartPage, CheckoutPage, etc.)
```

---

## 🔗 Backend

The backend repository is at:

https://github.com/dhoopPatel757/dashkart-backend
