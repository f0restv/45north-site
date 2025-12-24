// Cookie Consent Banner
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    document.getElementById('cookieBanner').style.display = 'none';
    // Load Google Analytics
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-MJE80RBSSL';
    document.head.appendChild(script);
    script.onload = function() {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-MJE80RBSSL');
    };
}

function declineCookies() {
    localStorage.setItem('cookieConsent', 'declined');
    document.getElementById('cookieBanner').style.display = 'none';
}

// Show banner if no consent recorded
window.addEventListener('load', () => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
        document.getElementById('cookieBanner').style.display = 'block';
    }
});
