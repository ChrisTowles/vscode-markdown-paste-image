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

### Linux

`xclip` command is required (Linux)

Example on Ubuntu

```bash
sudo apt-get update -y
sudo apt-get install xclip
```

### Windows

`powershell` command be required (Win32)

### Mac

`pbpaste` command be required (Mac)

_____

## Configuration

Below are the options you can set in your `settings.json` file.

<!--config-options-->
### Image Folder Path

The destination to save image file. 

You can use variable `${currentFileDir}` and `${projectRoot}`. `${currentFileDir}` will be replaced by the path of directory that contain current editing file. `${projectRoot}` will be replaced by path of the project opened in vscode.

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.imageFolderPath" : "${currentFileDir}"
}
```

### Default Image Name

The default image file name. The value of this config will be pass to the 'format' function of Luxon library, you can read document https://moment.github.io/luxon/#/formatting?id=table-of-tokens for usage. 
If you have text selected, it will be used as the file name instead.

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.defaultImageName" : "yyyyLLmm-HHmmss"
}
```

### Image Name Prefix

The string prepended to the image file name.

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.imageNamePrefix" : ""
}
```

### Image Name Suffix

The string appended to the image file name.

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.imageNameSuffix" : ""
}
```

### Image Uri Path Prefix

The string prepended to the resolved image path. Can be used if you want to supply a custom domain to image url.

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.imageUriPathPrefix" : ""
}
```

### Image Uri Path Suffix

The string appended to the resolved image path. Can be used if you want to supply a custom parameters to image url.

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.imageUriPathSuffix" : ""
}
```

### Encode Path

The string appended to the image file name. How to encode image path before insert to editor.

 **Possible Values:** `none`, `urlEncode`, `urlEncodeSpace`

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.encodePath" : "urlEncodeSpace"
}
```

### Insert Pattern

The pattern of string that would be pasted to text.

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.insertPattern" : "${imageSyntaxPrefix}${imageFilePath}${imageSyntaxSuffix}"
}
```

### Show File Path Confirm Input Box

Set to true if you want to be able to change the file path or name prior to saving the file to disk

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.showFilePathConfirmInputBox" : true
}
```

### File Path Confirm Input Box Mode

Set the mode of file path confirm input box

 **Possible Values:** `fullPath`, `onlyName`

```jsonc
{
   // ... other settings.json
   "markdownPasteImage.filePathConfirmInputBoxMode" : "fullPath"
}
```
<!--config-options-->

## VsCode Publish

- [Micrsoft Publisher UI](https://marketplace.visualstudio.com/manage/publishers/)
- [VsCode API Docs](https://code.visualstudio.com/api/references/activation-events)

## Credits

I wanted to make this plugin after issues with markdown image paste [mushan.vscode-paste-image](https://marketplace.visualstudio.com/items?itemName=mushan.vscode-paste-image). After looking for an alternative and finding out that it looked like there were half a [dozen copies](https://marketplace.visualstudio.com/search?term=image%20paste%20markdown&target=VSCode&category=Other&sortBy=Relevance) and most were forks, or no longer maintained.

I decided to use [Anthony Fu](https://github.com/antfu)'s repo for [vscode-smart-clicks](https://github.com/antfu/vscode-smart-clicks) as a starting point. And then build from there to have the features that I wanted.

## License

[MIT](./LICENSE) License © 2022 [Chris Towles](https://github.com/ChrisTowles)
