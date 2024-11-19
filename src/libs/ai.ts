export const ApiTypes = {
  SUMMARIZER: 'summarizer',
  LANGUAGE_MODEL: 'languageModel',
  WRITER: 'writer',
  REWRITER: 'rewriter',
} as const;

export type ApiType = (typeof ApiTypes)[keyof typeof ApiTypes];

type AIApi = AILanguageModelFactory | AISummarizerFactory | AIWriterFactory | AIRewriterFactory;

type AICapabilities =
  | AILanguageModelCapabilities
  | AISummarizerCapabilities
  | AIWriterCapabilities
  | AIRewriterCapabilities;

type AICreateOptions =
  | AILanguageModelCreateOptions
  | AISummarizerCreateOptions
  | AIWriterCreateOptions
  | AIRewriterCreateOptions;

export type AISession = AILanguageModel | AISummarizer | AIWriter | AIRewriter;

export type LanguageModelOptions = {
  temperature?: number;
  topK?: number;
};

export const DefaultTopK = 8;
export const DefaultTemperature = 0.7;

export type SummarizerOptions = {
  type?: string;
  format?: string;
  length?: string;
};

export const SummaryTypes = {
  TLDR: 'tl;dr',
  KEY_POINTS: 'key-points',
  TEASER: 'teaser',
  HEADLINE: 'headline',
} as const;

export type SummaryType = (typeof SummaryTypes)[keyof typeof SummaryTypes];

export const SummaryFormats = {
  MARKDOWN: 'markdown',
  PLAIN_TEXT: 'plain-text',
} as const;

export type SummaryFormat = (typeof SummaryFormats)[keyof typeof SummaryFormats];

export const SummaryLengths = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
} as const;

export type SummaryLength = (typeof SummaryLengths)[keyof typeof SummaryLengths];

function getApi(type: string): AIApi | undefined {
  return type in window.ai ? window.ai[type as keyof typeof window.ai] : undefined;
}

export async function getCapabilities(type: string): Promise<AICapabilities | null> {
  const api = getApi(type);
  if (!api) throw new Error(`Unknown AI type: ${type}`);

  return typeof api.capabilities === 'function' ? await api.capabilities() : null;
}

export async function createSession(type: ApiType, options: AICreateOptions = {}): Promise<AISession> {
  console.log('createSession', { type, ai: window.ai });

  const monitor: AICreateMonitorCallback = (monitor) => {
    monitor.addEventListener('downloadprogress', (e) => {
      console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
    });
  };

  const api = getApi(type);
  if (!api) throw new Error(`Unknown AI type: ${type}`);

  return api.create({
    ...options,
    monitor,
  } as any);
}

export function destroySession(session: AISession | undefined): void {
  session?.destroy();
}

export async function createStream(session: AISession, input: string) {
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
}
