import { g as getElementById, t as goto, l as getValue, b as setVisible, s as setValue, _ as __awaiter, A as ApiTypes, d as getPrompt, S as SummaryTypes, f as SummaryFormats, h as SummaryLengths, R as RewriterTones, j as RewriterFormats, k as RewriterLengths, u as setPrompt, v as requestUpdateContextMenu } from './context-menu-SSnPgeV4.js';
import { c as closeSidepanel } from './sidepanel-58eTr2jr.js';

/**
 * Prompt
 */
const nameInput = getElementById('name');
const errorElement = getElementById('error');
const promptInput = getElementById('prompt');
/**
 * Buttons
 */
const saveBtn = getElementById('saveBtn');
const cancelBtn = getElementById('cancelBtn');
const pageTitle = getElementById('pageTitle');
const closeBtn = getElementById('closeBtn');
/**
 * Conditions
 */
const urlInput = getElementById('url');
const languageInput = getElementById('language');
const hasSelectionInput = getElementById('hasSelection');
/**
 * Options
 */
const autoSubmitInput = getElementById('autoSubmit');
const typeInput = getElementById('type');
/**
 * Language model options
 */
const languageModelOptionsElement = getElementById('languageModelOptions');
const languageModelTopKInput = getElementById('topK');
const languageModelTopKValue = getElementById('topKValue');
const languageModelTemperatureInput = getElementById('temperature');
const languageModelTemperatureValue = getElementById('temperatureValue');
/**
 * Summary options
 */
const summaryOptionsElement = getElementById('summaryOptions');
const summaryTypeInput = getElementById('summaryType');
const summaryFormatInput = getElementById('summaryFormat');
const summaryLengthInput = getElementById('summaryLength');
/**
 * Rewriter options
 */
const rewriterOptionsElement = getElementById('rewriterOptions');
const rewriterToneInput = getElementById('rewriterTone');
const rewriterFormatInput = getElementById('rewriterFormat');
const rewriterLengthInput = getElementById('rewriterLength');
/**
 * Event listeners
 */
saveBtn.addEventListener('click', savePrompt);
cancelBtn.addEventListener('click', () => goto('list.html'));
closeBtn.addEventListener('click', closeSidepanel);
typeInput.addEventListener('change', () => {
    const type = getValue(typeInput);
    console.log('typeInput.change', { type });
    setVisible(languageModelOptionsElement, type === ApiTypes.LANGUAGE_MODEL);
    setVisible(summaryOptionsElement, type === ApiTypes.SUMMARIZER);
    setVisible(rewriterOptionsElement, type === ApiTypes.REWRITER);
});
languageModelTopKInput.addEventListener('input', () => {
    const value = getValue(languageModelTopKInput);
    setValue(languageModelTopKValue, value);
});
languageModelTemperatureInput.addEventListener('input', () => {
    const value = getValue(languageModelTemperatureInput);
    setValue(languageModelTemperatureValue, value);
});
const urlParams = new URLSearchParams(window.location.search);
const promptId = urlParams.get('id');
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    if (promptId) {
        document.title = 'Edit Prompt';
        setValue(pageTitle, 'Edit Prompt');
        setValue(saveBtn, 'Save');
        loadPrompt(promptId);
    }
    else {
        document.title = 'Add Prompt';
        setValue(pageTitle, 'Add Prompt');
        setValue(saveBtn, 'Save');
    }
}));
function loadPrompt(id) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = yield getPrompt(id);
        if (!prompt) {
            setVisible(errorElement, true);
            setValue(errorElement, `Prompt not found: ${id}`);
            return;
        }
        setValue(nameInput, prompt.name);
        setValue(promptInput, prompt.prompt);
        setValue(urlInput, prompt.conditions.url || '');
        setValue(languageInput, prompt.conditions.language || '');
        setValue(hasSelectionInput, prompt.conditions.hasSelection || false);
        setValue(autoSubmitInput, ((_a = prompt.options) === null || _a === void 0 ? void 0 : _a.autoSubmit) || false);
        setValue(typeInput, prompt.type || ApiTypes.LANGUAGE_MODEL);
        if (prompt.type === ApiTypes.LANGUAGE_MODEL) {
            setValue(languageModelTopKInput, ((_c = (_b = prompt.options) === null || _b === void 0 ? void 0 : _b.languageModel) === null || _c === void 0 ? void 0 : _c.topK) || 4);
            setValue(languageModelTemperatureInput, ((_e = (_d = prompt.options) === null || _d === void 0 ? void 0 : _d.languageModel) === null || _e === void 0 ? void 0 : _e.temperature) || 0.7);
        }
        else if (prompt.type === ApiTypes.SUMMARIZER) {
            setValue(summaryTypeInput, ((_g = (_f = prompt.options) === null || _f === void 0 ? void 0 : _f.summarizer) === null || _g === void 0 ? void 0 : _g.type) || SummaryTypes.TLDR);
            setValue(summaryFormatInput, ((_j = (_h = prompt.options) === null || _h === void 0 ? void 0 : _h.summarizer) === null || _j === void 0 ? void 0 : _j.format) || SummaryFormats.PLAIN_TEXT);
            setValue(summaryLengthInput, ((_l = (_k = prompt.options) === null || _k === void 0 ? void 0 : _k.summarizer) === null || _l === void 0 ? void 0 : _l.length) || SummaryLengths.MEDIUM);
        }
        else if (prompt.type === ApiTypes.REWRITER) {
            setValue(rewriterToneInput, ((_o = (_m = prompt.options) === null || _m === void 0 ? void 0 : _m.rewriter) === null || _o === void 0 ? void 0 : _o.tone) || RewriterTones.AS_IS);
            setValue(rewriterFormatInput, ((_q = (_p = prompt.options) === null || _p === void 0 ? void 0 : _p.rewriter) === null || _q === void 0 ? void 0 : _q.format) || RewriterFormats.PLAIN_TEXT);
            setValue(rewriterLengthInput, ((_s = (_r = prompt.options) === null || _r === void 0 ? void 0 : _r.rewriter) === null || _s === void 0 ? void 0 : _s.length) || RewriterLengths.AS_IS);
        }
        setVisible(languageModelOptionsElement, prompt.type === ApiTypes.LANGUAGE_MODEL);
        setVisible(summaryOptionsElement, prompt.type === ApiTypes.SUMMARIZER);
        setVisible(rewriterOptionsElement, prompt.type === ApiTypes.REWRITER);
    });
}
function savePrompt() {
    return __awaiter(this, void 0, void 0, function* () {
        const id = promptId || Date.now().toString();
        const name = getValue(nameInput).trim();
        if (!name) {
            setVisible(errorElement, true);
            setValue(errorElement, 'Name is required');
            return;
        }
        const text = getValue(promptInput).trim();
        if (!text) {
            setVisible(errorElement, true);
            setValue(errorElement, 'Prompt is required');
            return;
        }
        const type = getValue(typeInput);
        if (!type) {
            setVisible(errorElement, true);
            setValue(errorElement, 'Type is required');
            return;
        }
        const url = getValue(urlInput).trim();
        if (url && !isValidPattern(url)) {
            setVisible(errorElement, true);
            setValue(errorElement, 'Invalid URL pattern');
            return;
        }
        const language = getValue(languageInput).trim();
        if (language && !isValidPattern(language)) {
            setVisible(errorElement, true);
            setValue(errorElement, 'Invalid language pattern');
            return;
        }
        const hasSelection = Boolean(getValue(hasSelectionInput));
        const autoSubmit = Boolean(getValue(autoSubmitInput));
        let typeOptions = {};
        if (type === ApiTypes.LANGUAGE_MODEL) {
            typeOptions = {
                topK: getValue(languageModelTopKInput),
                temperature: getValue(languageModelTemperatureInput),
            };
        }
        else if (type === ApiTypes.SUMMARIZER) {
            typeOptions = {
                type: getValue(summaryTypeInput),
                format: getValue(summaryFormatInput),
                length: getValue(summaryLengthInput),
            };
        }
        else if (type === ApiTypes.REWRITER) {
            typeOptions = {
                tone: getValue(rewriterToneInput),
                format: getValue(rewriterFormatInput),
                length: getValue(rewriterLengthInput),
            };
        }
        setVisible(errorElement, false);
        const prompt = {
            id,
            name,
            prompt: text,
            type,
            conditions: {
                url,
                language,
                hasSelection,
            },
            options: {
                autoSubmit,
                [type]: typeOptions,
            },
        };
        yield setPrompt(prompt);
        requestUpdateContextMenu();
        goto('list.html');
    });
}
function isValidPattern(pattern) {
    if ((pattern === null || pattern === void 0 ? void 0 : pattern.startsWith('/')) && pattern.endsWith('/')) {
        try {
            new RegExp(pattern.slice(1, -1));
            return true;
        }
        catch (error) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=edit.js.map
