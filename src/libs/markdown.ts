import { marked } from 'marked';

export async function setMarkdown(element: HTMLElement, text: string) {
  element.innerHTML = await marked.parse(text);

  for (const block of element.querySelectorAll('pre code')) {
    const pre = block.parentElement as HTMLPreElement;
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordBreak = 'break-word';
  }

  for (const list of element.querySelectorAll('ul, ol')) {
    list.classList.add('list-disc', 'list-inside');
  }
}
