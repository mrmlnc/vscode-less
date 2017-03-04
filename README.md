# vscode-less

> Less IntelliSense (Variables and Mixins) for all files in the workspace.

> **Disclaimer**
>
> This is a preview release that may contain errors. This plugin works fine on my machine (SSD) with 1000+ Bootstrap files (Less, 3.3.7).
>
> Please read this README file.

## Donate

If you want to thank me, or promote your Issue.

[![Gratipay User](https://img.shields.io/gratipay/user/mrmlnc.svg?style=flat-square)](https://gratipay.com/~mrmlnc)

> Sorry, but I have work and support for plugins requires some time after work. I will be glad of your support.

## Install

Plugin installation is performed in several stages:

  * Press <kbd>F1</kbd> and select `Extensions: Install Extensions`.
  * Search and choose `vscode-less`.

See the [extension installation guide](https://code.visualstudio.com/docs/editor/extension-gallery) for details.

## Usage

Just install the plugin and use it.

## Supported features

  * Code Completion Proposals (variables, mixins) — [description](http://code.visualstudio.com/docs/extensions/language-support#_show-code-completion-proposals)
  * Hover (variables, mixins) — [description](http://code.visualstudio.com/docs/extensions/language-support#_show-hovers)
  * Signature Help (mixins) — [description](http://code.visualstudio.com/docs/extensions/language-support#_help-with-function-and-method-signatures)
  * Code navigation
    * Go to (variables, mixins) — [description](http://code.visualstudio.com/docs/extensions/language-support#_show-definitions-of-a-symbol)
    * Show all All Symbol Definitions in Folder (variables, mixin) — [description](http://code.visualstudio.com/docs/extensions/language-support#_show-all-all-symbol-definitions-in-folder)
  * Visual Studio reference comments: `// <reference path="./variable.less" />`.
  * Import files by `@import "filepath";` from anywhere. Even outside of the open workspace.

## Supported settings

#### less.scannerDepth

  * Type: `number`
  * Default: `30`

The maximum number of nested directories to scan.

#### less.scannerExclude

  * Type: `string[]`
  * Default: `[".git", "**/node_modules", "**/bower_components"]`

List of Glob-patterns for directories that are excluded when scanning.

#### less.scanImportedFiles

  * Type: `boolean`
  * Default: `true`

Allows scan imported files.

#### less.scanImportedFilesDepth

  * Type: `number`
  * Default: `50`

The maximum number of imported files to scan. Prevent an infinite recursion and very deep `@import`.

#### less.implicitlyLabel

  * Type: `string|null`
  * Default: `(implicitly)`

The text of a label that the file imported implicitly. If `null` then label not displayed.

#### less.showErrors

  * Type: `boolean`
  * Default: `false`

Allows to display errors.

#### less.suggestVariables

  * Type: `boolean`
  * Default: `true`

Allows prompt Variables.

#### less.suggestMixins

  * Type: `boolean`
  * Default: `true`

Allows prompt Mixins.

## Questions

**I don't see suggestions in the Less files.**

You must perform several steps:

  * Set `less.showErrors` option in settings of Editor.
  * Restart VS Code.
  * Try to reproduce your problem.
  * Open `Help -> Toggle Developer Tools` and copy errors.
  * Create Issue on GitHub.

## Changelog

See the [Releases section of our GitHub project](https://github.com/mrmlnc/vscode-less/releases) for changelogs for each release version.

## License

This software is released under the terms of the MIT license.
