/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function getDocumentLanguage(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("getDocumentLanguage", { tabId });
        if (!tabId)
            return undefined;
        const [{ result }] = yield chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                var _a, _b;
                return (document.documentElement.lang ||
                    ((_a = document
                        .querySelector('meta[property="og:locale"]')) === null || _a === void 0 ? void 0 : _a.getAttribute("content")) ||
                    ((_b = document.querySelector("html")) === null || _b === void 0 ? void 0 : _b.getAttribute("lang")) ||
                    navigator.language);
            },
        });
        console.log("getDocumentLanguage:result", { result });
        return result;
    });
}

const ApiTypes = {
    SUMMARIZER: 'summarizer',
    LANGUAGE_MODEL: 'languageModel',
    WRITER: 'writer',
    REWRITER: 'rewriter',
};
const SummaryTypes = {
    TLDR: 'tl;dr',
    KEY_POINTS: 'key-points',
    TEASER: 'teaser',
    HEADLINE: 'headline',
};
const SummaryFormats = {
    MARKDOWN: 'markdown',
    PLAIN_TEXT: 'plain-text',
};
const SummaryLengths = {
    SHORT: 'short',
    MEDIUM: 'medium',
    LONG: 'long',
};
const RewriterTones = {
    AS_IS: 'as-is',
    MORE_FORMAL: 'more-formal',
    MORE_CASUAL: 'more-casual',
};
const RewriterFormats = {
    AS_IS: 'as-is',
    MARKDOWN: 'markdown',
    PLAIN_TEXT: 'plain-text',
};
const RewriterLengths = {
    AS_IS: 'as-is',
    SHORTER: 'shorter',
    LONGER: 'longer',
};

function initDefaultPrompts() {
    console.log('initDefaultPrompts');
    const defaultPrompts = [
        {
            id: 'correct',
            name: 'Correct This Text',
            type: ApiTypes.LANGUAGE_MODEL,
            prompt: 'Correct this text for grammar and spelling mistakes:\n\n{{selection}}',
            options: {},
            conditions: {
                hasSelection: true,
            },
        },
        {
            id: 'rewrite',
            name: 'Rewrite This Email',
            type: ApiTypes.LANGUAGE_MODEL,
            prompt: 'Rewrite this email in a formal tone:\n\n{{selection}}',
            options: {},
            conditions: {
                url: 'mail.google.com',
                hasSelection: true,
            },
        },
        {
            id: 'summarize',
            name: 'Summarize This Article',
            type: ApiTypes.SUMMARIZER,
            prompt: 'Summarize this text:\n\n{{selection}}',
            options: {
                summarizer: {
                    type: SummaryTypes.KEY_POINTS,
                    length: SummaryLengths.SHORT,
                    format: SummaryFormats.MARKDOWN,
                },
            },
            conditions: {
                hasSelection: true,
            },
        },
        {
            id: 'explain',
            name: 'Explain This Word',
            type: ApiTypes.LANGUAGE_MODEL,
            prompt: 'Explain this word in English:\n\n{{selection}}',
            options: {
                autoSubmit: true,
            },
            conditions: {
                language: '/^en/',
                hasSelection: true,
            },
        },
        {
            id: 'shorten',
            name: 'Shorten This Tweet ',
            type: ApiTypes.REWRITER,
            prompt: 'Shorten this tweet to 300 characters or less:\n\n{{selection}}',
            options: {
                rewriter: {
                    tone: RewriterTones.AS_IS,
                    format: RewriterFormats.AS_IS,
                    length: RewriterLengths.SHORTER,
                },
            },
            conditions: {
                url: '/x\\.com|bsky\\.app/',
                hasSelection: true,
            },
        },
    ];
    chrome.storage.local.set({ prompts: defaultPrompts }, () => {
        console.log('Default prompts initialized');
    });
}
function getPrompts() {
    return __awaiter(this, void 0, void 0, function* () {
        const { prompts = [] } = yield chrome.storage.local.get('prompts');
        return prompts;
    });
}

const MenuItemIds = {
    ROOT: '/',
    ADD: '/add',
    RUN: '/run',
};
function updateContextMenu(tab) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentUrl = (tab === null || tab === void 0 ? void 0 : tab.url) || '';
        const prompts = yield getPrompts();
        try {
            chrome.contextMenus.removeAll(() => __awaiter(this, void 0, void 0, function* () {
                console.log('updateContextMenus', { prompts, currentUrl });
                const items = [];
                for (const prompt of prompts) {
                    const contexts = yield getPromptContexts(prompt, tab);
                    if (contexts) {
                        items.push({
                            id: formatPromptMenuItem(prompt.id),
                            title: prompt.name,
                            parentId: MenuItemIds.ROOT,
                            contexts: contexts,
                        });
                    }
                }
                chrome.contextMenus.create({
                    id: MenuItemIds.ROOT,
                    title: 'PromptThis.AI',
                    contexts: ['all'],
                });
                items.forEach((item) => chrome.contextMenus.create(item));
                if (items.length) {
                    chrome.contextMenus.create({
                        id: 'separator1',
                        type: 'separator',
                        parentId: MenuItemIds.ROOT,
                        contexts: ['all'],
                    });
                }
                chrome.contextMenus.create({
                    id: `${MenuItemIds.RUN}/`,
                    title: 'Prompt This',
                    parentId: MenuItemIds.ROOT,
                    contexts: ['all'],
                });
                chrome.contextMenus.create({
                    id: MenuItemIds.ADD,
                    title: 'Add Prompt',
                    parentId: MenuItemIds.ROOT,
                    contexts: ['all'],
                });
            }));
        }
        catch (error) {
            console.error('Error updating context menu:', error);
        }
    });
}
function formatPromptMenuItem(promptId) {
    return `${MenuItemIds.RUN}/${promptId}`;
}
function matchesPattern(value, pattern) {
    if (!pattern)
        return true;
    if (!value)
        return false;
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
        try {
            const regex = new RegExp(pattern.slice(1, -1));
            return regex.test(value);
        }
        catch (error) {
            console.error('Invalid regex pattern', { error });
            return false;
        }
    }
    return value.includes(pattern);
}
function getPromptContexts(prompt, tab) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (prompt.conditions.url) {
                if (!matchesPattern(tab.url, prompt.conditions.url))
                    return undefined;
            }
            if (prompt.conditions.language && tab.url && !tab.url.startsWith('chrome://')) {
                const documentLang = yield getDocumentLanguage(tab.id);
                if (!matchesPattern(documentLang === null || documentLang === void 0 ? void 0 : documentLang.toLowerCase(), prompt.conditions.language.toLowerCase()))
                    return undefined;
            }
            if (prompt.conditions.hasSelection)
                return ['selection'];
            return ['all'];
        }
        catch (error) {
            console.error('Error', { error });
            return undefined;
        }
    });
}

function resetSidepanel(tab) {
    console.log("resetSidepanel", { tab });
    const id = tab.id ? { tabId: tab.id } : { windowId: tab.windowId };
    chrome.sidePanel.setOptions(Object.assign({ path: "pages/list.html", enabled: true }, id));
}
// https://github.com/GoogleChrome/chrome-extensions-samples/issues/987#issuecomment-2450848264
function openSidePanel(tab, path) {
    console.log("openSidePanel", { path, tab });
    const id = tab.id ? { tabId: tab.id } : { windowId: tab.windowId };
    chrome.sidePanel.setOptions(Object.assign({ path, enabled: true }, id), () => {
        chrome.sidePanel.open(id);
    });
}

function getActiveTab() {
    return __awaiter(this, void 0, void 0, function* () {
        const [tab] = yield chrome.tabs.query({
            active: true,
            lastFocusedWindow: true,
        });
        return tab;
    });
}
function getTab(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tab = yield chrome.tabs.get(tabId);
        return tab;
    });
}

/**
 * Open settings page when extension icon is clicked.
 */
chrome.action.onClicked.addListener((tab) => {
    console.log('action.onClicked', { tab });
    openSidePanel(tab, 'pages/list.html');
});
/**
 * Initialize default prompts and update context menu.
 */
chrome.runtime.onInstalled.addListener((info) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('runtime.onInstalled', { info });
    // Initialize default prompts on first install
    if (info.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        initDefaultPrompts();
    }
    const tab = yield getActiveTab();
    yield updateContextMenu(tab);
}));
/**
 * Update context menu on message.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.action === 'updateContextMenu') {
        console.log('updateContextMenu', { request });
        const tab = yield getActiveTab();
        yield updateContextMenu(tab);
    }
}));
/**
 * Reset sidepanel on message.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => __awaiter(void 0, void 0, void 0, function* () {
    if (request.action === 'resetSidepanel') {
        console.log('resetSidepanel', { request });
        const tab = yield getActiveTab();
        resetSidepanel(tab);
        sendResponse();
    }
}));
/**
 * Update context menus when a tab is activated.
 */
chrome.tabs.onActivated.addListener((activeInfo) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('tabs.onActivated', { activeInfo });
    const tab = yield getTab(activeInfo.tabId);
    yield updateContextMenu(tab);
}));
/**
 * Update context menus when a tab is updated.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('tabs.onUpdated', { tabId, changeInfo, tab });
    if (changeInfo.status === 'complete') {
        yield updateContextMenu(tab);
    }
}));
/**
 * Handle context menu item clicks
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log('contextMenus.onClicked', { info, tab });
    /**
     * NOTE:
     * Handler cannot be async because of this bug:
     * https://stackoverflow.com/a/77213912/1967693
     */
    const tabId = tab === null || tab === void 0 ? void 0 : tab.id;
    if (!tabId)
        return;
    const menuItemId = String(info.menuItemId);
    if (menuItemId === MenuItemIds.ADD) {
        addPrompt(tab);
        return;
    }
    if (menuItemId.startsWith(MenuItemIds.RUN)) {
        runPrompt(tab, info);
        return;
    }
});
/**
 * Open the edit prompt page.
 */
function addPrompt(tab) {
    console.log('addPrompt', { tab });
    openSidePanel(tab, 'pages/edit.html');
}
/**
 * Open the run prompt page.
 */
function runPrompt(tab, info) {
    var _a, _b, _c, _d;
    console.log('runPrompt', { tab, info });
    const params = new URLSearchParams(Object.entries(info));
    params.set('tabId', (_b = (_a = tab.id) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '');
    params.set('windowId', (_d = (_c = tab.windowId) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '');
    openSidePanel(tab, `pages/run.html?${params.toString()}`);
}
//# sourceMappingURL=background.js.map
