'use strict';

export interface ISettings {
	// Scanner
	scannerDepth: number;
	directoryFilter: string[];
	scanImportedFiles: boolean;
	scanImportedFilesDepth: number;

	// Display
	showErrors: boolean;

	// Suggestions
	suggestVariables: boolean;
	suggestMixins: boolean;
}
