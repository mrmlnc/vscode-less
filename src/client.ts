'use strict';

import * as path from 'path';

import * as vscode from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

export function activate(context: vscode.ExtensionContext) {
	const serverModule = path.join(__dirname, 'server.js');

	const debugOptions = {
		execArgv: ['--nolazy', '--debug=6004']
	};

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

	const clientOptions: LanguageClientOptions = {
		documentSelector: ['less'],
		synchronize: {
			configurationSection: ['less'],
			fileEvents: vscode.workspace.createFileSystemWatcher('**/*.less')
		},
		initializationOptions: {
			settings: vscode.workspace.getConfiguration('less')
		}
	};

	const client = new LanguageClient('less-intellisense', 'Less IntelliSense', serverOptions, clientOptions);
	const disposable = client.start();

	context.subscriptions.push(disposable);
}
