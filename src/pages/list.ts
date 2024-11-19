import './style.css';
import { getElementById, goto } from '../libs/html-utils.js';
import { requestUpdateContextMenu } from '../libs/context-menu.js';
import { getActiveTab } from '../libs/tabs.js';
import { getPrompts, unsetPrompt } from '../libs/prompts.js';

/**
 * Elements
 */
const promptListElement = getElementById<HTMLDivElement>('promptList');

/**
 * Buttons
 */
const addBtn = getElementById<HTMLButtonElement>('addBtn');
const closeBtn = getElementById<HTMLButtonElement>('closeBtn');

/**
 * Event listeners
 */
addBtn.addEventListener('click', () => goto('edit.html'));
closeBtn.addEventListener('click', () => window.close());

document.addEventListener('DOMContentLoaded', () => {
  loadPrompts();
});

async function loadPrompts() {
  const prompts = await getPrompts();

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
    deleteBtn.addEventListener('click', async () => deletePrompt(prompt.id));

    promptListElement.appendChild(promptElement);
  }
}

async function deletePrompt(id: string) {
  const confirmation = window.confirm('Are you sure you want to delete this prompt?');

  if (confirmation) {
    await unsetPrompt(id);
    await loadPrompts();
    requestUpdateContextMenu();
  }
}

function editPrompt(id: string) {
  goto(`edit.html?id=${id}`);
}
