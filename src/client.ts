'use strict';

import * as path from 'path';

import * as vscode from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

import { ISettings } from './types/settings';

export function activate(context: vscode.ExtensionContext) {
	const serverModule = path.join(__dirname, 'server.js');

	const debugOptions = {
		execArgv: ['--nolazy', '--debug=6004']
	};

	const settings = vscode.workspace.getConfiguration().get<ISettings>('less');

	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	const activeEditor = vscode.window.activeTextEditor;

	const clientOptions: LanguageClientOptions = {
		documentSelector: ['less'],
		synchronize: {
			configurationSection: ['less'],
			fileEvents: vscode.workspace.createFileSystemWatcher('**/*.less')
		},
		initializationOptions: {
			settings,
			activeEditorUri: activeEditor ? activeEditor.document.uri.toString() : null
		}
	};

	const client = new LanguageClient('less-intellisense', 'Less IntelliSense', serverOptions, clientOptions);

	const disposable: vscode.Disposable[] = [];
	disposable[0] = client.start();
	disposable[1] = vscode.window.onDidChangeActiveTextEditor((event) => {
		let uri = null;
		if (event && event.document.uri.scheme === 'file') {
			uri = event.document.uri.toString();
		}

		// We must absorb any errors
		client.sendRequest('changeActiveDocument', { uri }).then(() => null, (err) => {
			if (settings.showErrors) {
				console.log(`[vscode-less]: ${err.name}`);
				console.log(`[vscode-less]: ${err.toString()}`);
			}
		});
	});

	context.subscriptions.push(...disposable);
}
