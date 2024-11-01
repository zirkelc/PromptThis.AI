const nameInput = document.getElementById("name");
const promptInput = document.getElementById("prompt");
const urlPatternInput = document.getElementById("urlPattern");
const isEditableInput = document.getElementById("isEditable");
const isSelectionInput = document.getElementById("isSelection");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const pageTitle = document.getElementById("pageTitle");
const closeBtn = document.getElementById("closeBtn");

// Get prompt ID from URL params
const urlParams = new URLSearchParams(window.location.search);
const promptId = urlParams.get("id");

// Set up page based on mode
if (promptId) {
	document.title = "Edit Prompt";
	pageTitle.textContent = "Edit Prompt";
	saveBtn.textContent = "Save";
	// Load existing prompt
	loadPrompt(promptId);
} else {
	document.title = "Add Prompt";
	pageTitle.textContent = "Add Prompt";
	saveBtn.textContent = "Add";
}

saveBtn.addEventListener("click", savePrompt);
cancelBtn.addEventListener("click", () => goto("list.html"));
closeBtn.addEventListener("click", () => close());

function loadPrompt(id) {
	chrome.storage.local.get("prompts", (result) => {
		const prompts = result.prompts || [];
		const prompt = prompts.find((p) => p.id === id);
		if (prompt) {
			nameInput.value = prompt.name;
			promptInput.value = prompt.prompt;
			urlPatternInput.value = prompt.conditions.urlPattern || "";
			isEditableInput.checked = prompt.conditions.isEditable;
			isSelectionInput.checked = prompt.conditions.isSelection;
		}
	});
}

function savePrompt() {
	const promptData = {
		name: nameInput.value.trim(),
		prompt: promptInput.value.trim(),
		conditions: {
			urlPattern: urlPatternInput.value.trim(),
			isEditable: isEditableInput.checked,
			isSelection: isSelectionInput.checked,
		},
	};

	chrome.storage.local.get("prompts", (result) => {
		const prompts = result.prompts || [];

		if (promptId) {
			// Edit existing prompt
			const index = prompts.findIndex((p) => p.id === promptId);
			if (index !== -1) {
				promptData.id = promptId;
				prompts[index] = promptData;
			}
		} else {
			// Add new prompt
			promptData.id = Date.now().toString();
			prompts.push(promptData);
		}

		chrome.storage.local.set({ prompts }, () => {
			chrome.runtime.sendMessage({ action: "updateContextMenu" });
			goto("list.html");
		});
	});
}

function goto(path) {
	window.location.href = path;
}

function close() {
	goto("list.html");
	window.close();
}
