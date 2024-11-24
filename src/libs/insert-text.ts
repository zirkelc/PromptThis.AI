const InsertTextErrors = {
  EXECUTION_FAILED: 'EXECUTION_FAILED',
  NO_ACTIVE_ELEMENT: 'NO_ACTIVE_ELEMENT',
  INVALID_ELEMENT: 'INVALID_ELEMENT',
  IFRAME_NOT_ALLOWED: 'IFRAME_NOT_ALLOWED',
  NO_EDITABLE_ELEMENT: 'NO_EDITABLE_ELEMENT',
} as const;

export type InsertTextError = (typeof InsertTextErrors)[keyof typeof InsertTextErrors];

export type InsertTextResult =
  | {
      success: true;
      error?: undefined;
    }
  | {
      success: false;
      error: {
        code: InsertTextError;
        message: string;
      };
    };

export async function insertText(tabId: number | undefined, text: string): Promise<InsertTextResult> {
  console.log('insertText', { tabId, text });

  if (!tabId)
    return { success: false, error: { code: InsertTextErrors.EXECUTION_FAILED, message: 'No tab ID provided' } };

  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: (text: string) => {
        const activeElement = document.activeElement;

        if (!activeElement) {
          return {
            success: false,
            error: { code: InsertTextErrors.NO_ACTIVE_ELEMENT, message: 'No active element found' },
          } as const;
        }

        if (!(activeElement instanceof HTMLElement)) {
          return {
            success: false,
            error: { code: InsertTextErrors.INVALID_ELEMENT, message: 'Active element is not a valid element' },
          } as const;
        }

        if (activeElement.tagName === 'IFRAME') {
          return {
            success: false,
            error: { code: InsertTextErrors.IFRAME_NOT_ALLOWED, message: 'Not allowed to replace text in iframe' },
          } as const;
        }

        if (
          (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') &&
          (activeElement as HTMLInputElement).readOnly
        ) {
          return {
            success: false,
            error: { code: InsertTextErrors.NO_EDITABLE_ELEMENT, message: 'Active element is not editable' },
          } as const;
        }

        if (
          activeElement.tagName !== 'TEXTAREA' &&
          activeElement.tagName !== 'INPUT' &&
          !activeElement.isContentEditable
        ) {
          return {
            success: false,
            error: { code: InsertTextErrors.NO_EDITABLE_ELEMENT, message: 'Active element is not editable' },
          } as const;
        }

        console.log('activeElement', { activeElement });

        if (activeElement.isContentEditable) {
          const selection = window.getSelection()!;
          let range: Range;

          if (selection.rangeCount === 0) {
            range = document.createRange();
            range.selectNodeContents(activeElement);
            range.collapse(false);
            selection.addRange(range);
          } else {
            range = selection.getRangeAt(0);
          }

          range.deleteContents();
          const fragments = text.split('\n').map((line, index, array) => {
            const textNode = document.createTextNode(line);

            if (index < array.length - 1) {
              const br = document.createElement('br');
              const fragment = document.createDocumentFragment();
              fragment.appendChild(textNode);
              fragment.appendChild(br);
              return fragment;
            }

            return textNode;
          });

          fragments.forEach((fragment) => {
            range.insertNode(fragment);
            range.collapse(false);
          });

          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          const input = activeElement as HTMLInputElement;
          const start = input.selectionStart ?? 0;
          const end = input.selectionEnd ?? 0;
          const currentValue = input.value;
          const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
          input.value = newValue;
          input.setSelectionRange(start + text.length, start + text.length);
        }

        return { success: true } as const;
      },
      args: [text],
    });

    if (result) return result;
  } catch (error) {
    console.error('Error inserting text', { error });
  }

  return {
    success: false,
    error: { code: InsertTextErrors.EXECUTION_FAILED, message: 'Script execution failed' },
  } as const;
}
