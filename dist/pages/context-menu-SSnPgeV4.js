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

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const ApiTypes = {
    SUMMARIZER: 'summarizer',
    LANGUAGE_MODEL: 'languageModel',
    WRITER: 'writer',
    REWRITER: 'rewriter',
};
const DefaultTopK = 8;
const DefaultTemperature = 0.7;
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
function getApi(type) {
    console.log('getApi', { type, ai: window.ai });
    return type in window.ai ? window.ai[type] : undefined;
}
function getCapabilities(type) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('getCapabilities', { type });
        const api = getApi(type);
        if (!api)
            throw new Error(`Unknown AI type: ${type}`);
        if ('capabilities' in api) {
            const capabilities = yield api.capabilities();
            console.log('capabilities', { capabilities });
            return capabilities;
        }
        return null;
    });
}
function createSession(type, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('createSession', { type, ai: window.ai });
        const monitor = (monitor) => {
            monitor.addEventListener('downloadprogress', (e) => {
                console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
        };
        const api = getApi(type);
        if (!api)
            throw new Error(`Unknown AI type: ${type}`);
        yield getCapabilities(type);
        // Bug: `self.ai.(re)writer.capabilities()` function went missing
        // https://issues.chromium.org/u/1/issues/380088820
        // if (!capabilities || capabilities.available === 'no') throw new Error(`AI type not available: ${type}`);
        if (type === ApiTypes.REWRITER) {
            // Bug: Writer and Rewriter APIs depend on `sharedContext` to be filled
            // https://issues.chromium.org/u/1/issues/380058928?pli=1
            options.sharedContext = `email to hannah`; // dummy value
        }
        console.log('createSession', { options });
        return api.create(Object.assign(Object.assign({}, options), { monitor }));
    });
}
function destroySession(session) {
    session === null || session === void 0 ? void 0 : session.destroy();
}
function createStream(session, input) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('createStream', { session, input });
        if ('summarizeStreaming' in session) {
            return session.summarizeStreaming(input);
        }
        if ('writeStreaming' in session) {
            return session.writeStreaming(input);
        }
        if ('rewriteStreaming' in session) {
            return session.rewriteStreaming(input);
        }
        if ('promptStreaming' in session) {
            return session.promptStreaming(input);
        }
        throw new Error('No streaming method found');
    });
}

function getElementById(id) {
    const element = document.getElementById(id);
    if (!element)
        throw new Error(`Element ${id} not found`);
    return element;
}
function setValue(element, value) {
    if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox') {
            element.checked = Boolean(value);
        }
        else if (element.type === 'number') {
            element.value = String(value);
        }
        else {
            element.value = String(value);
        }
        return;
    }
    if (element instanceof HTMLSelectElement) {
        element.value = String(value);
        return;
    }
    if (element.isContentEditable) {
        console.log('isContentEditable', { element, value });
        // Convert \n to <br> for contentEditable elements
        element.innerHTML = String(value).replace(/\n/g, '<br>').trim();
    }
    else {
        element.textContent = String(value).trim();
    }
}
function getValue(element) {
    var _a, _b;
    if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox')
            return Boolean(element.checked);
        if (element.type === 'number')
            return Number(element.value.trim());
        return element.value.trim();
    }
    if (element instanceof HTMLSelectElement) {
        return element.value;
    }
    if (element.isContentEditable) {
        // Convert <br> back to \n for contentEditable elements
        return element.innerHTML
            .replace(/<br\s*\/?>/gi, '\n') // Convert <br>, <br/>, <br /> to \n
            .trim();
    }
    return (_b = (_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
}
function setEditable(element, editable) {
    element.contentEditable = editable ? 'true' : 'false';
}
function setVisible(element, visible) {
    visible ? element.removeAttribute('hidden') : element.setAttribute('hidden', '');
}
function setEnabled(element, enabled) {
    element.disabled = !enabled;
}
function goto(path) {
    window.location.href = path;
}
function scrollDown() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function defaultPrompt() {
    return {
        id: 'default',
        name: 'Prompt This',
        prompt: '{{selection}}',
        type: ApiTypes.LANGUAGE_MODEL,
        options: { autoSubmit: false },
        conditions: {},
    };
}
function getPrompts() {
    return __awaiter(this, void 0, void 0, function* () {
        const { prompts = [] } = yield chrome.storage.local.get('prompts');
        return prompts;
    });
}
function getPrompt(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompts = yield getPrompts();
        return prompts.find((p) => p.id === id);
    });
}
function setPrompt(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompts = yield getPrompts();
        const index = prompts.findIndex((p) => p.id === prompt.id);
        if (index === -1) {
            prompts.push(prompt);
        }
        else {
            prompts[index] = prompt;
        }
        yield chrome.storage.local.set({ prompts });
    });
}
function unsetPrompt(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompts = yield getPrompts();
        const index = prompts.findIndex((p) => p.id === id);
        if (index !== -1) {
            prompts.splice(index, 1);
        }
        yield chrome.storage.local.set({ prompts });
    });
}

function requestUpdateContextMenu() {
    chrome.runtime.sendMessage({ action: 'updateContextMenu' });
}
function parsePromptMenuItem(menuItemId) {
    if (!menuItemId)
        throw new Error('Invalid menu item ID');
    const promptId = menuItemId.split('/').pop();
    return promptId;
}

export { ApiTypes as A, DefaultTemperature as D, RewriterTones as R, SummaryTypes as S, __awaiter as _, setEnabled as a, setVisible as b, setEditable as c, getPrompt as d, defaultPrompt as e, SummaryFormats as f, getElementById as g, SummaryLengths as h, DefaultTopK as i, RewriterFormats as j, RewriterLengths as k, getValue as l, scrollDown as m, createSession as n, createStream as o, parsePromptMenuItem as p, __asyncValues as q, destroySession as r, setValue as s, goto as t, setPrompt as u, requestUpdateContextMenu as v, getPrompts as w, unsetPrompt as x };
//# sourceMappingURL=context-menu-SSnPgeV4.js.map
