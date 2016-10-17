'use strict';

import {
	createConnection,
	IConnection,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
	TextDocument,
	TextDocumentPositionParams,
	InitializeParams,
	InitializeResult,
	Files
} from 'vscode-languageserver';

import { IServerDocument } from './types/symbols';
import { ISettings } from './types/settings';

import { getCurrentWord, getTextBeforePosition } from './utils/string';
import { getCacheStorage, invalidateCacheStorage } from './services/cache';
import { doScanner } from './services/scanner';

import { doCompletion } from './providers/completion';
import { doHover } from './providers/hover';
import { doSignatureHelp } from './providers/signatureHelp';

// Cache Storage
let cache = getCacheStorage();

// Common variables
let workspaceRoot: string;
let settings: ISettings;

// Create a connection for the server
const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();

/**
 * Returns IServerDocument object.
 */
function makeServerDocument(docs: TextDocuments, documentPosition: TextDocumentPositionParams): IServerDocument {
	const document: TextDocument = documents.get(documentPosition.textDocument.uri);

	// Document information
	const docPath = Files.uriToFilePath(document.uri);
	const offset = document.offsetAt(documentPosition.position);

	return {
		textDocument: document,
		path: docPath,
		offset,
		word: getCurrentWord(document.getText(), offset),
		textBeforeWord: getTextBeforePosition(document.getText(), offset)
	};
}

// Drop cache for closed files
documents.onDidClose((event) => {
	const fsPath = Files.uriToFilePath(event.document.uri);

	cache.drop(fsPath);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites
connection.onInitialize((params: InitializeParams): Promise<InitializeResult> => {
	workspaceRoot = params.rootPath;
	settings = params.initializationOptions.settings;

	return doScanner(workspaceRoot, cache, settings).then(() => {
		return <InitializeResult>{
			capabilities: {
				textDocumentSync: documents.syncKind,
				completionProvider: {
					resolveProvider: false,
					triggerCharacters: ['.', '#', '@', '{']
				},
				signatureHelpProvider: {
					triggerCharacters: ['(', ',', ';']
				},
				hoverProvider: true
			}
		};
	}).catch((err) => {
		if (settings.showErrors) {
			connection.window.showErrorMessage(err);
		}
	});
});

// Update settings
connection.onDidChangeConfiguration((params) => {
	settings = params.settings.less;
});

connection.onCompletion((textDocumentPosition) => {
	const doc = makeServerDocument(documents, textDocumentPosition);
	if (!doc.path) {
		return;
	}

	return doScanner(workspaceRoot, cache, settings, doc).then((collection) => {
		// Cache invalidation
		invalidateCacheStorage(cache, collection.symbols);

		return doCompletion(doc.path, doc.word, collection.symbols, settings);
	}).catch((err) => {
		if (settings.showErrors) {
			connection.window.showErrorMessage(err);
		}
	});
});

connection.onHover((textDocumentPosition) => {
	const doc = makeServerDocument(documents, textDocumentPosition);
	if (!doc.path) {
		return;
	}

	return doScanner(workspaceRoot, cache, settings, doc).then((collection) => {
		// Cache invalidation
		invalidateCacheStorage(cache, collection.symbols);

		return doHover(doc.path, collection.symbols, collection.node);
	}).catch((err) => {
		if (settings.showErrors) {
			connection.window.showErrorMessage(err);
		}
	});
});

connection.onSignatureHelp((textDocumentPosition) => {
	const doc = makeServerDocument(documents, textDocumentPosition);

	return doScanner(workspaceRoot, cache, settings, doc).then((collection) => {
		// Cache invalidation
		invalidateCacheStorage(cache, collection.symbols);

		return doSignatureHelp(doc, collection.symbols);
	}).catch((err) => {
		if (settings.showErrors) {
			connection.window.showErrorMessage(err);
		}
	});
});

// Dispose cache
connection.onShutdown(() => {
	cache.dispose();
});

// Listen on the connection
connection.listen();
