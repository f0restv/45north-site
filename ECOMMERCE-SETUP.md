# E-Commerce Setup Guide

## Overview
Your marketplace now has full e-commerce functionality with:
- Shopping cart system
- Secure checkout flow
- Payment processing (Stripe)
- Order confirmation
- Multi-source inventory integration

## Files Created

### Frontend
- **`checkout.html`** - Checkout page with shipping and payment forms
- **`order-confirmation.html`** - Order success page
- **`cart.js`** - Shopping cart management (localStorage-based)

### Backend
- **`api/create-order.js`** - Order processing endpoint
- **`api/marketplace.js`** - Inventory aggregation from multiple sources

## Setup Instructions

### 1. Stripe Payment Processing

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add to `.env`:
   ```
   STRIPE_PUBLIC_KEY=pk_test_xxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxx
   ```
4. Update `checkout.html` line 231 with your public key:
   ```javascript
   const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_KEY';
   ```

### 2. Email Notifications

Choose an email service:

**Option A: SendGrid**
```bash
npm install @sendgrid/mail
```
Add to `.env`:
```
SENDGRID_API_KEY=SG.xxxxx
```

**Option B: Mailgun, AWS SES, etc.**
Similar setup - update `api/create-order.js` accordingly

### 3. Database Setup (Optional)

Store orders in a database:

**Option A: MongoDB**
```bash
npm install mongodb
```

**Option B: PostgreSQL, MySQL, etc.**
Update `api/create-order.js` with your database connection

### 4. Deploy API Endpoints

**Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

**Netlify**
```bash
npm i -g netlify-cli
netlify deploy
```

API endpoints will be available at:
- `/api/marketplace` - Fetch all items
- `/api/create-order` - Process orders

## Features

### Shopping Cart
- Persistent (localStorage)
- Add/remove items
- Real-time count updates
- Toast notifications
- Works across pages

### Checkout Flow
1. Customer adds items to cart
2. Views cart in checkout
3. Enters shipping information
4. Provides payment details
5. Completes purchase
6. Receives confirmation

### Buy It Now vs. Auctions
- **Buy It Now items** - Add to cart button
- **Auction items** - Still link to HiBid/auction platform
- Automatically separated based on `type` field

### Inventory Management
When an order completes:
1. Items are marked as sold
2. Inventory updated on source platforms (eBay, Shopify, etc.)
3. Customer receives confirmation email
4. You receive order notification

## Testing

### Test the Cart
1. Visit `marketplace.html`
2. Click "Add to Cart" on Buy It Now items
3. See cart count update in nav
4. Click cart icon to go to checkout

### Test Stripe (Test Mode)
Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code

### Test Order Flow
1. Add items to cart
2. Fill out checkout form
3. Complete payment
4. View confirmation page

## Production Checklist

Before going live:

- [ ] Replace Stripe test keys with live keys
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure email service
- [ ] Set up database for orders
- [ ] Test payment processing
- [ ] Configure shipping rates
- [ ] Set up tax calculations
- [ ] Add terms of service
- [ ] Add privacy policy
- [ ] Test on mobile devices
- [ ] Set up order tracking
- [ ] Configure inventory sync

## Customization

### Shipping Rates
Update in `checkout.html` line 275:
```javascript
const shipping = 9.99; // Change shipping cost
```

Or implement calculated shipping based on weight/location.

### Tax Rates
Update in `checkout.html` line 276:
```javascript
const tax = subtotal * 0.08; // Change tax percentage
```

### Inventory Sources
Enable/disable sources in `api/marketplace.js`:
```javascript
const [ebayItems, hibidItems, dbItems, shopifyItems] = await Promise.all([
    fetchEbayItems(),      // Keep/remove
    fetchHibidItems(),     // Keep/remove
    fetchDatabaseItems(),  // Keep/remove
    fetchShopifyItems()    // Keep/remove
]);
```

## Support

For payment issues:
- Stripe: [stripe.com/support](https://stripe.com/support)
- Stripe Docs: [stripe.com/docs](https://stripe.com/docs)

For general questions:
- Email: info@45northcollective.com
- Phone: (971) 313-2653

## Security Notes

- Never commit `.env` files
- Use environment variables for all secrets
- Enable Stripe webhook signatures
- Validate all user input server-side
- Use HTTPS in production
- Implement rate limiting on API endpoints
