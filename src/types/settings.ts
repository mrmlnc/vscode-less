'use strict';

export interface ISettings {
	// Scanner
	scannerDepth: number;
	directoryFilter: string[];

	// Display
	showErrors: boolean;

	// Suggestions
	suggestVariables: boolean;
	suggestMixins: boolean;
}
