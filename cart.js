// Shopping cart management
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.updateAllCartCounts();
    }

    addItem(item) {
        // Check if item already exists
        const existingIndex = this.cart.findIndex(i => i.id === item.id);
        
        if (existingIndex > -1) {
            // Item already in cart
            this.showNotification('Item already in cart', 'info');
            return false;
        }

        this.cart.push({
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            category: item.category,
            source: item.source || 'marketplace',
            url: item.url
        });

        this.save();
        this.showNotification('Added to cart!', 'success');
        return true;
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.save();
        this.showNotification('Removed from cart', 'info');
    }

    clear() {
        this.cart = [];
        this.save();
    }

    getItems() {
        return this.cart;
    }

    getCount() {
        return this.cart.length;
    }

    getTotal() {
        return this.cart.reduce((sum, item) => sum + item.price, 0);
    }

    save() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateAllCartCounts();
        this.triggerCartUpdate();
    }

    updateAllCartCounts() {
        const count = this.getCount();
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    triggerCartUpdate() {
        window.dispatchEvent(new CustomEvent('cartUpdated', { 
            detail: { cart: this.cart, count: this.getCount() } 
        }));
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 140px;
            right: 20px;
            background: ${type === 'success' ? '#3fb950' : type === 'error' ? '#f85149' : '#8f9f83'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize global cart instance
window.cart = new ShoppingCart();
