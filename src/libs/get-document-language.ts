export async function getDocumentLanguage(
	tabId: number | undefined,
): Promise<string | undefined> {
	console.log("getDocumentLanguage", { tabId });

	if (!tabId) return undefined;

	const [{ result }] = await chrome.scripting.executeScript({
		target: { tabId },
		func: () => {
			return (
				document.documentElement.lang ||
				document
					.querySelector('meta[property="og:locale"]')
					?.getAttribute("content") ||
				document.querySelector("html")?.getAttribute("lang") ||
				navigator.language
			);
		},
	});

	console.log("getDocumentLanguage:result", { result });

	return result;
}
