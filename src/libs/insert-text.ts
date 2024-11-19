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

        const start = (activeElement as HTMLInputElement).selectionStart ?? 0;
        const end = (activeElement as HTMLInputElement).selectionEnd ?? 0;
        const currentValue = (activeElement as HTMLInputElement).value || activeElement.textContent || '';
        const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);

        if (activeElement.isContentEditable) {
          activeElement.textContent = newValue;
        } else {
          (activeElement as HTMLInputElement).value = newValue;
        }

        return { success: true } as const;
      },
      args: [text],
    });

    if (result) return result;
  } catch (error) {
    console.error('insertText', { error });
  }

  return {
    success: false,
    error: { code: InsertTextErrors.EXECUTION_FAILED, message: 'Script execution failed' },
  } as const;
}
