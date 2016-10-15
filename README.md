# vscode-less

> Less intellisense for Variables and Mixins in all Less files.

> **Disclaimer**
>
> This is a preview release that may contain errors. This plugin works fine on my machine (SSD) with 500+ Bootstrap files (3.3.7).
>
> Please read this README file.

## Install

Plugin installation is performed in several stages:

  * Press <kbd>F1</kbd> and select `Extensions: Install Extensions`.
  * Search and choose `vscode-less`.

See the [extension installation guide](https://code.visualstudio.com/docs/editor/extension-gallery) for details.

## Usage

Just install the plugin and use it.

## Supported features

**Intellisense for Variables**

![image](https://cloud.githubusercontent.com/assets/7034281/19390685/d4237550-9231-11e6-88d3-852d47bc1ae5.png)

**Hover for Variables**

![image](https://cloud.githubusercontent.com/assets/7034281/19390703/ec3310d8-9231-11e6-93fa-025c68a2dee7.png)

**Intellisense for Mixins**

![image](https://cloud.githubusercontent.com/assets/7034281/19390713/fa03fe2a-9231-11e6-8286-ae99669963d1.png)

**Hover for Mixins**

![image](https://cloud.githubusercontent.com/assets/7034281/19390728/065f0138-9232-11e6-967f-497ceb57ecf9.png)

## Supported settings

**less.scannerDepth**

  * Type: `number`
  * Default: `30`

Number of max directory nesting to be scanned.

**less.directoryFilter**

  * Type: `string[]`
  * Default: `["!.git", "!**/node_modules", "!**/bower_components"]`

List of Glob-patterns for directories that are excluded when scanning.

**less.scanImportedFiles**

  * Type: `boolean`
  * Default: `true`

Allows scan imported files.

**less.scanImportedFilesDepth**

  * Type: `number`
  * Default: `50`

The maximum number of imported files to scan. Prevent an infinite recursion and very deep `@import`.

**less.showErrors**

  * Type: `boolean`
  * Default: `false`

Controls the display of errors.

**less.suggestVariables**

  * Type: `boolean`
  * Default: `true`

Controls the suggest of Variables.

**less.suggestMixins**

  * Type: `boolean`
  * Default: `true`

Controls the suggest of Mixins.

## What's next?

  * **[important]** Support read files by `@import`.
  * Support for `/// <reference path="file.less" />`.

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
