export function closeSidepanel() {
	chrome.runtime.sendMessage(
		{
			action: "resetSidepanel",
		},
		() => window.close(),
	);
}

export function resetSidepanel(tab: chrome.tabs.Tab) {
	console.log("resetSidepanel", { tab });

	const id = tab.id ? { tabId: tab.id } : { windowId: tab.windowId };

	chrome.sidePanel.setOptions({
		path: "pages/list.html",
		enabled: true,
		...id,
	});
}

// https://github.com/GoogleChrome/chrome-extensions-samples/issues/987#issuecomment-2450848264
export function openSidePanel(tab: chrome.tabs.Tab, path: string) {
	console.log("openSidePanel", { path, tab });

	const id = tab.id ? { tabId: tab.id } : { windowId: tab.windowId };

	chrome.sidePanel.setOptions(
		{
			path,
			enabled: true,
			...id,
		},
		() => {
			chrome.sidePanel.open(id);
		},
	);
}
