# VAARAHI

A multi-page e-commerce storefront for agricultural and grain-processing products (multi-grain dryers, mills, and related machinery). The frontend is built with plain HTML, CSS, and vanilla JavaScript, while a lightweight Node.js / Express backend handles online payments through Razorpay.

The application runs entirely in the browser for catalog browsing, cart, wishlist, and account management (state is persisted in `localStorage`), and only contacts the backend when a payment order needs to be created and verified.

## Features

- **Product catalog** – Home, products listing, and detailed product pages driven by a central product data repository (`assets/js/product-data.js`) so product information stays consistent across every page.
- **Shopping cart** – Add/remove items, quantity updates, coupon support, and cross-page synchronization, all persisted in `localStorage` (`assets/js/cart.js`, `cart-sync.js`, `index-cart.js`).
- **Wishlist** – Save and manage favorite products with UI synced across pages (`assets/js/wishlist.js`, `cart-wishlist.js`, `update-wishlist-ui.js`).
- **Authentication** – Client-side user registration, login, logout, and session state via `localStorage` / `sessionStorage` (`assets/js/auth.js`), with dedicated `login.html`, `register.html`, and `profile.html` pages.
- **Checkout & payments** – Razorpay integration for order creation and signature verification (`assets/js/razorpay-integration.js` + `backend/server.js`), with order confirmation pages and an email template.
- **Product reviews & ratings** – Review and rating UI components (`assets/js/product-reviews.js`, `rating-ui.css`).
- **Search & sorting** – Product search and sort utilities (`assets/js/search.js`, `product-sort.js`).
- **Indian Rupee formatting** – Currency utilities that format prices in INR with the ₹ symbol (`assets/js/currency-utils.js`).
- **Responsive UI** – Built on Bootstrap with Swiper carousels, Isotope filtering, Magnific Popup, and Font Awesome icons.

## Tech Stack

**Frontend**
- HTML5, CSS3, vanilla JavaScript
- [Bootstrap](https://getbootstrap.com/) (layout & components)
- jQuery and jQuery UI
- [Swiper](https://swiperjs.com/) (carousels/sliders)
- [Isotope](https://isotope.metafizzy.co/) (filtering/layout)
- [Magnific Popup](https://dimsemenov.com/plugins/magnific-popup/) (lightbox)
- Font Awesome (icons)
- Browser `localStorage` / `sessionStorage` for cart, wishlist, and auth state

**Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [Razorpay](https://razorpay.com/) Node SDK for payments
- `cors`, `body-parser`, and Node's built-in `crypto` for HMAC signature verification

## Architecture / How It Works

The site is a collection of static HTML pages. Shared behavior is layered in through modular JavaScript files under `assets/js/`:

1. **Product data** lives in a single source of truth (`product-data.js`) and is rendered dynamically into the catalog and detail pages.
2. **Cart, wishlist, and authentication** are managed entirely on the client and persisted in the browser, so the catalog experience needs no server.
3. **Checkout** calls the Express backend:
   - `POST /api/create-order` – creates a Razorpay order for the given `amount` and `currency`.
   - `POST /api/verify-payment` – verifies the Razorpay payment signature using an HMAC-SHA256 check before the order is treated as paid.
4. After a successful payment the user is redirected to the order confirmation page (`order-confirmation.html`).

## Project Structure

```
Vaarahi/
├── index.html                      # Home page
├── products.html                   # Product listing
├── shop-details.html               # Product detail page
├── cart.html                       # Shopping cart
├── wishlist.html                   # Wishlist
├── checkout.html                   # Checkout + Razorpay payment
├── order-confirmation.html         # Post-payment confirmation
├── order-confirmation-email.html   # Order confirmation email template
├── login.html / register.html      # Authentication pages
├── profile.html                    # User profile / account
├── about.html / contact.html       # Static content pages
├── pictures.html                   # Gallery page
├── assets/
│   ├── css/                        # Bootstrap, theme styles, and custom UI styles
│   ├── js/                         # App logic (cart, wishlist, auth, checkout, etc.)
│   ├── img/                        # Product and site images
│   ├── fonts/                      # Web fonts
│   └── FAVICONS/                   # Favicon assets
├── backend/
│   ├── server.js                   # Express server (Razorpay order + verify)
│   └── package.json                # Backend dependencies and start script
└── readme.md
```

## Prerequisites

- A modern web browser.
- [Node.js](https://nodejs.org/) and npm (required only to run the payment backend).
- A [Razorpay](https://razorpay.com/) account with API key/secret (test keys work for development).

## Installation

Clone the repository:

```bash
git clone https://github.com/KarthikRommula/Vaarahi.git
cd Vaarahi
```

Install backend dependencies:

```bash
cd backend
npm install
```

## Configuration

Razorpay credentials are referenced in two places. Replace the placeholder/test values with your own keys before using real payments:

- **Backend** (`backend/server.js`):
  ```js
  const razorpay = new Razorpay({
      key_id: 'YOUR_RAZORPAY_KEY_ID',
      key_secret: 'YOUR_RAZORPAY_KEY_SECRET'
  });
  ```
- **Frontend** (`assets/js/razorpay-integration.js`): set `RAZORPAY_CONFIG.key_id` to your public Razorpay `key_id` (never put the secret on the frontend).

The backend port can be set via the `PORT` environment variable (defaults to `3001`).

> Note: The repository currently ships with Razorpay **test** keys. Rotate these and use your own credentials—never commit live secrets.

## Usage / Running Locally

**1. Start the payment backend:**

```bash
cd backend
npm start
```

The server starts on `http://localhost:3001` (or the port set via `PORT`).

**2. Serve the frontend:**

The frontend is static HTML and can be served with any static file server. A simple option is the VS Code **Live Server** extension (the project includes `.vscode/settings.json` configured for port `5504`). Alternatively:

```bash
# from the project root, using Python
python -m http.server 5504
```

Then open `index.html` (e.g. `http://localhost:5504/index.html`) in your browser.

## Available Scripts

From the `backend/` directory:

| Script | Description |
| ------ | ----------- |
| `npm start` | Starts the Express payment server (`node server.js`). |

## License

No license file is currently included in this repository.
