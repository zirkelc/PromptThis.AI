const ROOT_MENU_ID = "/";

const ADD_PROMPT_ID = "/add";
const RUN_PROMPT_ID = "/run";

// Open settings page when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
	console.log("action.onClicked", { tab });
	// chrome.tabs.create({ url: 'layout/settings.html' });
	openSidePanel("prompt/list.html", tab.windowId, tab.id, "tab-specific");
});

// chrome.sidePanel
//   .setPanelBehavior({ openPanelOnActionClick: true })
//   .catch((error) => console.error(error));

// Initialize context menu when extension is installed or updated
chrome.runtime.onInstalled.addListener((info, tab) => {
	console.log("runtime.onInstalled", { info, tab });

	// if(tab) {
	//   chrome.sidePanel.open({ windowId: tab.windowId });
	// }

	updateContextMenus();
});

// Update context menus when a message is received
chrome.runtime.onMessage.addListener(async (request, sender) => {
	console.log("runtime.onMessage", { request, sender });

	// Get current URL
	const [tab] = await chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
	});
	console.log("active tab", { tab });

	if (request.action === "updateContextMenu") {
		updateContextMenus(tab.url);
	}
});

// Update context menus when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete") {
		updateContextMenus(tab.url);
	}
});

// Handle context menu item clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
	console.log("contextMenus.onClicked", { info, tab });

	const tabId = tab?.id;
	if (!tabId) return;

	const menuItemId = info.menuItemId;

	if (menuItemId === ADD_PROMPT_ID) {
		console.log("addNewTask");
		const currentUrl = tab.url || "";
		// chrome.tabs.create({ url: `layout/settings.html?url=${encodeURIComponent(currentUrl)}` });

		addPrompt(tab);
	} else if (menuItemId.startsWith(RUN_PROMPT_ID)) {
		console.log("runPrompt", menuItemId);
		runPrompt(tab, info);
	} else {
		console.log("unknown menu item", { menuItemId });
	}
});

function addPrompt(tab) {
	console.log("addPrompt", { tab });

	openSidePanel("prompt/edit.html", tab.windowId, tab.id, "tab-specific");
}

/**
 * @param {chrome.tabs.Tab} tab
 * @param {chrome.contextMenus.OnClickData} info
 */
function runPrompt(tab, info) {
	console.log("runPrompt", { tab, info });

	const promptId = info.menuItemId.split("/").pop();
	// const prompt = await getPromptById(promptId);
	// console.log('runPrompt', { prompt });

	const params = new URLSearchParams(info);
	// if (info.editable) params.set("editable", "true");
	// if (info.selectionText) params.set("selectionText", info.selectionText);

	openSidePanel(
		`prompt/run.html?${params.toString()}`,
		tab.windowId,
		tab.id,
		"tab-specific",
	);
}

// https://github.com/GoogleChrome/chrome-extensions-samples/issues/987#issuecomment-2450848264
function openSidePanel(sidePanelPath, windowId, tabId, scope) {
	const options = {
		path: sidePanelPath,
		enabled: true,
		...(tabId !== undefined ? { tabId } : { windowId }),
	};

	if (scope === "tab-specific" && tabId !== undefined) {
		chrome.sidePanel.setOptions(options, () => {
			chrome.sidePanel.open({ tabId });
		});
	} else {
		chrome.sidePanel.setOptions({ path: sidePanelPath, enabled: true }, () => {
			chrome.sidePanel.open({ windowId });
		});
	}
}

async function getPromptById(promptId) {
	console.log("getPromptById", { promptId });

	const result = await chrome.storage.local.get("prompts");

	const prompts = result.prompts || [];
	const prompt = prompts.find((p) => p.id === promptId);

	return prompt;
}

// Update context menus based on current URL
function updateContextMenus(currentUrl = "") {
	chrome.contextMenus.removeAll(() => {
		chrome.storage.local.get("prompts", (result) => {
			const prompts = result.prompts || [];
			console.log("updateContextMenus", { prompts, currentUrl });

			// Create root menu
			chrome.contextMenus.create({
				id: ROOT_MENU_ID,
				title: "MakeThis.AI",
				contexts: ["all"],
			});

			// Add "Prompt This" option
			chrome.contextMenus.create({
				id: `${RUN_PROMPT_ID}/default`,
				title: "Prompt This",
				parentId: ROOT_MENU_ID,
				contexts: ["all"],
			});

			// Add "Add prompt" option
			chrome.contextMenus.create({
				id: ADD_PROMPT_ID,
				title: "Add prompt",
				parentId: ROOT_MENU_ID,
				contexts: ["all"],
			});

			// Add separator
			chrome.contextMenus.create({
				id: "separator1",
				type: "separator",
				parentId: ROOT_MENU_ID,
				contexts: ["all"],
			});

			// Add prompts to appropriate contexts
			for (const prompt of prompts) {
				const contexts = getPromptContexts(prompt, currentUrl);
				const id = `${RUN_PROMPT_ID}/${prompt.id}`;

				if (contexts) {
					chrome.contextMenus.create({
						id,
						title: prompt.name,
						parentId: ROOT_MENU_ID,
						contexts: contexts,
					});
				}
			}
		});
	});
}

// Get the appropriate contexts for a task based on its selectors and URL
// Returns undefined if the task should not be shown
function getPromptContexts(prompt, url) {
	// Check URL selector first
	if (prompt.conditions.urlPattern) {
		if (
			prompt.conditions.urlPattern.startsWith("/") &&
			prompt.conditions.urlPattern.endsWith("/")
		) {
			// It's a regex
			try {
				const regex = new RegExp(prompt.conditions.urlPattern.slice(1, -1));
				if (!regex.test(url)) return undefined;
			} catch (error) {
				console.error("Invalid URL selector regex:", error);
				return undefined;
			}
		} else {
			// It's a simple string
			if (!url.includes(prompt.conditions.urlPattern)) return undefined;
		}
	}

	const contexts = new Set();

	// Basic context for prompts without specific selectors
	if (!prompt.conditions.isEditable && !prompt.conditions.isSelection) {
		contexts.add("all");
	}

	// Add specific contexts based on selectors
	if (prompt.conditions.isEditable) {
		contexts.add("editable");
	}
	if (prompt.conditions.isSelection) {
		contexts.add("selection");
	}

	return contexts.size > 0 ? Array.from(contexts) : undefined;
}
