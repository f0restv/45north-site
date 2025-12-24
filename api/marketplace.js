// Marketplace Data Aggregator
// Fetches items from multiple sources: eBay, HiBid, Database, and Shopify

const SOURCES = {
    EBAY: 'ebay',
    HIBID: 'hibid',
    DATABASE: 'database',
    SHOPIFY: 'shopify'
};

// Configuration - Replace with your actual credentials
const CONFIG = {
    ebay: {
        appId: process.env.EBAY_APP_ID || 'YOUR_EBAY_APP_ID',
        endpoint: 'https://svcs.ebay.com/services/search/FindingService/v1',
        userId: process.env.EBAY_USER_ID || 'YOUR_EBAY_USER_ID'
    },
    hibid: {
        apiKey: process.env.HIBID_API_KEY || 'YOUR_HIBID_API_KEY',
        endpoint: 'https://api.hibid.com/v1',
        sellerId: process.env.HIBID_SELLER_ID || 'YOUR_SELLER_ID'
    },
    database: {
        endpoint: process.env.DB_ENDPOINT || '/api/items',
    },
    shopify: {
        shop: process.env.SHOPIFY_SHOP || 'your-shop.myshopify.com',
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN || 'YOUR_SHOPIFY_ACCESS_TOKEN',
        apiVersion: '2024-01'
    }
};

// Fetch from eBay
async function fetchEbayItems() {
    try {
        const params = new URLSearchParams({
            'OPERATION-NAME': 'findItemsAdvanced',
            'SERVICE-VERSION': '1.0.0',
            'SECURITY-APPNAME': CONFIG.ebay.appId,
            'RESPONSE-DATA-FORMAT': 'JSON',
            'REST-PAYLOAD': '',
            'itemFilter(0).name': 'Seller',
            'itemFilter(0).value': CONFIG.ebay.userId,
            'itemFilter(1).name': 'ListingType',
            'itemFilter(1).value(0)': 'FixedPrice',
            'itemFilter(1).value(1)': 'Auction',
            'paginationInput.entriesPerPage': '100'
        });

        const response = await fetch(`${CONFIG.ebay.endpoint}?${params}`);
        const data = await response.json();
        
        const items = data.findItemsAdvancedResponse?.[0]?.searchResult?.[0]?.item || [];
        
        return items.map(item => ({
            id: `ebay_${item.itemId[0]}`,
            source: SOURCES.EBAY,
            title: item.title[0],
            image: item.galleryURL?.[0] || item.pictureURLLarge?.[0] || '',
            category: mapEbayCategory(item.primaryCategory?.[0]?.categoryName?.[0]),
            price: parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || 0),
            type: item.listingInfo?.[0]?.listingType?.[0] === 'FixedPriceItem' ? 'buyNow' : 'auction',
            url: item.viewItemURL[0],
            endTime: item.listingInfo?.[0]?.endTime?.[0]
        }));
    } catch (error) {
        console.error('Error fetching eBay items:', error);
        return [];
    }
}

// Fetch from HiBid
async function fetchHibidItems() {
    try {
        const response = await fetch(`${CONFIG.hibid.endpoint}/auctions`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.hibid.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        return (data.lots || []).map(lot => ({
            id: `hibid_${lot.id}`,
            source: SOURCES.HIBID,
            title: lot.title,
            image: lot.images?.[0]?.url || '',
            category: mapHibidCategory(lot.category),
            price: parseFloat(lot.current_bid || lot.starting_bid || 0),
            type: 'auction',
            url: lot.url,
            lotNumber: lot.lot_number,
            endTime: lot.end_time
        }));
    } catch (error) {
        console.error('Error fetching HiBid items:', error);
        return [];
    }
}

// Fetch from your database
async function fetchDatabaseItems() {
    try {
        const response = await fetch(CONFIG.database.endpoint);
        const data = await response.json();
        
        return (data.items || []).map(item => ({
            id: `db_${item.id}`,
            source: SOURCES.DATABASE,
            title: item.title,
            image: item.image,
            category: item.category,
            price: parseFloat(item.price || 0),
            type: item.type || 'buyNow',
            url: item.url || '#',
            lotNumber: item.lot_number
        }));
    } catch (error) {
        console.error('Error fetching database items:', error);
        return [];
    }
}

// Fetch from Shopify
async function fetchShopifyItems() {
    try {
        const response = await fetch(`https://${CONFIG.shopify.shop}/admin/api/${CONFIG.shopify.apiVersion}/products.json?limit=250`, {
            headers: {
                'X-Shopify-Access-Token': CONFIG.shopify.accessToken,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        return (data.products || []).flatMap(product => 
            product.variants.map(variant => ({
                id: `shopify_${variant.id}`,
                source: SOURCES.SHOPIFY,
                title: `${product.title}${variant.title !== 'Default Title' ? ` - ${variant.title}` : ''}`,
                image: product.images?.[0]?.src || '',
                category: mapShopifyCategory(product.product_type),
                price: parseFloat(variant.price || 0),
                type: 'buyNow',
                url: `https://${CONFIG.shopify.shop}/products/${product.handle}`,
                sku: variant.sku,
                inventory: variant.inventory_quantity
            }))
        ).filter(item => item.inventory > 0); // Only show items in stock
    } catch (error) {
        console.error('Error fetching Shopify items:', error);
        return [];
    }
}

// Category mapping helpers
function mapEbayCategory(categoryName) {
    const mapping = {
        'Coins': 'Coins',
        'Paper Money': 'Paper Money',
        'Comics': 'Comics',
        'Collectibles': 'Collectibles'
    };
    return mapping[categoryName] || 'Collectibles';
}

function mapHibidCategory(category) {
    // Adjust based on HiBid's category structure
    return category || 'Collectibles';
}

function mapShopifyCategory(productType) {
    const mapping = {
        'coins': 'Coins',
        'currency': 'Paper Money',
        'paper-money': 'Paper Money',
        'comics': 'Comics',
        'collectibles': 'Collectibles',
        'collectible': 'Collectibles'
    };
    return mapping[productType?.toLowerCase()] || 'Collectibles';
}

// Main aggregation function
export async function getAllMarketplaceItems() {
    try {
        const [ebayItems, hibidItems, dbItems, shopifyItems] = await Promise.all([
            fetchEbayItems(),
            fetchHibidItems(),
            fetchDatabaseItems(),
            fetchShopifyItems()
        ]);

        const allItems = [...ebayItems, ...hibidItems, ...dbItems, ...shopifyItems];
        
        return {
            success: true,
            count: allItems.length,
            buyNowCount: allItems.filter(item => item.type === 'buyNow').length,
            auctionCount: allItems.filter(item => item.type === 'auction').length,
            items: allItems,
            sources: {
                ebay: ebayItems.length,
                hibid: hibidItems.length,
                database: dbItems.length,
                shopify: shopifyItems.length
            }
        };
    } catch (error) {
        console.error('Error aggregating marketplace items:', error);
        return {
            success: false,
            error: error.message,
            items: []
        };
    }
}

// API endpoint handler (for serverless/Node.js environments)
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = await getAllMarketplaceItems();
    
    res.status(200).json(data);
}
