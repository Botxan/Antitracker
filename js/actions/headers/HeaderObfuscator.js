import { headersToRandomize, headersToRemove } from "./headerLists.js";

export class HeaderObfuscator {
    constructor() {
        this.isEnabled = false;
        this.listener = null;
    }

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    modifyHeaders(headers, requestId) {
        if (!this.isEnabled) {
            return headers;
        }

        console.group(`Request ${requestId}`);
        console.log("Original headers: ", this.formatHeadersForLog(headers));

        // headers is an array of {name: string, value: string} objects
        let newHeaders = [...headers];

        const setHeader = (name, value) => {
            const index = newHeaders.findIndex((h) => h.name.toLowerCase() === name.toLowerCase());
            if (index !== -1) {
                const oldValue = newHeaders[index].value;
                newHeaders[index].value = value;
                console.log(`Modified header: ${name} | Old: ${oldValue} | New: ${value}`);
            } else {
                newHeaders.push({ name, value });
                console.log(`Added header: ${name} | Value: ${value}`);
            }
        };

        const removeHeader = (name) => {
            const headersBefore = newHeaders.length;
            newHeaders = newHeaders.filter((h) => h.name.toLowerCase() !== name.toLowerCase());
            if (headersBefore !== newHeaders.length) {
                console.log(`Removed header: ${name}`);
            }
        };

        // Randomize most common headers
        setHeader("User-Agent", this.getRandomItem(headersToRandomize.userAgentList));
        setHeader("Accept", this.getRandomItem(headersToRandomize.acceptList));
        setHeader("Accept-Language", this.getRandomItem(headersToRandomize.acceptLanguageList));
        setHeader("Accept-Encoding", this.getRandomItem(headersToRandomize.acceptEncodingList));

        // Add modern security headers
        setHeader('Upgrade-Insecure-Requests', '1');
        setHeader('Sec-Fetch-Dest', 'document');
        setHeader('Sec-Fetch-Mode', 'navigate');
        setHeader('Sec-Fetch-Site', 'none');
        setHeader('Sec-Fetch-User', '?1');

        // Randomly set DNT (Do Not Track) header
        if (Math.random() < 0.5) {
            setHeader('DNT', '1');
        }

        // Remove headers that should be always removed for privacy
        headersToRemove.forEach(header => {
            removeHeader(header);
        });

        console.log("Final modified headers: ", this.formatHeadersForLog(newHeaders));
        console.groupEnd();
        return newHeaders;
    }

    formatHeadersForLog(headers) {
        return headers.reduce((acc, h) => {
            acc[h.name] = h.value;
            return acc;
        }, {});
    }

    setupHeaderListener() {
        this.listener = (details) => {
            const newHeaders = this.modifyHeaders(details.requestHeaders, details.requestId);
            return { requestHeaders: Array.from(newHeaders) };
        };

        browser.webRequest.onBeforeSendHeaders.addListener(this.listener, { urls: ["<all_urls>"] }, [
            "blocking",
            "requestHeaders",
        ]);
    }

    toggle(enabled) {
        this.isEnabled = enabled;
    }
}

export default HeaderObfuscator;