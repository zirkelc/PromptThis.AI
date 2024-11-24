import {
  type ApiType,
  ApiTypes,
  RewriterFormats,
  RewriterLengths,
  RewriterTones,
  SummaryFormats,
  SummaryLengths,
  SummaryTypes,
} from '../libs/ai.js';
import { requestUpdateContextMenu } from '../libs/context-menu.js';
import {
  getElementById,
  getValue,
  goto,
  type HTMLInputCheckboxElement,
  type HTMLInputNumberElement,
  type HTMLInputTextElement,
  setValue,
  setVisible,
} from '../libs/html-utils.js';
import { getPrompt, setPrompt } from '../libs/prompts.js';
import { closeSidepanel } from '../libs/sidepanel.js';
import './style.css';

/**
 * Prompt
 */
const nameInput = getElementById<HTMLInputTextElement>('name');
const errorElement = getElementById<HTMLDivElement>('error');
const promptInput = getElementById<HTMLSpanElement>('prompt');

/**
 * Buttons
 */
const saveBtn = getElementById<HTMLButtonElement>('saveBtn');
const cancelBtn = getElementById<HTMLButtonElement>('cancelBtn');
const pageTitle = getElementById<HTMLHeadingElement>('pageTitle');
const closeBtn = getElementById<HTMLButtonElement>('closeBtn');

/**
 * Conditions
 */
const urlInput = getElementById<HTMLInputTextElement>('url');
const languageInput = getElementById<HTMLInputTextElement>('language');
const hasSelectionInput = getElementById<HTMLInputCheckboxElement>('hasSelection');
/**
 * Options
 */
const autoSubmitInput = getElementById<HTMLInputElement>('autoSubmit');
const typeInput = getElementById<HTMLSelectElement>('type');

/**
 * Language model options
 */
const languageModelOptionsElement = getElementById<HTMLDivElement>('languageModelOptions');
const languageModelTopKInput = getElementById<HTMLInputNumberElement>('topK');
const languageModelTopKValue = getElementById<HTMLSpanElement>('topKValue');
const languageModelTemperatureInput = getElementById<HTMLInputNumberElement>('temperature');
const languageModelTemperatureValue = getElementById<HTMLSpanElement>('temperatureValue');

/**
 * Summary options
 */
const summaryOptionsElement = getElementById<HTMLDivElement>('summaryOptions');
const summaryTypeInput = getElementById<HTMLSelectElement>('summaryType');
const summaryFormatInput = getElementById<HTMLSelectElement>('summaryFormat');
const summaryLengthInput = getElementById<HTMLSelectElement>('summaryLength');

/**
 * Rewriter options
 */
const rewriterOptionsElement = getElementById<HTMLDivElement>('rewriterOptions');
const rewriterToneInput = getElementById<HTMLSelectElement>('rewriterTone');
const rewriterFormatInput = getElementById<HTMLSelectElement>('rewriterFormat');
const rewriterLengthInput = getElementById<HTMLSelectElement>('rewriterLength');

/**
 * Event listeners
 */
saveBtn.addEventListener('click', savePrompt);
cancelBtn.addEventListener('click', () => goto('list.html'));
closeBtn.addEventListener('click', closeSidepanel);

typeInput.addEventListener('change', () => {
  const type = getValue(typeInput);

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

document.addEventListener('DOMContentLoaded', async () => {
  if (promptId) {
    document.title = 'Edit Prompt';
    setValue(pageTitle, 'Edit Prompt');
    setValue(saveBtn, 'Save');

    loadPrompt(promptId);
  } else {
    document.title = 'Add Prompt';
    setValue(pageTitle, 'Add Prompt');
    setValue(saveBtn, 'Save');
  }
});

async function loadPrompt(id: string) {
  const prompt = await getPrompt(id);
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
  setValue(autoSubmitInput, prompt.options?.autoSubmit || false);
  setValue(typeInput, prompt.type || ApiTypes.LANGUAGE_MODEL);

  if (prompt.type === ApiTypes.LANGUAGE_MODEL) {
    setValue(languageModelTopKInput, prompt.options?.languageModel?.topK || 4);
    setValue(languageModelTemperatureInput, prompt.options?.languageModel?.temperature || 0.7);
  } else if (prompt.type === ApiTypes.SUMMARIZER) {
    setValue(summaryTypeInput, prompt.options?.summarizer?.type || SummaryTypes.TLDR);
    setValue(summaryFormatInput, prompt.options?.summarizer?.format || SummaryFormats.PLAIN_TEXT);
    setValue(summaryLengthInput, prompt.options?.summarizer?.length || SummaryLengths.MEDIUM);
  } else if (prompt.type === ApiTypes.REWRITER) {
    setValue(rewriterToneInput, prompt.options?.rewriter?.tone || RewriterTones.AS_IS);
    setValue(rewriterFormatInput, prompt.options?.rewriter?.format || RewriterFormats.PLAIN_TEXT);
    setValue(rewriterLengthInput, prompt.options?.rewriter?.length || RewriterLengths.AS_IS);
  }

  setVisible(languageModelOptionsElement, prompt.type === ApiTypes.LANGUAGE_MODEL);
  setVisible(summaryOptionsElement, prompt.type === ApiTypes.SUMMARIZER);
  setVisible(rewriterOptionsElement, prompt.type === ApiTypes.REWRITER);
}

async function savePrompt() {
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

  const type = getValue(typeInput) as ApiType;
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
  } else if (type === ApiTypes.SUMMARIZER) {
    typeOptions = {
      type: getValue(summaryTypeInput),
      format: getValue(summaryFormatInput),
      length: getValue(summaryLengthInput),
    };
  } else if (type === ApiTypes.REWRITER) {
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

  await setPrompt(prompt);
  requestUpdateContextMenu();

  goto('list.html');
}

function isValidPattern(pattern: string): boolean {
  if (pattern?.startsWith('/') && pattern.endsWith('/')) {
    try {
      new RegExp(pattern.slice(1, -1));
      return true;
    } catch (error) {
      return false;
    }
  }

  return true;
}
