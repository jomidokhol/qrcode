// api/proxy.js
const https = require('https');
const http = require('http');
const { URL } = require('url');

module.exports = (req, res) => {
    const { url } = req.query;

    // CORS Headers সেট করা (যাতে আপনার সাইট এক্সেস পায়)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (!url) {
        return res.status(400).send('URL parameter is required');
    }

    try {
        const targetUrl = decodeURIComponent(url);
        const parsedUrl = new URL(targetUrl);
        const client = parsedUrl.protocol === 'https:' ? https : http;

        // ফাইল ফেচ করা
        const proxyReq = client.get(targetUrl, (proxyRes) => {
            // হেডারগুলো ফরোয়ার্ড করা (যেমন ফাইলের টাইপ ও সাইজ)
            if (proxyRes.headers['content-type']) {
                res.setHeader('Content-Type', proxyRes.headers['content-type']);
            }
            if (proxyRes.headers['content-length']) {
                res.setHeader('Content-Length', proxyRes.headers['content-length']);
            }

            // ডাটা পাইপ করা (স্ট্রিম)
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (e) => {
            res.status(500).send('Error fetching the file: ' + e.message);
        });

    } catch (error) {
        res.status(400).send('Invalid URL Provided');
    }
};
