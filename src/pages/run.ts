import { marked } from 'marked';
import {
  ApiTypes,
  createSession,
  createStream,
  DefaultTemperature,
  DefaultTopK,
  destroySession,
  RewriterFormats,
  RewriterLengths,
  RewriterTones,
  SummaryFormats,
  SummaryLengths,
  SummaryTypes,
  type AISession,
} from '../libs/ai.js';
import { getDocumentLanguage } from '../libs/get-document-language.js';
import {
  decodeText,
  getElementById,
  getValue,
  type HTMLInputNumberElement,
  type HTMLInputTextElement,
  scrollDown,
  setEditable,
  setEnabled,
  setValue,
  setVisible,
} from '../libs/html-utils.js';
import { insertText } from '../libs/insert-text.js';
import { setMarkdown } from '../libs/markdown.js';
import { defaultPrompt, getPrompt, type Prompt } from '../libs/prompts.js';
import { closeSidepanel } from '../libs/sidepanel.js';
import './style.css';
import { parsePromptMenuItem } from '../libs/context-menu.js';
import { selectText } from '../libs/select-text.js';

/**
 * Prompt
 */
const nameElement = getElementById<HTMLSpanElement>('name');
const errorElement = getElementById<HTMLDivElement>('error');
const promptTextInput = getElementById<HTMLSpanElement>('prompt');
const resultElement = getElementById<HTMLDivElement>('result');
const loadingElement = getElementById<HTMLDivElement>('loading');

/**
 * Buttons
 */
const submitBtn = getElementById<HTMLButtonElement>('submitBtn');
const resetBtn = getElementById<HTMLButtonElement>('resetBtn');
const closeBtn = getElementById<HTMLButtonElement>('closeBtn');
const copyBtn = getElementById<HTMLButtonElement>('copyBtn');
const cancelBtn = getElementById<HTMLButtonElement>('cancelBtn');
const insertBtn = getElementById<HTMLButtonElement>('insertBtn');

/**
 * Language model options
 */
const languageModelOptionsElement = getElementById<HTMLDivElement>('languageModelOptions');
const languageModelTopKInput = getElementById<HTMLInputTextElement>('languageModelTopK');
const languageModelTemperatureInput = getElementById<HTMLInputNumberElement>('languageModelTemperature');

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
submitBtn.addEventListener('click', submitPrompt);
resetBtn.addEventListener('click', resetPrompt);
closeBtn.addEventListener('click', closeSidepanel);
copyBtn.addEventListener('click', copy);
insertBtn.addEventListener('click', insert);
cancelBtn.addEventListener('click', cancelPrompt);

document.addEventListener('DOMContentLoaded', async () => {
  await loadPrompt();
});

/**
 * URL parameters
 */
const urlParams = new URLSearchParams(window.location.search);
const promptId = parsePromptMenuItem(urlParams.get('menuItemId') ?? '');
const tabId = Number(urlParams.get('tabId'));
const editable = urlParams.get('editable') === 'true';
const pageUrl = urlParams.get('pageUrl') || '';

let currentSession: AISession | undefined;
let currentPrompt: Prompt | undefined = undefined;

async function loadPrompt() {
  console.log('loadPrompt', { promptId });

  currentPrompt = promptId ? await getPrompt(promptId) : defaultPrompt();
  console.log('loadPrompt', { currentPrompt });

  if (!currentPrompt) {
    setVisible(errorElement, true);
    setValue(errorElement, `Prompt not found`);
    return;
  }

  setVisible(errorElement, false);
  setValue(nameElement, currentPrompt.name);

  const language = await getDocumentLanguage(tabId);

  // The selectionText from the context menu onclickdata collapses newlines to whitespaces
  // So we try to get the text from the page instead if possible
  let selectionText = await selectText(tabId);
  if (!selectionText) {
    selectionText = urlParams.get('selectionText') || '';
  }

  const replacements = {
    '{{selection}}': selectionText || '',
    '{{language}}': language || '',
    '{{url}}': pageUrl || '',
  };
  console.log('replacements', { replacements });

  let promptText = currentPrompt.prompt;

  for (const [variable, value] of Object.entries(replacements)) {
    promptText = promptText.replaceAll(variable, value);
  }

  if (!currentPrompt.prompt.includes('{{selection}}') && selectionText) {
    promptText = `${promptText}\n\n${selectionText}`;
  }

  setValue(promptTextInput, promptText);
  setVisible(summaryOptionsElement, currentPrompt.type === ApiTypes.SUMMARIZER);
  setVisible(languageModelOptionsElement, currentPrompt.type === ApiTypes.LANGUAGE_MODEL);
  setVisible(rewriterOptionsElement, currentPrompt.type === ApiTypes.REWRITER);
  if (currentPrompt.type === ApiTypes.SUMMARIZER) {
    setValue(summaryTypeInput, currentPrompt.options?.summarizer?.type || SummaryTypes.TLDR);
    setValue(summaryFormatInput, currentPrompt.options?.summarizer?.format || SummaryFormats.MARKDOWN);
    setValue(summaryLengthInput, currentPrompt.options?.summarizer?.length || SummaryLengths.SHORT);
  } else if (currentPrompt.type === ApiTypes.LANGUAGE_MODEL) {
    setValue(languageModelTemperatureInput, currentPrompt.options?.languageModel?.temperature || DefaultTemperature);
    setValue(languageModelTopKInput, currentPrompt.options?.languageModel?.topK || DefaultTopK);
  } else if (currentPrompt.type === ApiTypes.REWRITER) {
    setValue(rewriterToneInput, currentPrompt.options?.rewriter?.tone || RewriterTones.AS_IS);
    setValue(rewriterFormatInput, currentPrompt.options?.rewriter?.format || RewriterFormats.AS_IS);
    setValue(rewriterLengthInput, currentPrompt.options?.rewriter?.length || RewriterLengths.AS_IS);
  }

  setEditable(promptTextInput, true);

  if (currentPrompt.options?.autoSubmit) {
    await submitPrompt();
  }
}

async function submitPrompt() {
  console.log('submitPrompt');
  if (!currentPrompt) return;

  const prompt = getValue(promptTextInput);
  if (!prompt) {
    setVisible(errorElement, true);
    setValue(errorElement, 'Prompt is empty');
    return;
  }

  setValue(resultElement, '');

  setEnabled(submitBtn, false);
  setEnabled(resetBtn, false);
  setEditable(promptTextInput, false);

  setVisible(loadingElement, true);
  setVisible(errorElement, false);
  setVisible(insertBtn, false);
  setVisible(copyBtn, false);
  setVisible(cancelBtn, true);

  scrollDown();

  let options = {};
  if (currentPrompt?.type === ApiTypes.SUMMARIZER) {
    options = {
      type: getValue(summaryTypeInput),
      format: getValue(summaryFormatInput),
      length: getValue(summaryLengthInput),
    };
  } else if (currentPrompt.type === ApiTypes.LANGUAGE_MODEL) {
    options = {
      temperature: getValue(languageModelTemperatureInput),
      topK: getValue(languageModelTopKInput),
    };
  } else if (currentPrompt.type === ApiTypes.REWRITER) {
    options = {
      tone: getValue(rewriterToneInput),
      format: getValue(rewriterFormatInput),
      length: getValue(rewriterLengthInput),
    };
  }

  try {
    currentSession = await createSession(currentPrompt.type, options);
    console.log('currentSession', { currentSession });

    const stream = await createStream(currentSession, prompt);

    // @ts-ignore
    for await (const chunk of stream) {
      console.log({ chunk });
      setMarkdown(resultElement, chunk);
      scrollDown();
    }

    setVisible(loadingElement, false);
    setVisible(insertBtn, true);
    setVisible(copyBtn, true);
  } catch (e) {
    const error = e as Error;
    console.error('Error', { error });
    setValue(resultElement, `Error: ${error?.message ?? 'Unknown error'}`);
  } finally {
    destroySession(currentSession);
    currentSession = undefined;

    setEnabled(submitBtn, true);
    setEnabled(resetBtn, true);
    setEditable(promptTextInput, true);

    setVisible(loadingElement, false);
    setVisible(cancelBtn, false);
  }
}

function cancelPrompt() {
  destroySession(currentSession);
  currentSession = undefined;

  setValue(resultElement, 'Generation cancelled');

  setEnabled(submitBtn, true);
  setEnabled(resetBtn, true);

  setVisible(loadingElement, false);
  setVisible(insertBtn, false);
  setVisible(copyBtn, false);
  setVisible(cancelBtn, false);
}

function resetPrompt() {
  setValue(errorElement, '');
  setValue(promptTextInput, '');
  setValue(resultElement, '');

  setEditable(promptTextInput, true);

  setVisible(loadingElement, false);
  setVisible(errorElement, false);
  setVisible(insertBtn, false);
  setVisible(copyBtn, false);
  setVisible(cancelBtn, false);
}

async function copy() {
  await navigator.clipboard.writeText(getValue(resultElement));

  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = 'Copy';
  }, 2000);
}

async function insert() {
  const result = await insertText(tabId, getValue(resultElement));
  console.log('insertText', { result });

  if (result.success) {
    insertBtn.textContent = 'Inserted!';
    setTimeout(() => {
      insertBtn.textContent = 'Insert';
    }, 2000);
  } else {
    alert(result.error.message);
  }
}
