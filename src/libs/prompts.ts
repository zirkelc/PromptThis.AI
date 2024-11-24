import {
  type ApiType,
  ApiTypes,
  type LanguageModelOptions,
  RewriterFormats,
  RewriterLengths,
  type RewriterOptions,
  RewriterTones,
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
    [ApiTypes.REWRITER]?: RewriterOptions;
  };
};

export function initDefaultPrompts() {
  console.log('initDefaultPrompts');

  const defaultPrompts: Array<Prompt> = [
    {
      id: 'correct',
      name: 'Correct This Text',
      type: ApiTypes.LANGUAGE_MODEL,
      prompt: 'Correct this text for grammar and spelling mistakes:\n\n{{selection}}',
      options: {
        autoSubmit: true,
      },
      conditions: {
        hasSelection: true,
      },
    },
    {
      id: 'rewrite',
      name: 'Rewrite This Email',
      type: ApiTypes.REWRITER,
      prompt: 'Rewrite this email to be more formal:\n\n{{selection}}',
      options: {
        autoSubmit: true,
        rewriter: {
          tone: RewriterTones.MORE_FORMAL,
        },
      },
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
        autoSubmit: true,
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
        language: '/^en/', // starts with 'en'
        hasSelection: true,
      },
    },
    {
      id: 'shorten',
      name: 'Shorten This Tweet ',
      type: ApiTypes.REWRITER,
      prompt: 'Shorten this tweet to 300 characters or less:\n\n{{selection}}',
      options: {
        autoSubmit: true,
        rewriter: {
          tone: RewriterTones.AS_IS,
          format: RewriterFormats.AS_IS,
          length: RewriterLengths.SHORTER,
        },
      },
      conditions: {
        url: '/x\\.com|bsky\\.app/', // Twitter or Bluesky
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
