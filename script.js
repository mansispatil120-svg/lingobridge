
/* ============================================
   LINGOBRIDGE - MAIN JAVASCRIPT
   ============================================ */


/* ============================================
   1. CONFIGURATION AND LANGUAGE DATA
   ============================================ */

const API_URL = "/api/translate";

const STORAGE_KEYS = {
    theme: "lingobridge_theme",
    history: "lingobridge_history",
    favorites: "lingobridge_favorites"
};

const MAX_HISTORY = 50;
const MAX_FAVORITES = 50;

const languages = {
    en: { name: "English", speech: "en-US" },
    hi: { name: "Hindi", speech: "hi-IN" },
    kn: { name: "Kannada", speech: "kn-IN" },
    te: { name: "Telugu", speech: "te-IN" },
    ta: { name: "Tamil", speech: "ta-IN" },
    ml: { name: "Malayalam", speech: "ml-IN" },
    mr: { name: "Marathi", speech: "mr-IN" },
    bn: { name: "Bengali", speech: "bn-IN" },
    gu: { name: "Gujarati", speech: "gu-IN" },
    pa: { name: "Punjabi", speech: "pa-IN" },
    ur: { name: "Urdu", speech: "ur-IN" },
    or: { name: "Odia", speech: "or-IN" },
    es: { name: "Spanish", speech: "es-ES" },
    fr: { name: "French", speech: "fr-FR" },
    de: { name: "German", speech: "de-DE" },
    zh: { name: "Chinese", speech: "zh-CN" },
    ja: { name: "Japanese", speech: "ja-JP" },
    ko: { name: "Korean", speech: "ko-KR" },
    ar: { name: "Arabic", speech: "ar-SA" },
    ru: { name: "Russian", speech: "ru-RU" },
    pt: { name: "Portuguese", speech: "pt-PT" },
    it: { name: "Italian", speech: "it-IT" }
};


/* ============================================
   2. GET HTML ELEMENTS
   ============================================ */

const elements = {

    menuToggle: document.getElementById("menuToggle"),
    navLinks: document.getElementById("navLinks"),
    themeToggle: document.getElementById("themeToggle"),

    sourceLanguage: document.getElementById("sourceLanguage"),
    targetLanguage: document.getElementById("targetLanguage"),
    swapLanguages: document.getElementById("swapLanguages"),

    sourceText: document.getElementById("sourceText"),
    translatedText: document.getElementById("translatedText"),

    sourceCharacterCount:
        document.getElementById("sourceCharacterCount"),

    translationStatus:
        document.getElementById("translationStatus"),

    translateButton:
        document.getElementById("translateButton"),

    clearText: document.getElementById("clearText"),
    resetTranslator: document.getElementById("resetTranslator"),

    copyTranslation:
        document.getElementById("copyTranslation"),

    sourceSpeak: document.getElementById("sourceSpeak"),

    speakTranslation:
        document.getElementById("speakTranslation"),

    favoriteTranslation:
        document.getElementById("favoriteTranslation"),

    translationMessage:
        document.getElementById("translationMessage"),

    languageSearch:
        document.getElementById("languageSearch"),

    languageGrid:
        document.getElementById("languageGrid"),

    languageSearchEmpty:
        document.getElementById("languageSearchEmpty"),

    historyList: document.getElementById("historyList"),
    clearHistory: document.getElementById("clearHistory"),

    favoritesList:
        document.getElementById("favoritesList"),

    favoriteCount:
        document.getElementById("favoriteCount"),

    startRecording:
        document.getElementById("startRecording"),

    stopRecording:
        document.getElementById("stopRecording"),

    voiceSourceLanguage:
        document.getElementById("voiceSourceLanguage"),

    voiceTargetLanguage:
        document.getElementById("voiceTargetLanguage"),

    voiceStatus:
        document.getElementById("voiceStatus"),

    voiceAnimation:
        document.getElementById("voiceAnimation"),

    recognizedText:
        document.getElementById("recognizedText"),

    voiceTranslatedText:
        document.getElementById("voiceTranslatedText"),

    translateVoiceText:
        document.getElementById("translateVoiceText"),

    speakVoiceTranslation:
        document.getElementById("speakVoiceTranslation"),

    voiceMessage:
        document.getElementById("voiceMessage"),

    contactForm:
        document.getElementById("contactForm"),

    contactMessageStatus:
        document.getElementById("contactMessageStatus"),

    toastContainer:
        document.getElementById("toastContainer"),

    currentYear:
        document.getElementById("currentYear")
};


/* ============================================
   3. APPLICATION STATE
   ============================================ */

let currentTranslation = null;

let lastDetectedLanguage = null;

let isTranslating = false;

let recognition = null;

let isRecording = false;

let recognizedSpeech = "";

let isSpeaking = false;

let toastTimeouts = [];

let translationRequestNumber = 0;


/* ============================================
   4. LOCAL STORAGE FUNCTIONS
   ============================================ */

function getStorageItem(key, fallback) {

    try {

        const storedData = localStorage.getItem(key);

        if (storedData === null) {
            return fallback;
        }

        return JSON.parse(storedData);

    } catch (error) {

        console.error("Storage reading error:", error);

        return fallback;

    }

}


function saveStorageItem(key, value) {

    try {

        localStorage.setItem(key, JSON.stringify(value));

        return true;

    } catch (error) {

        console.error("Storage saving error:", error);

        showToast(
            "Unable to save data. Your browser storage may be full.",
            "error"
        );

        return false;

    }

}


function getHistory() {

    const history = getStorageItem(
        STORAGE_KEYS.history,
        []
    );

    return Array.isArray(history) ? history : [];

}


function getFavorites() {

    const favorites = getStorageItem(
        STORAGE_KEYS.favorites,
        []
    );

    return Array.isArray(favorites) ? favorites : [];

}


/* ============================================
   5. TOAST NOTIFICATIONS
   ============================================ */

function showToast(message, type = "info") {

    if (!elements.toastContainer) {
        return;
    }

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    const icon = document.createElement("i");

    if (type === "success") {
        icon.className = "fa-solid fa-circle-check";
    } else if (type === "error") {
        icon.className = "fa-solid fa-circle-exclamation";
    } else {
        icon.className = "fa-solid fa-circle-info";
    }

    const text = document.createElement("span");

    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);

    elements.toastContainer.appendChild(toast);

    const timeout = setTimeout(() => {

        toast.remove();

        toastTimeouts = toastTimeouts.filter(
            item => item !== timeout
        );

    }, 3500);

    toastTimeouts.push(timeout);

}


/* ============================================
   6. DARK AND LIGHT MODE
   ============================================ */

function applyTheme(theme) {

    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);

    const icon = elements.themeToggle.querySelector("i");

    if (icon) {

        icon.className = isDark
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";

    }

    elements.themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    saveStorageItem(STORAGE_KEYS.theme, theme);

}


function initializeTheme() {

    const savedTheme = getStorageItem(
        STORAGE_KEYS.theme,
        "light"
    );

    applyTheme(
        savedTheme === "dark" ? "dark" : "light"
    );

}


elements.themeToggle.addEventListener("click", () => {

    const isDark = document.body.classList.contains("dark-mode");

    applyTheme(isDark ? "light" : "dark");

    showToast(
        isDark ? "Light mode enabled" : "Dark mode enabled",
        "success"
    );

});


/* ============================================
   7. MOBILE NAVIGATION
   ============================================ */

function closeMobileMenu() {

    elements.navLinks.classList.remove("active");

    elements.menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    const icon = elements.menuToggle.querySelector("i");

    icon.className = "fa-solid fa-bars";

}


elements.menuToggle.addEventListener("click", () => {

    const isOpen = elements.navLinks.classList.toggle("active");

    elements.menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    const icon = elements.menuToggle.querySelector("i");

    icon.className = isOpen
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";

});


document.querySelectorAll(".nav-link, .nav-cta, .logo, .footer a, .hero a, .cta-button, .about-content a").forEach(link => {

    link.addEventListener("click", () => {

        if (link.getAttribute("href")?.startsWith("#")) {

            closeMobileMenu();

        }

    });

});


/* ============================================
   8. ACTIVE NAVIGATION LINKS
   ============================================ */

function initializeActiveNavigation() {

    const sections = document.querySelectorAll("main section[id]");

    const navLinks = document.querySelectorAll(".nav-link");

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) {
                return;
            }

            navLinks.forEach(link => {

                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === `#${entry.target.id}`
                );

            });

        });

    }, {
        rootMargin: "-25% 0px -65% 0px"
    });

    sections.forEach(section => observer.observe(section));

}


/* ============================================
   9. CHARACTER COUNTER
   ============================================ */

function updateCharacterCount() {

    const count = elements.sourceText.value.length;

    elements.sourceCharacterCount.textContent =
        `${count} / 5000`;

}


elements.sourceText.addEventListener(
    "input",
    updateCharacterCount
);


/* ============================================
   10. LANGUAGE INFORMATION
   ============================================ */

function getLanguageName(code) {

    if (code === "auto") {
        return "Auto Detect";
    }

    return languages[code]?.name || code;

}


function getSpeechLanguage(code) {

    return languages[code]?.speech || "en-US";

}


/* ============================================
   11. SWAP LANGUAGES
   ============================================ */

elements.swapLanguages.addEventListener("click", () => {

    let source = elements.sourceLanguage.value;

    let target = elements.targetLanguage.value;

    if (source === "auto") {

        if (!lastDetectedLanguage) {

            showToast(
                "Translate your text first so the detected language can be used.",
                "info"
            );

            return;

        }

        source = lastDetectedLanguage;

    }

    if (source === target) {

        showToast(
            "Both languages are already the same.",
            "info"
        );

        return;

    }

    elements.sourceLanguage.value = target;

    elements.targetLanguage.value = source;

    const translated = elements.translatedText.textContent.trim();

    const original = elements.sourceText.value.trim();

    if (
        translated &&
        !elements.translatedText.querySelector(".output-placeholder") &&
        original
    ) {

        elements.sourceText.value = translated;

        elements.translatedText.textContent = original;

        currentTranslation = {
            sourceText: translated,
            translatedText: original,
            sourceLanguage: target,
            targetLanguage: source
        };

        elements.translationStatus.textContent = "Languages swapped";

        updateCharacterCount();

        updateFavoriteButton();

    }

    showToast("Languages swapped successfully!", "success");

});


/* ============================================
   12. TRANSLATION MESSAGE DISPLAY
   ============================================ */

function showTranslationMessage(message, type = "") {

    elements.translationMessage.textContent = message;

    elements.translationMessage.className = "message-area";

    if (type) {
        elements.translationMessage.classList.add(type);
    }

}


function setTranslationLoading(loading) {

    isTranslating = loading;

    elements.translateButton.disabled = loading;

    elements.translateButton.innerHTML = loading
        ? '<i class="fa-solid fa-spinner fa-spin"></i> Translating...'
        : '<i class="fa-solid fa-wand-magic-sparkles"></i> Translate Now';

    elements.translationStatus.textContent = loading
        ? "Translating..."
        : "Waiting for text";

}


/* ============================================
   13. REAL TRANSLATION API
   ============================================ */

async function translateText(text, source, target) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            q: text,

            source: source,

            target: target,

            format: "text"

        })

    });

    let data;

    try {

        data = await response.json();

    } catch (error) {

        throw new Error(
            "The translation server returned an invalid response."
        );

    }

    if (!response.ok) {

        throw new Error(
            data.error || `Translation failed. Server status: ${response.status}`
        );

    }

    if (!data.translatedText) {

        throw new Error(
            "The translation service did not return translated text."
        );

    }

    return data;

}


/* ============================================
   14. TRANSLATE BUTTON FUNCTION
   ============================================ */

async function handleTranslation() {

    if (isTranslating) {
        return;
    }

    const text = elements.sourceText.value.trim();

    const source = elements.sourceLanguage.value;

    const target = elements.targetLanguage.value;

    if (!text) {

        showTranslationMessage(
            "Please enter some text before translating.",
            "error"
        );

        showToast("Enter text to translate.", "error");

        elements.sourceText.focus();

        return;

    }

    if (source === target) {

        showTranslationMessage(
            "Source and target languages must be different.",
            "error"
        );

        return;

    }

    if (text.length > 5000) {

        showTranslationMessage(
            "Text cannot exceed 5000 characters.",
            "error"
        );

        return;

    }

    const requestNumber = ++translationRequestNumber;

    setTranslationLoading(true);

    showTranslationMessage(
        "Connecting to translation service...",
        "loading"
    );

    elements.translationStatus.textContent = "Processing...";

    try {

        const result = await translateText(
            text,
            source,
            target
        );

        if (requestNumber !== translationRequestNumber) {
            return;
        }

        const translated = result.translatedText;

        const detected = result.detectedLanguage?.language || null;

        if (source === "auto" && detected) {

            lastDetectedLanguage = detected;

        } else {

            lastDetectedLanguage = source;

        }

        elements.translatedText.textContent = translated;

        elements.translationStatus.textContent = "Translation complete";

        currentTranslation = {

            id: Date.now().toString(),

            sourceText: text,

            translatedText: translated,

            sourceLanguage: source === "auto"
                ? (detected || "auto")
                : source,

            targetLanguage: target,

            detectedLanguage: detected,

            date: new Date().toISOString()

        };

        saveToHistory(currentTranslation);

        updateFavoriteButton();

        showTranslationMessage(
            "Translation completed successfully!",
            "success"
        );

        showToast("Translation completed!", "success");

    } catch (error) {

        console.error("Translation error:", error);

        showTranslationMessage(
            error.message || "Unable to translate your text.",
            "error"
        );

        elements.translationStatus.textContent = "Translation failed";

        showToast(error.message || "Translation failed.", "error");

    } finally {

        if (requestNumber === translationRequestNumber) {

            setTranslationLoading(false);

        }

    }

}


elements.translateButton.addEventListener(
    "click",
    handleTranslation
);


/* ============================================
   15. CLEAR AND RESET TRANSLATOR
   ============================================ */

function clearTranslationOutput() {

    elements.translatedText.innerHTML =
        '<span class="output-placeholder">Your translated text will appear here...</span>';

    elements.translationStatus.textContent = "Waiting for text";

    currentTranslation = null;

    updateFavoriteButton();

}


elements.clearText.addEventListener("click", () => {

    elements.sourceText.value = "";

    updateCharacterCount();

    showTranslationMessage("");

    showToast("Input text cleared.", "success");

    elements.sourceText.focus();

});


elements.resetTranslator.addEventListener("click", () => {

    translationRequestNumber++;

    setTranslationLoading(false);

    elements.sourceText.value = "";

    elements.sourceLanguage.value = "auto";

    elements.targetLanguage.value = "hi";

    lastDetectedLanguage = null;

    clearTranslationOutput();

    showTranslationMessage("");

    updateCharacterCount();

    showToast("Translator has been reset.", "success");

});


/* ============================================
   16. COPY TRANSLATION
   ============================================ */

async function copyText(text) {

    if (!text) {

        showToast("There is no text to copy.", "error");

        return false;

    }

    try {

        if (navigator.clipboard && window.isSecureContext) {

            await navigator.clipboard.writeText(text);

        } else {

            const textArea = document.createElement("textarea");

            textArea.value = text;

            textArea.style.position = "fixed";
            textArea.style.opacity = "0";

            document.body.appendChild(textArea);

            textArea.select();

            const copied = document.execCommand("copy");

            textArea.remove();

            if (!copied) {
                throw new Error("Copy command failed.");
            }

        }

        showToast("Copied to clipboard!", "success");

        return true;

    } catch (error) {

        console.error("Copy error:", error);

        showToast("Unable to copy text.", "error");

        return false;

    }

}


elements.copyTranslation.addEventListener("click", () => {

    const text = elements.translatedText.textContent.trim();

    if (
        !text ||
        elements.translatedText.querySelector(".output-placeholder")
    ) {

        showToast("Translate something first.", "error");

        return;

    }

    copyText(text);

});


/* ============================================
   17. TEXT TO SPEECH
   ============================================ */

function speakText(text, languageCode) {

    if (!("speechSynthesis" in window)) {

        showToast(
            "Text-to-speech is not supported by this browser.",
            "error"
        );

        return;

    }

    if (!text || !text.trim()) {

        showToast("There is no text to read.", "error");

        return;

    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = getSpeechLanguage(languageCode);

    utterance.rate = 0.9;

    utterance.pitch = 1;

    const availableVoices = window.speechSynthesis.getVoices();

    const languagePrefix = utterance.lang.split("-")[0].toLowerCase();

    const matchingVoice = availableVoices.find(voice => {

        return voice.lang.toLowerCase().startsWith(languagePrefix);

    });

    if (matchingVoice) {

        utterance.voice = matchingVoice;

    }

    utterance.onstart = () => {

        isSpeaking = true;

    };

    utterance.onend = () => {

        isSpeaking = false;

    };

    utterance.onerror = (event) => {

        isSpeaking = false;

        if (event.error !== "canceled") {

            showToast(
                "Unable to play this language's speech.",
                "error"
            );

        }

    };

    window.speechSynthesis.speak(utterance);

}


elements.sourceSpeak.addEventListener("click", () => {

    const text = elements.sourceText.value.trim();

    const language = elements.sourceLanguage.value;

    if (language === "auto") {

        speakText(
            text,
            lastDetectedLanguage || "en"
        );

    } else {

        speakText(text, language);

    }

});


elements.speakTranslation.addEventListener("click", () => {

    if (!currentTranslation) {

        showToast("Translate something first.", "error");

        return;

    }

    speakText(
        elements.translatedText.textContent.trim(),
        elements.targetLanguage.value
    );

});


elements.speakVoiceTranslation.addEventListener("click", () => {

    const text = elements.voiceTranslatedText.textContent.trim();

    if (!text) {

        showToast("Translate your speech first.", "error");

        return;

    }

    speakText(
        text,
        elements.voiceTargetLanguage.value
    );

});


/* ============================================
   18. TRANSLATION HISTORY
   ============================================ */

function saveToHistory(translation) {

    let history = getHistory();

    history.unshift(translation);

    history = history.slice(0, MAX_HISTORY);

    if (saveStorageItem(STORAGE_KEYS.history, history)) {

        renderHistory();

    }

}


function renderHistory() {

    const history = getHistory();

    elements.historyList.innerHTML = "";

    if (history.length === 0) {

        elements.historyList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clock"></i>
                <h3>No Translation History</h3>
                <p>Your previous translations will appear here.</p>
            </div>
        `;

        return;

    }

    history.forEach(item => {

        const row = document.createElement("div");

        row.className = "history-item";

        const content = document.createElement("div");

        content.className = "history-content";

        const languagesText = document.createElement("div");

        languagesText.className = "history-languages";

        languagesText.textContent =
            `${getLanguageName(item.sourceLanguage)} → ${getLanguageName(item.targetLanguage)}`;

        const original = document.createElement("div");

        original.className = "history-original";

        original.textContent = item.sourceText;

        const translated = document.createElement("div");

        translated.className = "history-translated";

        translated.textContent = item.translatedText;

        const actions = document.createElement("div");

        actions.className = "history-actions";

        const copyButton = createActionButton(
            "fa-solid fa-copy",
            "Copy translation"
        );

        const favoriteButton = createActionButton(
            "fa-regular fa-heart",
            "Add to favorites"
        );

        const deleteButton = createActionButton(
            "fa-solid fa-trash",
            "Delete history item"
        );

        copyButton.addEventListener("click", () => {

            copyText(item.translatedText);

        });

        favoriteButton.addEventListener("click", () => {

            addFavorite(item);

        });

        deleteButton.addEventListener("click", () => {

            deleteHistoryItem(item.id);

        });

        content.appendChild(languagesText);
        content.appendChild(original);
        content.appendChild(translated);

        actions.appendChild(copyButton);
        actions.appendChild(favoriteButton);
        actions.appendChild(deleteButton);

        row.appendChild(content);
        row.appendChild(actions);

        elements.historyList.appendChild(row);

    });

}


function deleteHistoryItem(id) {

    const history = getHistory();

    const updatedHistory = history.filter(
        item => item.id !== id
    );

    saveStorageItem(
        STORAGE_KEYS.history,
        updatedHistory
    );

    renderHistory();

    showToast("History item deleted.", "success");

}


elements.clearHistory.addEventListener("click", () => {

    const history = getHistory();

    if (history.length === 0) {

        showToast("Your history is already empty.", "info");

        return;

    }

    const confirmed = confirm(
        "Are you sure you want to clear all translation history?"
    );

    if (!confirmed) {
        return;
    }

    saveStorageItem(STORAGE_KEYS.history, []);

    renderHistory();

    showToast("Translation history cleared.", "success");

});


/* ============================================
   19. FAVORITES
   ============================================ */

function isFavorite(id) {

    return getFavorites().some(item => item.id === id);

}


function addFavorite(translation) {

    if (!translation) {

        showToast("Translate something first.", "error");

        return;

    }

    const favorites = getFavorites();

    const exists = favorites.some(
        item => item.id === translation.id
    );

    if (exists) {

        showToast("Already in your favorites.", "info");

        return;

    }

    if (favorites.length >= MAX_FAVORITES) {

        showToast(
            "Maximum of 50 favorite translations reached.",
            "error"
        );

        return;

    }

    favorites.unshift(translation);

    if (saveStorageItem(STORAGE_KEYS.favorites, favorites)) {

        renderFavorites();

        updateFavoriteButton();

        showToast("Added to favorites!", "success");

    }

}


function removeFavorite(id) {

    const favorites = getFavorites();

    const updated = favorites.filter(
        item => item.id !== id
    );

    saveStorageItem(
        STORAGE_KEYS.favorites,
        updated
    );

    renderFavorites();

    updateFavoriteButton();

    showToast("Removed from favorites.", "success");

}


function renderFavorites() {

    const favorites = getFavorites();

    elements.favoritesList.innerHTML = "";

    elements.favoriteCount.textContent =
        `${favorites.length} Favorites`;

    if (favorites.length === 0) {

        elements.favoritesList.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-heart"></i>
                <h3>No Favorite Translations</h3>
                <p>Save your important translations using the heart button.</p>
            </div>
        `;

        return;

    }

    favorites.forEach(item => {

        const row = document.createElement("div");

        row.className = "favorite-item";

        const content = document.createElement("div");

        content.className = "favorite-content";

        const languagesText = document.createElement("div");

        languagesText.className = "favorite-languages";

        languagesText.textContent =
            `${getLanguageName(item.sourceLanguage)} → ${getLanguageName(item.targetLanguage)}`;

        const original = document.createElement("div");

        original.className = "favorite-original";

        original.textContent = item.sourceText;

        const translated = document.createElement("div");

        translated.className = "favorite-translated";

        translated.textContent = item.translatedText;

        const actions = document.createElement("div");

        actions.className = "favorite-actions";

        const copyButton = createActionButton(
            "fa-solid fa-copy",
            "Copy translation"
        );

        const speakButton = createActionButton(
            "fa-solid fa-volume-high",
            "Listen to translation"
        );

        const deleteButton = createActionButton(
            "fa-solid fa-heart-crack",
            "Remove favorite"
        );

        copyButton.addEventListener("click", () => {

            copyText(item.translatedText);

        });

        speakButton.addEventListener("click", () => {

            speakText(
                item.translatedText,
                item.targetLanguage
            );

        });

        deleteButton.addEventListener("click", () => {

            removeFavorite(item.id);

        });

        content.appendChild(languagesText);
        content.appendChild(original);
        content.appendChild(translated);

        actions.appendChild(copyButton);
        actions.appendChild(speakButton);
        actions.appendChild(deleteButton);

        row.appendChild(content);
        row.appendChild(actions);

        elements.favoritesList.appendChild(row);

    });

}


function updateFavoriteButton() {

    if (!currentTranslation) {

        elements.favoriteTranslation.innerHTML =
            '<i class="fa-regular fa-heart"></i>';

        elements.favoriteTranslation.classList.remove("is-favorite");

        return;

    }

    const saved = isFavorite(currentTranslation.id);

    elements.favoriteTranslation.innerHTML = saved
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>';

    elements.favoriteTranslation.classList.toggle(
        "is-favorite",
        saved
    );

}


elements.favoriteTranslation.addEventListener("click", () => {

    if (!currentTranslation) {

        showToast("Translate something first.", "error");

        return;

    }

    if (isFavorite(currentTranslation.id)) {

        removeFavorite(currentTranslation.id);

    } else {

        addFavorite(currentTranslation);

    }

});


/* ============================================
   20. REUSABLE ACTION BUTTON
   ============================================ */

function createActionButton(iconClass, title) {

    const button = document.createElement("button");

    button.type = "button";

    button.title = title;

    button.setAttribute("aria-label", title);

    const icon = document.createElement("i");

    icon.className = iconClass;

    button.appendChild(icon);

    return button;

}


/* ============================================
   21. LANGUAGE SEARCH
   ============================================ */

elements.languageSearch.addEventListener("input", () => {

    const searchValue = elements.languageSearch.value
        .trim()
        .toLowerCase();

    const cards = elements.languageGrid.querySelectorAll(
        ".language-card"
    );

    let visibleCount = 0;

    cards.forEach(card => {

        const language = card.dataset.language.toLowerCase();

        const matches = language.includes(searchValue);

        card.style.display = matches ? "flex" : "none";

        if (matches) {
            visibleCount++;
        }

    });

    elements.languageSearchEmpty.hidden = visibleCount > 0;

});


/* ============================================
   22. VOICE RECOGNITION INITIALIZATION
   ============================================ */

function initializeSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        elements.voiceStatus.textContent =
            "Speech Recognition Not Supported";

        elements.startRecording.disabled = true;

        elements.stopRecording.disabled = true;

        elements.voiceMessage.textContent =
            "Please use a supported browser such as Google Chrome to access voice recognition.";

        showVoiceMessage(
            "Your browser does not support speech recognition. Use Chrome or another supported browser.",
            "error"
        );

        return;

    }

    recognition = new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;


    recognition.onstart = () => {

        isRecording = true;

        elements.voiceStatus.textContent = "Listening...";

        elements.voiceAnimation.classList.add("recording");

        elements.startRecording.disabled = true;

        elements.stopRecording.disabled = false;

        showVoiceMessage("Listening to your speech...", "loading");

    };


    recognition.onresult = event => {

        let finalTranscript = "";

        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {

            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {

                finalTranscript += transcript;

            } else {

                interimTranscript += transcript;

            }

        }

        recognizedSpeech += finalTranscript;

        elements.recognizedText.textContent =
            recognizedSpeech + interimTranscript;

    };


    recognition.onerror = event => {

        console.error("Speech recognition error:", event.error);

        let message = "Voice recognition failed.";

        if (event.error === "not-allowed") {

            message = "Microphone permission denied. Allow microphone access in your browser.";

        } else if (event.error === "no-speech") {

            message = "No speech detected. Please try speaking again.";

        } else if (event.error === "network") {

            message = "Voice recognition requires an internet connection in this browser.";

        } else if (event.error === "audio-capture") {

            message = "No microphone was detected. Check your microphone connection.";

        } else if (event.error === "language-not-supported") {

            message = "The selected speech recognition language is not supported by your browser.";

        }

        showVoiceMessage(message, "error");

        elements.voiceStatus.textContent = "Recognition Error";

    };


    recognition.onend = () => {

        isRecording = false;

        elements.voiceAnimation.classList.remove("recording");

        elements.startRecording.disabled = false;

        elements.stopRecording.disabled = false;

        elements.voiceStatus.textContent =
            recognizedSpeech.trim()
                ? "Speech Recognized"
                : "Ready to Listen";

        if (recognizedSpeech.trim()) {

            showVoiceMessage(
                "Speech recognition completed. You can now translate your speech.",
                "success"
            );

        }

    };

}


/* ============================================
   23. VOICE MESSAGE DISPLAY
   ============================================ */

function showVoiceMessage(message, type = "") {

    elements.voiceMessage.textContent = message;

    elements.voiceMessage.className = "message-area";

    if (type) {

        elements.voiceMessage.classList.add(type);

    }

}


/* ============================================
   24. START VOICE RECORDING
   ============================================ */

elements.startRecording.addEventListener("click", () => {

    if (!recognition) {

        showVoiceMessage(
            "Speech recognition is unavailable in this browser.",
            "error"
        );

        return;

    }

    if (isRecording) {
        return;
    }

    recognizedSpeech = "";

    elements.recognizedText.textContent =
        "Listening...";

    elements.voiceTranslatedText.textContent =
        "Your translated speech will appear here.";

    elements.voiceMessage.textContent = "";

    recognition.lang = elements.voiceSourceLanguage.value;

    try {

        recognition.start();

    } catch (error) {

        console.error("Recording start error:", error);

        showVoiceMessage(
            "Unable to start recording. Please try again.",
            "error"
        );

    }

});


/* ============================================
   25. STOP VOICE RECORDING
   ============================================ */

elements.stopRecording.addEventListener("click", () => {

    if (recognition && isRecording) {

        recognition.stop();

        elements.voiceStatus.textContent = "Stopping...";

    }

});


/* ============================================
   26. TRANSLATE RECOGNIZED SPEECH
   ============================================ */

elements.translateVoiceText.addEventListener("click", async () => {

    const text = elements.recognizedText.textContent.trim();

    const sourceLocale = elements.voiceSourceLanguage.value;

    const source = sourceLocale.split("-")[0].toLowerCase();

    const target = elements.voiceTargetLanguage.value;

    if (!text || text === "Your recognized speech will appear here." || text === "Listening...") {

        showVoiceMessage(
            "Please record your speech first.",
            "error"
        );

        return;

    }

    if (source === target) {

        showVoiceMessage(
            "Choose different source and target languages.",
            "error"
        );

        return;

    }

    elements.translateVoiceText.disabled = true;

    elements.translateVoiceText.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Translating...';

    showVoiceMessage(
        "Translating your speech...",
        "loading"
    );

    try {

        const result = await translateText(
            text,
            source,
            target
        );

        elements.voiceTranslatedText.textContent =
            result.translatedText;

        showVoiceMessage(
            "Voice translation completed successfully!",
            "success"
        );

        const translation = {

            id: Date.now().toString(),

            sourceText: text,

            translatedText: result.translatedText,

            sourceLanguage: source,

            targetLanguage: target,

            date: new Date().toISOString()

        };

        saveToHistory(translation);

        showToast(
            "Voice translation completed!",
            "success"
        );

    } catch (error) {

        console.error("Voice translation error:", error);

        showVoiceMessage(
            error.message || "Unable to translate speech.",
            "error"
        );

    } finally {

        elements.translateVoiceText.disabled = false;

        elements.translateVoiceText.innerHTML =
            '<i class="fa-solid fa-language"></i> Translate Speech';

    }

});


/* ============================================
   27. CONTACT FORM
   ============================================ */

elements.contactForm.addEventListener("submit", event => {

    event.preventDefault();

    const name = document.getElementById("contactName").value.trim();

    const email = document.getElementById("contactEmail").value.trim();

    const subject = document.getElementById("contactSubject").value.trim();

    const message = document.getElementById("contactMessage").value.trim();

    if (!name || !email || !subject || !message) {

        showContactMessage(
            "Please fill in all the required fields.",
            "error"
        );

        return;

    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        showContactMessage(
            "Please enter a valid email address.",
            "error"
        );

        return;

    }

    showContactMessage(
        "Your form is valid! Email delivery is not configured yet.",
        "success"
    );

    showToast(
        "Contact form validated. No message was sent.",
        "info"
    );

});


function showContactMessage(message, type = "") {

    elements.contactMessageStatus.textContent = message;

    elements.contactMessageStatus.className = "message-area";

    if (type) {

        elements.contactMessageStatus.classList.add(type);

    }

}


/* ============================================
   28. UPDATE FOOTER YEAR
   ============================================ */

elements.currentYear.textContent =
    new Date().getFullYear();


/* ============================================
   29. INITIALIZE APPLICATION
   ============================================ */

function initializeApp() {

    initializeTheme();

    initializeActiveNavigation();

    initializeSpeechRecognition();

    renderHistory();

    renderFavorites();

    updateCharacterCount();

    updateFavoriteButton();

    showTranslationMessage("");

    if ("speechSynthesis" in window) {

        window.speechSynthesis.getVoices();

        window.speechSynthesis.onvoiceschanged = () => {

            window.speechSynthesis.getVoices();

        };

    }

    console.log(
        "LingoBridge initialized successfully!"
    );

}


/* ============================================
   30. START APPLICATION
   ============================================ */

document.addEventListener("DOMContentLoaded", initializeApp);
