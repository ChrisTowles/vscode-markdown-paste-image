<p align="center">
<img src="https://raw.githubusercontent.com/ChrisTowles/vscode-markdown-paste-image/main/res/icon.png" height="150">
</p>

<h1 align="center">Markdown Paste image <sup>VS Code</sup></h1>

<p align="center">
<!--
<a href="https://marketplace.visualstudio.com/items?itemName=antfu.smart-clicks" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/antfu.smart-clicks.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
-->
</p>

<p align="center">
Paste Image from clipboard into markdown for VS Code.<br>
</p>

<img src="https://raw.githubusercontent.com/ChrisTowles/vscode-markdown-paste-image/main/res/markdown-paste-image-preview.gif" height="150">

## Requirements

- `xclip` command be required (Linux)
- `powershell` command be required (Win32)
- `pbpaste` command be required (Mac)

## Usage

`// TODO`

## Rules

## Configuration

All the rules are enabled by default. To disable a specific rule, set the rule to `false` in `smartClicks.rules` of your VS Code settings:

Time format is configured with [Luxon](https://moment.github.io/luxon/#/formatting?id=table-of-tokens)

```jsonc
// settings.json

```

## VsCode Docs

- <https://code.visualstudio.com/api/references/activation-events>

## Credits

I wanted to make this plugin after issues with markdown image paste [mushan.vscode-paste-image](https://marketplace.visualstudio.com/items?itemName=mushan.vscode-paste-image). After looking for an alternative and finding out that it looked like there were half a [dozen copies](https://marketplace.visualstudio.com/search?term=image%20paste%20markdown&target=VSCode&category=Other&sortBy=Relevance) and most forks and longer maintained.

I decided to use [Anthony Fu](https://github.com/antfu)'s repo for [vscode-smart-clicks](https://github.com/antfu/vscode-smart-clicks) as a starting point. And then refactor to have the features that I wanted.

## License

[MIT](./LICENSE) License © 2022 [Chris Towles](https://github.com/ChrisTowles)
