import { g as getElementById, t as goto, _ as __awaiter, w as getPrompts, x as unsetPrompt, v as requestUpdateContextMenu } from './html-utils-K7qxwLe8.js';

/**
 * Elements
 */
const promptListElement = getElementById('promptList');
/**
 * Buttons
 */
const addBtn = getElementById('addBtn');
const closeBtn = getElementById('closeBtn');
/**
 * Event listeners
 */
addBtn.addEventListener('click', () => goto('edit.html'));
closeBtn.addEventListener('click', () => window.close());
document.addEventListener('DOMContentLoaded', () => {
    loadPrompts();
});
function loadPrompts() {
    return __awaiter(this, void 0, void 0, function* () {
        const prompts = yield getPrompts();
        promptListElement.innerHTML = '';
        for (const prompt of prompts) {
            const promptElement = document.createElement('div');
            promptElement.className = 'mb-4 py-2.5 border-b border-gray-200';
            promptElement.innerHTML = `
			<h3 class="text-lg font-medium mb-1">${prompt.name}</h3>
			<p class="text-sm text-gray-600 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">${prompt.prompt}</p>
			<div class="flex gap-4">
				<button class="hover:underline text-xs" data-id="${prompt.id}">Edit</button>
				<button class="hover:underline text-xs" data-id="${prompt.id}">Delete</button>
			</div>
		`;
            const [editBtn, deleteBtn] = promptElement.querySelectorAll('button');
            editBtn.addEventListener('click', () => editPrompt(prompt.id));
            deleteBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () { return deletePrompt(prompt.id); }));
            promptListElement.appendChild(promptElement);
        }
    });
}
function deletePrompt(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const confirmation = window.confirm('Are you sure you want to delete this prompt?');
        if (confirmation) {
            yield unsetPrompt(id);
            yield loadPrompts();
            requestUpdateContextMenu();
        }
    });
}
function editPrompt(id) {
    goto(`edit.html?id=${id}`);
}
//# sourceMappingURL=list.js.map
