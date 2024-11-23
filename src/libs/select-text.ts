export async function selectText(tabId: number | undefined): Promise<string | undefined> {
  console.log('selectText', { tabId });

  if (!tabId) return undefined;

  const [{ result: selectionText }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const selection = window.getSelection();
      return selection ? selection.toString().replace(/\n{2}/g, '\n') : '';
    },
  });

  console.log('selectText', { selectionText });

  return selectionText;
}
