'use strict';

import {
	createConnection,
	IConnection,
	IPCMessageReader,
	IPCMessageWriter,
	TextDocuments,
	TextDocument,
	InitializeParams,
	InitializeResult,
	Files
} from 'vscode-languageserver';

import { parse } from './parser/parser';
import { getCurrentWord } from './utils/string';

import { getCacheStorage } from './providers/cache';
import { doCompletion } from './providers/completion';
import { doHover } from './providers/hover';


// Cache Storage
let cache = getCacheStorage();

// Common variables
let workspaceRoot: string;

// Create a connection for the server
const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

// Create a simple text document manager. The text document manager
// supports full document sync only
const documents: TextDocuments = new TextDocuments();

documents.onDidClose((event) => {
	const fsUri = Files.uriToFilePath(event.document.uri);

	cache.drop(fsUri);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites
connection.onInitialize((params: InitializeParams): InitializeResult => {
	workspaceRoot = params.rootPath;

	return <InitializeResult>{
		capabilities: {
			textDocumentSync: documents.syncKind,
			completionProvider: {
				resolveProvider: false,
				triggerCharacters: ['.', '#', '@']
			},
			hoverProvider: true
		}
	};
});

connection.onCompletion((textDocumentPosition) => {
	const document: TextDocument = documents.get(textDocumentPosition.textDocument.uri);
	const text = document.getText();
	const offset = document.offsetAt(textDocumentPosition.position);

	const currentUri = Files.uriToFilePath(document.uri);
	const currentWord = getCurrentWord(text, offset);

	return parse(document, offset, cache).then((resources) => {
		return doCompletion(currentUri, currentWord, resources.symbols);
	}).catch(() => {
		// silent
	});
});

connection.onHover((textDocumentPosition) => {
	const document: TextDocument = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);

	const currentUri = Files.uriToFilePath(document.uri);

	return parse(document, offset, cache).then((resources) => {
		return doHover(currentUri, resources.symbols, resources.hoverNode);
	}).catch(() => {
		// silent
	});
});

// Listen on the connection
connection.listen();
