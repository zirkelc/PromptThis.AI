import { getDocumentLanguage } from './get-document-language';
import { type Prompt, getPrompts } from './prompts';

export const MenuItemIds = {
  ROOT: '/',
  ADD: '/add',
  RUN: '/run',
} as const;

export function requestUpdateContextMenu() {
  chrome.runtime.sendMessage({ action: 'updateContextMenu' });
}

export async function updateContextMenu(tab: chrome.tabs.Tab) {
  const currentUrl = tab?.url || '';

  const prompts = await getPrompts();

  try {
    chrome.contextMenus.removeAll(async () => {
      console.log('updateContextMenus', { prompts, currentUrl });

      const items: Array<chrome.contextMenus.CreateProperties> = [];

      for (const prompt of prompts) {
        const contexts = await getPromptContexts(prompt, tab);

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
    });
  } catch (error) {
    console.error('Error updating context menu:', error);
  }
}

export function parsePromptMenuItem(menuItemId: string): string | undefined {
  if (!menuItemId) throw new Error('Invalid menu item ID');

  const promptId = menuItemId.split('/').pop();

  return promptId;
}

function formatPromptMenuItem(promptId: string): string {
  return `${MenuItemIds.RUN}/${promptId}`;
}

function matchesPattern(value: string | undefined, pattern: string | undefined) {
  if (!pattern) return true;
  if (!value) return false;

  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    try {
      const regex = new RegExp(pattern.slice(1, -1));
      return regex.test(value);
    } catch (error) {
      console.error('Invalid regex pattern', { error });
      return false;
    }
  }

  return value.includes(pattern);
}

async function getPromptContexts(
  prompt: Prompt,
  tab: chrome.tabs.Tab,
): Promise<chrome.contextMenus.ContextType[] | undefined> {
  try {
    if (prompt.conditions.url) {
      if (!matchesPattern(tab.url, prompt.conditions.url)) return undefined;
    }

    if (prompt.conditions.language && tab.url && !tab.url.startsWith('chrome://')) {
      const documentLang = await getDocumentLanguage(tab.id);

      if (!matchesPattern(documentLang?.toLowerCase(), prompt.conditions.language.toLowerCase())) return undefined;
    }

    if (prompt.conditions.hasSelection) return ['selection'];

    return ['all'];
  } catch (error) {
    console.error('Error', { error });
    return undefined;
  }
}
