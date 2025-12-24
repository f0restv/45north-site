# Marketplace API Setup Guide

## Overview
The marketplace now pulls items from multiple sources:
- **eBay API** - Live eBay listings
- **HiBid API** - Auction platform listings  
- **Database** - Your own custom database
- **Shopify** - Shopify store products

## Setup Instructions

### 1. eBay API Setup
1. Create a developer account at [developer.ebay.com](https://developer.ebay.com)
2. Get your **App ID** (Client ID) from the Application Keys section
3. Get your **eBay User ID** (your seller account username)
4. Add to `.env`:
   ```
   EBAY_APP_ID=YourAppID123
   EBAY_USER_ID=your_ebay_username
   ```

### 2. HiBid API Setup
1. Contact HiBid support for API access
2. Get your **API Key** and **Seller ID**
3. Add to `.env`:
   ```
   HIBID_API_KEY=your_hibid_key
   HIBID_SELLER_ID=your_seller_id
   ```

### 3. Database Setup
Create an API endpoint that returns items in this format:
```json
{
  "items": [
    {
      "id": 1,
      "title": "Item Name",
      "image": "https://example.com/image.jpg",
      "category": "Coins",
      "price": 24.99,
      "type": "buyNow",
      "url": "https://yoursite.com/item/1",
      "lot_number": 123
    }
  ]
}
```

Add to `.env`:
```
DB_ENDPOINT=https://yoursite.com/api/items
```

### 4. Shopify Setup
1. In Shopify Admin: **Apps** → **Develop apps** → **Create an app**
2. Install app and configure **Admin API** access
3. Enable these scopes: `read_products`, `read_inventory`
4. Get your **Access Token** and **Shop Domain**
5. Add to `.env`:
   ```
   SHOPIFY_SHOP=your-shop.myshopify.com
   SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
   ```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual credentials in `.env`

3. Update `/api/marketplace.js` with your specific:
   - Category mappings
   - Filters
   - Item limits

## Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Add environment variables in Vercel dashboard

### Netlify
1. Add `netlify.toml`:
   ```toml
   [build]
     functions = "api"
   ```
2. Deploy and add environment variables in Netlify dashboard

### Traditional Server
1. Install dependencies: `npm install`
2. Set environment variables
3. Deploy API folder to your server

## Testing

Test the API locally:
```bash
node -e "import('./api/marketplace.js').then(m => m.getAllMarketplaceItems().then(console.log))"
```

Or visit: `http://localhost:3000/api/marketplace`

## Fallback Behavior

If the API fails, the marketplace automatically falls back to demo data stored in the HTML file. This ensures the site always displays something to visitors.

## Category Mapping

Customize categories in `/api/marketplace.js`:
- Comics
- Coins  
- Paper Money
- Collectibles

Add more categories as needed.

## Support

For issues with specific APIs:
- eBay: [developer.ebay.com/support](https://developer.ebay.com/support)
- HiBid: Contact your HiBid account manager
- Shopify: [shopify.dev/docs](https://shopify.dev/docs)
