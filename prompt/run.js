document.addEventListener("DOMContentLoaded", async () => {
	await loadPrompt();
});

const nameElement = document.getElementById("name");
/** @type {HTMLTextAreaElement} */
const promptTextarea = document.getElementById("prompt");
/** @type {HTMLTextAreaElement} */
const resultTextarea = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const closeBtn = document.getElementById("closeBtn");
const copyBtn = document.getElementById("copyBtn");
const applyBtn = document.getElementById("applyBtn");

// Get parameters from URL
const urlParams = new URLSearchParams(window.location.search);

/**
 * @type {chrome.contextMenus.OnClickData}
 */
const context = {};
urlParams.forEach((value, key) => {
	context[key] = value;
});

const promptId = context.promptId;
const selectionText = urlParams.get("selectionText") || "";
const editable = urlParams.get("editable") === "true";
const pageUrl = urlParams.get("pageUrl") || "";

console.log("run.js", { promptId, selectionText, editable, pageUrl });

submitBtn.addEventListener("click", submitPrompt);
resetBtn.addEventListener("click", resetPrompt);
closeBtn.addEventListener("click", close);
copyBtn.addEventListener("click", copyToClipboard);
applyBtn.addEventListener("click", applyChanges);

// Hide/show buttons based on context
// copyBtn.style.display = "none"; // Show only after results
// applyBtn.style.display = "none"; // Show only after results
// promptInput.readOnly = !isEditable;

// let session;

// async function runPrompt(prompt, params) {
// 	try {
// 		if (!session) {
// 			session = await ai.languageModel.create(params);
// 		}
// 		return session.prompt(prompt);
// 	} catch (e) {
// 		console.log("Prompt failed");
// 		console.error(e);
// 		console.log("Prompt:", prompt);
// 		// Reset session
// 		reset();
// 		throw e;
// 	}
// }

async function reset() {
	if (session) {
		session.destroy();
	}
	session = null;
}

async function loadPrompt() {
	console.log("loadPrompt", { context });

	// context menu item ID is in the format /run/<promptId>
	const promptId = context.menuItemId.split("/").pop();

	let prompt = {
		id: "default",
		name: "Prompt This",
		prompt: "\n\n{{selection}}",
	};

	if (promptId !== "default") {
		const prompts = await chrome.storage.local.get("prompts");
		prompt = prompts.prompts.find((p) => p.id === promptId);
	}

	console.log("loadPrompt", { prompt });
	if (!prompt) return;

	nameElement.textContent = prompt.name;
	let promptText = prompt.prompt;

	// Insert selection text into prompt
	if (context.selectionText) {
		// If the prompt already contains {{selection}}, replace it with the selection text
		if (promptText.includes("{{selection}}")) {
			promptText = promptText.replace(
				/\{\{selection\}\}/g,
				context.selectionText,
			);
		} else {
			// Otherwise, add the selection text to the end of the prompt
			promptText = `${promptText}\n\n${context.selectionText}`;
		}
	} else {
		// If there is no selection text, remove any {{selection}} placeholders
		promptText = promptText.replace(/\{\{selection\}\}/g, "");
	}

	// If the selected element is editable, enable the apply button, else make it read-only
	if (context.editable) {
		applyBtn.disabled = false;
	} else {
		applyBtn.disabled = true;
	}

	promptTextarea.value = promptText;

	// Focus the prompt textarea
	promptTextarea.focus();

	// Place cursor at beginning of text
	promptTextarea.selectionStart = promptTextarea.selectionEnd = 0;
}

async function submitPrompt() {
	submitBtn.disabled = true;
	promptTextarea.readOnly = true;
	resultTextarea.value = "";

	// Start loading animation
	const loadingInterval = setInterval(() => {
		const dots =
			resultTextarea.value.length >= 3 ? "" : resultTextarea.value + ".";
		resultTextarea.value = dots;
	}, 500);

	let session;
	try {
		session = await ai.languageModel.create({});
		// Clear loading animation once we have a session
		clearInterval(loadingInterval);
		resultTextarea.value = "";

		const stream = await session.promptStreaming(promptTextarea.value);
		for await (const chunk of stream) {
			console.log(chunk);
			resultTextarea.value += chunk;
		}
	} catch (error) {
		clearInterval(loadingInterval);
		console.error("Error:", error);
		resultTextarea.value = `Error: ${error.message}`;
	} finally {
		clearInterval(loadingInterval);
		if (session) {
			session.destroy();
			session = null;
		}
		submitBtn.disabled = false;
		promptTextarea.readOnly = false;
	}
}

function resetPrompt() {
	promptTextarea.value = "";
}

function copyToClipboard() {
	navigator.clipboard.writeText(promptTextarea.value).then(() => {
		// Optional: Show some feedback that copy was successful
		const originalText = copyBtn.textContent;
		copyBtn.textContent = "Copied!";
		setTimeout(() => {
			copyBtn.textContent = originalText;
		}, 2000);
	});
}

function applyChanges() {
	// Send message to content script to replace selection with new text
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.tabs.sendMessage(tabs[0].id, {
			action: "replaceSelection",
			text: promptTextarea.value,
		});
	});
	close();
}

function goto(path) {
	window.location.href = path;
}

function close() {
	goto("list.html");
	window.close();
}
