
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

// A simple in-memory cache to avoid re-fetching the same URL multiple times within a short period.
const cache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchUrlContent(url: string): Promise<string> {
    const now = Date.now();
    if (cache.has(url)) {
        const cached = cache.get(url)!;
        if (now - cached.timestamp < CACHE_TTL_MS) {
            return cached.content;
        }
    }

    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Node.js-fetch' }});

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        let textContent: string;

        if (contentType && contentType.includes('application/json')) {
            const json = await response.json();
            textContent = JSON.stringify(json, null, 2);
        } else if (contentType && contentType.includes('text/html')) {
            const html = await response.text();
            const dom = new JSDOM(html, { url });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();
            textContent = article?.textContent || dom.window.document.body.textContent || '';
        } else {
            textContent = await response.text();
        }
        
        // Basic cleanup
        const cleanedContent = textContent.replace(/\s\s+/g, ' ').trim();
        
        cache.set(url, { content: cleanedContent, timestamp: now });

        return cleanedContent;

    } catch (error: any) {
        console.error(`Error fetching URL content for ${url}:`, error);
        throw new Error(`Failed to fetch or parse content from URL: ${error.message}`);
    }
}
