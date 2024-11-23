export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  return tab;
}

export async function getTab(tabId: number) {
  const tab = await chrome.tabs.get(tabId);
  return tab;
}
