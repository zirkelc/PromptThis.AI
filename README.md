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
Here are some practical use cases for AI tasks:

**Correct This Text**: Quickly correct any selected text, available on any webpage.
- Name: Correct This Text
- Prompt: "Correct this text for grammar and spelling mistakes: {{selection}}"

**Rewrite This Email**: Write an email in your own words and make it more formal before sending, available on _only Gmail_.
- Name: Rewrite This Email
- Prompt: "Rewrite this email to be more formal: {{selection}}"
- Conditions: 
  - URL *contains* `mail.google.com`
  - HasSelection *is* `true`

**Summarize This Article**: Turn any text into bullet points, available on any webpage.
- Name: Summarize This Article
- Prompt: "Summarize this text in bullet points: {{selection}}"
- Options:
  - Type: `Key Points`
  - Length: `Short`
- Conditions:
  - HasSelection *is* `true`

**Explain This Word**: Explain any unknown word, available only on English pages.
- Name: Explain This Word
- Prompt: "Explain this word or phrase: {{selection}}"
- Conditions: 
  - Language *matches* `/^en/`
  - HasSelection *is* `true`

**Shorten This Tweet**: Shorten your tweet to 300 characters or less, available on _only_ Twitter, X, and Bluesky.
- Name: Shorten This Tweet
- Prompt: "Shorten this tweet to 300 characters or less: {{selection}}"
- Conditions:
  - URL *matches* `/twitter\.com|x\.com|bsky\.app/`
  - HasSelection *is* `true`

There are more examples like translating selected text from one language to another, but the models are currently prohibited from generating text in certain languages.

## [AI APIs](https://developer.chrome.com/docs/ai/built-in-apis)
The extensions currently uses [Prompt API](https://github.com/explainers-by-googlers/prompt-api/) (`type: languageModel`), the [Summarizer API](https://github.com/WICG/writing-assistance-apis) (`type: summarizer`), and the [Rewriter API](https://github.com/WICG/writing-assistance-apis) (`type: rewriter`). 

## Configuration
Each prompt has the following mandatory fields:

| Field | Description | Type | Default |
| ----- | ----------- | ------- | ------- |
| `Name` | The name of the prompt which appears in the context menu | `string` | - |
| `Prompt` | The prompt text with placeholder variables | `string` | - |
| `Type` | The type of the prompt which determines which AI API to use | `languageModel \| summarizer \| rewriter` | `languageModel` |


### Conditions
Conditions control when a prompt should be shown in the context menu. 
They are optional and if no conditions are provided, the prompt will be shown in the context menu on all pages.
If multiple conditions are provided, the prompt will be shown only if all conditions are met.

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
| `RewriterTone` | Tone of the rewriter, if `type` is `rewriter` | `Casual \| Formal \| Technical` | `Casual` |
| `RewriterFormat` | Format of the rewriter, if `type` is `rewriter` | `As Is \| Simplified` | `As Is` |
| `RewriterLength` | Length of the rewriter, if `type` is `rewriter` | `Shorter \| Shorter \| Longer` | `Shorter` |

## Usage
The extension is currently only available for Chrome Canary.


### Install
1. Clone this repository to your local machine.
2. Run `pnpm install` to install the dependencies.
3. Run `pnpm run build` to build the extension to the `dist` folder.
4. Open Chrome and navigate to `chrome://extensions/`.
5. Enable "Developer mode" if it is not already enabled.
5. Click "Load unpacked" and select the `dist` folder inside the cloned repository.

**Note:** The `/dist` folder was committed to this remote repository for a quick start. That means you can skip the steps 2 and 3 above.

### Use
Open the extension by clicking on the `PromptThis.AI` icon in the Chrome toolbar.
The extensions comes with a default set of prompts, but you can also add your own prompts by clicking on the `Add Prompt` button in the extension sidepanel or right-clicking on any page and select `Add Prompt`.
For quick one-off tasks, the `Prompt This` context menu option is always available on any page.


## Ideas For the Future

While the current version of PromptThis.AI already supports a lot of use cases, there are still many ideas on how to improve it even more.
Here are some of my favorite ideas:

**Translation**

Integrating the Translator API to allow for instant translations of selected text with a shortcut like `Ctrl+C+C`.

**Conditions**

Add more conditions to control when an AI task should appear in the context menu:
- `IsEditable` to check if the right-clicked element is an editable text input
- `IsImage` to check if the right-clicked element is an image
- `CssSelector` to check if the right-clicked element matches a CSS selector
- `HasMetaTag` to check if page has a meta tag with a given name and value

**Variables**

Add more variables for dynamic prompts:
- `Cursor` to control where the cursor is placed inside the prompt input when it is opened
- `TextContent` or `HtmlContent` to insert the text or html content of the right-clicked element

**Options**

Add more options to control the behavior of an AI task when it is opened or executed:
- `AutoSelect` to automatically select the content of the right-clicked element
- `AutoInsert` to insert the generated text right back into the right-clicked element of the page
- `AutoCopy` to copy the generated text into the clipboard

**Complex Use Cases**

Lets says I want to an AI task to proof-read any text I type in a textarea. 
I don't want to have to select the text first, just right-click on the textarea and click on the AI task.
I could use a `CssSelector` like `textarea:read-write` to enable the task on all textareas on every page and use the `TextContent` variable to insert the text of the textarea into the prompt. The options could be set to `AutoSubmit` and `AutoInsert` to make it as seamless as possible. A right-click on the textarea would then proof-read it and insert the result right back into the textarea.

## License
MIT
