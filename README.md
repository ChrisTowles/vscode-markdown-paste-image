<p align="center">
<img src="https://raw.githubusercontent.com/ChrisTowles/vscode-markdown-paste-image/main/res/icon.png" height="150">
</p>

<h1 align="center">Markdown Paste image <sup>VS Code</sup></h1>

<p align="center">

<a href="https://marketplace.visualstudio.com/items?itemName=chris-towles.markdown-paste-image" target="__blank">
<img src="https://img.shields.io/visual-studio-marketplace/v/chris-towles.markdown-paste-image.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>

</p>

<p align="center">
Paste an Image from clipboard into markdown for VS Code<br>

</p>

<img src="https://raw.githubusercontent.com/ChrisTowles/vscode-markdown-paste-image/main/res/markdown-paste-image-preview.gif" width="600">

## Installation

Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter.

```bash
ext install chris-towles.markdown-paste-image
```

## Features

- Paste image from clipboard into markdown
- prompts for the file name or uses the selected text as the file name.
- Save clipboard image as `PNG` file and insert image markdown.

There are other plugins that had this feature, but they were not maintained, had bugs, or had tons of features I didn't want. So here is a simple extension that does one thing and one thing only and does it with [tests](https://github.com/ChrisTowles/vscode-markdown-paste-image/actions)!

## Requirements

- `xclip` command be required (Linux)
- `powershell` command be required (Win32)
- `pbpaste` command be required (Mac)

## Usage

`// TODO`

## Configuration

Time format is configured with [Luxon](https://moment.github.io/luxon/#/formatting?id=table-of-tokens)

```jsonc
// settings.json

// TODO!

```

## VsCode Publish

- [Micrsoft Publisher UI](https://marketplace.visualstudio.com/manage/publishers/)
- [VsCode API Docs](https://code.visualstudio.com/api/references/activation-events)
-

## Credits

I wanted to make this plugin after issues with markdown image paste [mushan.vscode-paste-image](https://marketplace.visualstudio.com/items?itemName=mushan.vscode-paste-image). After looking for an alternative and finding out that it looked like there were half a [dozen copies](https://marketplace.visualstudio.com/search?term=image%20paste%20markdown&target=VSCode&category=Other&sortBy=Relevance) and most were forks, or no longer maintained.

I decided to use [Anthony Fu](https://github.com/antfu)'s repo for [vscode-smart-clicks](https://github.com/antfu/vscode-smart-clicks) as a starting point. And then build from there to have the features that I wanted.

## License

[MIT](./LICENSE) License © 2022 [Chris Towles](https://github.com/ChrisTowles)
