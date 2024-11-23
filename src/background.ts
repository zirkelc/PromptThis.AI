import { updateContextMenu, MenuItemIds } from './libs/context-menu.js';
import { encodeText } from './libs/html-utils.js';
import { initDefaultPrompts } from './libs/prompts.js';
import { openSidePanel, resetSidepanel } from './libs/sidepanel.js';
import { getActiveTab, getTab } from './libs/tabs.js';

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
chrome.runtime.onInstalled.addListener(async (info) => {
  console.log('runtime.onInstalled', { info });

  // Initialize default prompts on first install
  if (info.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    initDefaultPrompts();
  }

  const tab = await getActiveTab();
  await updateContextMenu(tab);
});

/**
 * Update context menu on message.
 */
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'updateContextMenu') {
    console.log('updateContextMenu', { request });

    const tab = await getActiveTab();

    await updateContextMenu(tab);
  }
});

/**
 * Reset sidepanel on message.
 */
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'resetSidepanel') {
    console.log('resetSidepanel', { request });

    const tab = await getActiveTab();

    resetSidepanel(tab);
    sendResponse();
  }
});

/**
 * Update context menus when a tab is activated.
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('tabs.onActivated', { activeInfo });

  const tab = await getTab(activeInfo.tabId);
  await updateContextMenu(tab);
});

/**
 * Update context menus when a tab is updated.
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log('tabs.onUpdated', { tabId, changeInfo, tab });

  if (changeInfo.status === 'complete') {
    await updateContextMenu(tab);
  }
});

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

  const tabId = tab?.id;
  if (!tabId) return;

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
function addPrompt(tab: chrome.tabs.Tab) {
  console.log('addPrompt', { tab });

  openSidePanel(tab, 'pages/edit.html');
}

/**
 * Open the run prompt page.
 */
function runPrompt(tab: chrome.tabs.Tab, info: chrome.contextMenus.OnClickData) {
  console.log('runPrompt', { tab, info });

  const params = new URLSearchParams(Object.entries(info));
  params.set('tabId', tab.id?.toString() ?? '');
  params.set('windowId', tab.windowId?.toString() ?? '');

  openSidePanel(tab, `pages/run.html?${params.toString()}`);
}
