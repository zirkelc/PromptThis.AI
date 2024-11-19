import {
  type ApiType,
  ApiTypes,
  type LanguageModelOptions,
  type SummarizerOptions,
  SummaryFormats,
  SummaryLengths,
  SummaryTypes,
} from './ai.js';

export type Prompt = {
  id: string;
  name: string;
  type: ApiType;
  prompt: string;
  conditions: {
    url?: string;
    language?: string;
    hasSelection?: boolean;
  };
  options: {
    autoSubmit?: boolean;
    [ApiTypes.LANGUAGE_MODEL]?: LanguageModelOptions;
    [ApiTypes.SUMMARIZER]?: SummarizerOptions;
  };
};

export function initDefaultPrompts() {
  console.log('initDefaultPrompts');

  const defaultPrompts: Array<Prompt> = [
    {
      id: 'rewrite',
      name: 'Rewrite This',
      type: ApiTypes.LANGUAGE_MODEL,
      prompt: 'Rewrite this email in a formal tone:\n\n{{selection}}',
      options: {},
      conditions: {
        url: 'gmail.google.com',
      },
    },
    {
      id: 'summarize',
      name: 'Summarize This',
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
      name: 'Explain This',
      type: ApiTypes.LANGUAGE_MODEL,
      prompt: 'Explain this word in English:\n\n{{selection}}',
      options: {
        autoSubmit: true,
      },
      conditions: {
        language: '/^(?!en).*$/', // doesn't start with 'en'
        hasSelection: true,
      },
    },
  ];

  chrome.storage.local.set({ prompts: defaultPrompts }, () => {
    console.log('Default prompts initialized');
  });
}

export function defaultPrompt(): Prompt {
  return {
    id: 'default',
    name: 'Prompt This',
    prompt: '{{selection}}',
    type: ApiTypes.LANGUAGE_MODEL,
    options: { autoSubmit: false },
    conditions: {},
  };
}

export async function getPrompts(): Promise<Prompt[]> {
  const { prompts = [] } = await chrome.storage.local.get('prompts');

  return prompts;
}

export async function getPrompt(id: string): Promise<Prompt | undefined> {
  const prompts = await getPrompts();

  return prompts.find((p) => p.id === id);
}

export async function setPrompt(prompt: Prompt): Promise<void> {
  const prompts = await getPrompts();

  const index = prompts.findIndex((p) => p.id === prompt.id);
  if (index === -1) {
    prompts.push(prompt);
  } else {
    prompts[index] = prompt;
  }

  await chrome.storage.local.set({ prompts });
}

export async function unsetPrompt(id: string): Promise<void> {
  const prompts = await getPrompts();

  const index = prompts.findIndex((p) => p.id === id);
  if (index !== -1) {
    prompts.splice(index, 1);
  }

  await chrome.storage.local.set({ prompts });
}
