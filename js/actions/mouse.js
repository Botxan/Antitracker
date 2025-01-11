export const mouse = () => {
    console.log("mouse obfuscation function triggered!");

    // Predet options
    let options = {
        noiseValue: 10, 
        disallowed: [], // domains where not applied
    };

    // Add noise
    const noise = (() => {
        console.log("noise...");
        let useSpare = false;
        let spare;

        return (pos, sigma) => {
            if (!sigma) sigma = options.noiseValue;

            if (useSpare) {
                useSpare = false;
                return Math.max(0, Math.floor(pos + spare * sigma)); // no negativo
            }

            const _2PI = Math.PI * 2;
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(_2PI * u2);
            spare = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(_2PI * u2); // Guarda z1
            useSpare = true;

            return Math.max(0, Math.floor(pos + z0 * sigma)); // no negativo
        };
    })();

    // Intercept and modify
    const fakeMove = (e) => {
        if (!e.isTrusted) return; 

        const domain = window.location.hostname;
        if (options.disallowed.includes(domain)) return; 

        //debug messages
        console.log("Original position:", e.clientX, e.clientY); // Posición original
        console.log("Obfuscated position:", noise(e.clientX), noise(e.clientY)); // Posición con ruido
    

        const props = {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: noise(e.clientX),
            clientY: noise(e.clientY),
            screenX: noise(e.screenX),
            screenY: noise(e.screenY),
        };

        const event = new MouseEvent('mousemove', props); // new mouse movement
        document.dispatchEvent(event);
        e.stopImmediatePropagation(); // stop loop
    };

    // load the initial config
    const loadSettings = async () => {
        const prefs = await browser.storage.sync.get({
            noiseValue: 10,
            disallowed: [],
        });
        options.noiseValue = prefs.noiseValue;
        options.disallowed = prefs.disallowed || [];

        console.log("Loaded noiseValue:", options.noiseValue); 

        const domain = window.location.hostname;
        if (!options.disallowed.includes(domain)) {
            console.log(`Mouse obfuscation enabled for ${domain}`);
            document.addEventListener('mousemove', fakeMove, true);
        } else {
            console.log(`Mouse obfuscation disabled for ${domain}`);
        }
    };


    const saveSettings = async (newOptions) => {
        options = { ...options, ...newOptions };
        await browser.storage.sync.set(options);
    };


    loadSettings();
};
