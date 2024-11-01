const promptList = document.getElementById("promptList");
const addBtn = document.getElementById("addBtn");
const closeBtn = document.getElementById("closeBtn");

// // top level await is available in ES modules loaded from script tags
// const [tab] = await chrome.tabs.query({
// 	active: true,
// 	lastFocusedWindow: true
// });

// const tabId = tab.id;
addBtn.addEventListener("click", async () => {
	goto("edit.html");
	// window.history.pushState({}, '', 'add.html');

	// await chrome.sidePanel.setOptions({
	// 	tabId,
	// 	path: 'prompt/add.html',
	// 	enabled: true
	// });
	// await chrome.sidePanel.open({ tabId });
});

closeBtn.addEventListener("click", () => window.close());

// Initialize event listeners
function init() {
	loadPrompts();
	// addNewBtn.addEventListener('click', () => {
	//   chrome.windows.create({
	//     url: 'prompt/add.html',
	//     type: 'popup',
	//     width: 600,
	//     height: 600
	//   });
	// });
}

// Load and display prompts
function loadPrompts() {
	chrome.storage.local.get("prompts", (result) => {
		const prompts = result.prompts || [];
		renderPrompts(prompts);
	});
}

// Render prompts to the list
function renderPrompts(prompts) {
	promptList.innerHTML = "";

	prompts.forEach((prompt) => {
		const promptElement = document.createElement("div");
		promptElement.className = "prompt-item";
		promptElement.innerHTML = `
      <h3>${prompt.name}</h3>
      <p>${prompt.prompt}</p>
      <button onclick="editPrompt('${prompt.id}')">Edit</button>
      <button onclick="deletePrompt('${prompt.id}')">Delete</button>
    `;
		promptList.appendChild(promptElement);
	});
}

// Delete a prompt
function deletePrompt(id) {
	if (confirm("Are you sure you want to delete this prompt?")) {
		chrome.storage.local.get("prompts", (result) => {
			const prompts = result.prompts.filter((p) => p.id !== id);
			chrome.storage.local.set({ prompts }, () => {
				chrome.runtime.sendMessage({ action: "updateContextMenu" });
				loadPrompts();
			});
		});
	}
}

// Edit a prompt
function editPrompt(id) {
	goto(`edit.html?id=${id}`);

	// chrome.windows.create({
	//   url: `prompt/edit.html?id=${id}`,
	//   type: 'popup',
	//   width: 600,
	//   height: 600
	// });
}

function goto(path) {
	window.location.href = path;
}

// Initialize the page
init();
