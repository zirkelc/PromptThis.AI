export type HTMLInputCheckboxElement = HTMLInputElement & { type: 'checkbox' };
export type HTMLInputNumberElement = HTMLInputElement & { type: 'number' };
export type HTMLInputTextElement = HTMLInputElement & { type: 'text' };

export function getElementById<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element ${id} not found`);

  return element as T;
}

export function assertElement(element: HTMLElement | null, message?: string): asserts element is HTMLElement {
  if (!element) {
    throw new Error(message ?? 'Element not found');
  }
}

export function setValue(element: HTMLInputCheckboxElement, value: boolean): void;
export function setValue(element: HTMLInputNumberElement, value: number): void;
export function setValue(element: HTMLInputTextElement, value: string): void;
export function setValue(element: HTMLSelectElement, value: string): void;
export function setValue(element: HTMLElement, value: string | boolean | number): void;
export function setValue(element: HTMLElement, value: string | boolean | number): void {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox') {
      element.checked = Boolean(value);
    } else if (element.type === 'number') {
      element.value = String(value);
    } else {
      element.value = String(value);
    }
    return;
  }

  if (element instanceof HTMLSelectElement) {
    element.value = String(value);
    return;
  }

  if (element.isContentEditable) {
    console.log('isContentEditable', { element, value });
    // Convert \n to <br> for contentEditable elements
    element.innerHTML = String(value).replace(/\n/g, '<br>').trim();
  } else {
    element.textContent = String(value).trim();
  }
}

export function getValue(element: HTMLInputCheckboxElement): boolean;
export function getValue(element: HTMLInputNumberElement): number;
export function getValue(element: HTMLInputTextElement): string;
export function getValue(element: HTMLSelectElement): string;
export function getValue(element: HTMLElement): string;
export function getValue(element: HTMLElement): string | boolean | number {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox') return Boolean(element.checked);
    if (element.type === 'number') return Number(element.value.trim());
    return element.value.trim();
  }

  if (element instanceof HTMLSelectElement) {
    return element.value;
  }

  if (element.isContentEditable) {
    // Convert <br> back to \n for contentEditable elements
    return element.innerHTML
      .replace(/<br\s*\/?>/gi, '\n') // Convert <br>, <br/>, <br /> to \n
      .trim();
  }

  return element.textContent?.trim() ?? '';
}

export function setEditable(element: HTMLElement, editable: boolean): void {
  element.contentEditable = editable ? 'true' : 'false';
}

export function setVisible(element: HTMLElement, visible: boolean): void {
  visible ? element.removeAttribute('hidden') : element.setAttribute('hidden', '');
}

export function setEnabled(element: HTMLElement, enabled: boolean): void {
  (element as HTMLInputElement | HTMLSelectElement | HTMLButtonElement).disabled = !enabled;
}

export function goto(path: string): void {
  window.location.href = path;
}

export function scrollDown(): void {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

export function encodeText(text: string): string {
  console.log('encodeText', { text });

  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return btoa(String.fromCharCode(...bytes));
}

export function decodeText(encoded: string): string {
  console.log('decodeText', { encoded });

  const decoder = new TextDecoder();
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  return decoder.decode(bytes);
}
