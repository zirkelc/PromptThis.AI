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

export type RewriterOptions = {
  tone?: string;
  format?: string;
  length?: string;
};

export const RewriterTones = {
  AS_IS: 'as-is',
  MORE_FORMAL: 'more-formal',
  MORE_CASUAL: 'more-casual',
} as const;

export type RewriterTone = (typeof RewriterTones)[keyof typeof RewriterTones];

export const RewriterFormats = {
  AS_IS: 'as-is',
  MARKDOWN: 'markdown',
  PLAIN_TEXT: 'plain-text',
} as const;

export type RewriterFormat = (typeof RewriterFormats)[keyof typeof RewriterFormats];

export const RewriterLengths = {
  AS_IS: 'as-is',
  SHORTER: 'shorter',
  LONGER: 'longer',
} as const;

export type RewriterLength = (typeof RewriterLengths)[keyof typeof RewriterLengths];

function getApi(type: string): AIApi | undefined {
  console.log('getApi', { type, ai: window.ai });

  return type in window.ai ? window.ai[type as keyof typeof window.ai] : undefined;
}

export async function getCapabilities(type: string): Promise<AICapabilities | null> {
  console.log('getCapabilities', { type });

  const api = getApi(type);
  if (!api) throw new Error(`Unknown AI type: ${type}`);

  if ('capabilities' in api) {
    const capabilities = await api.capabilities();
    console.log('capabilities', { capabilities });

    return capabilities;
  }

  return null;
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

  const capabilities = await getCapabilities(type);
  // Bug: `self.ai.(re)writer.capabilities()` function went missing
  // https://issues.chromium.org/u/1/issues/380088820
  // if (!capabilities || capabilities.available === 'no') throw new Error(`AI type not available: ${type}`);

  if (type === ApiTypes.REWRITER) {
    // Bug: Writer and Rewriter APIs depend on `sharedContext` to be filled
    // https://issues.chromium.org/u/1/issues/380058928?pli=1
    (options as AIRewriterCreateOptions).sharedContext = `rewrite this`; // dummy value
  }

  console.log('createSession', { options });
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
