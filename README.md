```
░█▀█░█▀▄░█▀█░█▄█░█▀█░▀█▀░▀█▀░█░█░▀█▀░█▀▀
░█▀▀░█▀▄░█░█░█░█░█▀▀░░█░░░█░░█▀█░░█░░▀▀█
░▀░░░▀░▀░▀▀▀░▀░▀░▀░░░░▀░░░▀░░▀░▀░▀▀▀░▀▀▀
```

## About
A Chrome extension created for the [Google Chrome Built-in AI Challenge](https://googlechromeai.devpost.com/) that seamlessly integrates AI capabilities into your browsing experience.

## Problem
In today's digital landscape, AI tools have become essential for many tasks, but their integration into our daily workflow remains fragmented and inefficient. Users frequently find themselves:

- Switching between multiple tabs or applications to access AI features
- Repeatedly copying and pasting text back and forth between AI tools
- Writing similar prompts over and over for common tasks, like "correct this" or "summarize that"

This context-switching not only breaks concentration but also significantly reduces productivity.

## Solution 
PromptThis.AI seamlessly integrates AI capabilities directly into your browser's context menu, making AI assistance just a right-click away. Key features include:

- **Custom AI Tasks**: Define your own AI-powered tasks that appear in the context menu
- **Dynamic Prompts**: Use variables like selected text, current URL, or page language in your prompts
- **Context-Aware**: Tasks can be configured to appear only on specific websites or languages
- **Seamless Integration**: AI appears right alongside your work in a convenient sidepanel - no tab switching needed

### How It Works
1. Right-click on any page to access your custom AI tasks
2. Select a task from the context menu
3. The prompt appears in a side panel with your selected text automatically inserted
4. Edit the prompt if needed and submit
5. Copy or directly insert the AI-generated result into your work

### Examples
Here are some practical use cases:

**Correct This**: Quickly correct any selected text, available on any webpage.
- Prompt: "Correct this text for grammar and spelling mistakes: {{selection}}"

**Rewrite This**: Write an email in your own words and make it formal before sending, available on _only Gmail_.
- Prompt: "Rewrite this email to be formal: {{selection}}"
- Conditions: 
  - URL *matches* `gmail.google.com`
  - HasSelection *is true*

**Summarize This**: Turn any text into bullet points, available on any webpage.
- Prompt: "Summarize this text in bullet points: {{selection}}"
- Options:
  - Type: `Key Points`
  - Length: `Short`
	
**Explain This**: Explain any unknown word if the page is not in English.
- Prompt: "Explain this word or phrase: {{selection}}"
- Conditions: 
  - Language *does not equal* `en`
  - HasSelection *is true*

There are more examples like translating selected text, but the models are currently prohibited from generating certain languages.

## [AI APIs](https://developer.chrome.com/docs/ai/built-in-apis)
The extensions uses [Prompt API](https://github.com/explainers-by-googlers/prompt-api/) (`type: languageModel`) and the [Summarizer API](https://github.com/WICG/writing-assistance-apis) (`type: summarizer`). 
The [Writer API](https://github.com/WICG/writing-assistance-apis) and [Rewriter API](https://github.com/WICG/writing-assistance-apis) could not be used at the time of this submission because of a [known bug](https://issues.chromium.org/issues/374942272). However, it is planned to integrate these APIs as when their design has been stabilized.

## Configuration
Each prompt has the following mandatory fields:

| Field | Description | Type | Default |
| ----- | ----------- | ------- | ------- |
| `Name` | The name of the prompt which appears in the context menu | `string` | - |
| `Prompt` | The prompt text with placeholder variables | `string` | - |
| `Type` | The type of the prompt which determines which AI API to use | `languageModel \| summarizer` | `languageModel` |


### Conditions
Conditions control when a prompt should be shown in the context menu. 
They are optional and if no conditions are provided, the prompt will be shown in the context menu on all pages.
If multiple conditions are provided, the prompt will be shown if all conditions are met.

The following conditions are available:

| Field | Description | Type | Default |
| ----- | ----------- | ------- | ------- |
| `URL` | The prompt should only be shown on specific URLs | `string \| Regex` | - |
| `Language` | The prompt should only be shown on specific languages | `string \| Regex` | - |
| `HasSelection` | The prompt should only be shown if there is a text selection on the page | `boolean` | `false` |

### Options
Options control the behavior of the prompt when it is shown in the sidepanel.

The following options are available:
| Field | Description | Type | Default |
| ----- | ----------- | ------- | ------- |
| `AutoSubmit` | Whether the prompt should be submitted automatically when the user clicks on the submit button | `boolean` | `false` |
| `LanguageModelTemperature` | Temperature of the language model, if `type` is `languageModel` | `number` | `0.7` |
| `LanguageModelTopK` | Top-k of the language model, if `type` is `languageModel` | `number` | `40` |
| `SummaryType` | Type of the summary, if `type` is `summarizer` | `Key Points \| Short \| Long` | `Key Points` |
| `SummaryFormat` | Format of the summary, if `type` is `summarizer` | `Bullets \| Paragraphs` | `Bullets` |
| `SummaryLength` | The length of the summary, if `type` is `summarizer` | `Short \| Medium \| Long` | `Short` |

## Usage
1. Clone this repository to your local machine.
2. Run `pnpm install` to install the dependencies.
3. Run `pnpm run build` to build the extension to the `dist` folder.
4. Open Chrome and navigate to `chrome://extensions/`.
5. Enable "Developer mode" if it is not already enabled.
5. Click "Load unpacked" and select the `dist` folder inside the cloned repository.

**Note:** The `/dist` folder was committed to this remote repository for a quick start. That means you can skip the steps 2 and 3 above.

## Ideas For the Future

**Translation**
Integrating the Translator API to allow for instant translations of selected text with a shortcut like `Ctrl+C+C`.

**Conditions**
Add more conditions to control when an AI task should appear in the context menu:
- `IsEditable` to check if the right-clicked element is an editable text input
- `IsImage` to check if the right-clicked element is an image
- `CssSelector` to check if the right-clicked element matches a CSS selector

**Variables**
Add more variables for dynamic prompts:
- `Cursor` to control where the cursor is placed inside the prompt input when it is opened
- `TextContent` or `HtmlContent` to insert the text or html content of the right-clicked element

**Complex Use Cases**
Lets says I want to an AI task to proof-read any text I type in a textarea. I don't want to have to select the text first, just right-click on the textarea and click on the AI task.
I could use a `CssSelector` like `textarea` to enable the task on all textareas on every page and use the `TextContent` variable to insert the text of the textarea into the prompt.

## License
MIT
