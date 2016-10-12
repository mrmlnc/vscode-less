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

import { getCacheStorage } from './providers/cache';
import { parse } from './parser/parser';
import { doCompletion } from './providers/completion';


// Cache Storage
let cache = getCacheStorage();

// Common variables
let workspaceRoot: string;

function getCurrentWord(document: TextDocument, offset: number) {
	let i = offset - 1;
	let text = document.getText();
	while (i >= 0 && ' \t\n\r":{[()]},'.indexOf(text.charAt(i)) === -1) {
		i--;
	}
	return text.substring(i + 1, offset);
}

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
		}
	};
});

connection.onCompletion((textDocumentPosition) => {
	const document: TextDocument = documents.get(textDocumentPosition.textDocument.uri);
	const offset = document.offsetAt(textDocumentPosition.position);

	const currentUri = Files.uriToFilePath(document.uri);
	const currentWord = getCurrentWord(document, offset);

	return parse(document, offset, cache).then((symbolsList) => {
		return doCompletion(currentUri, currentWord, symbolsList);
	});
});

// connection.onHover((textDocumentPosition) => {
// 	const document: TextDocument = documents.get(textDocumentPosition.textDocument.uri);
// 	return provideHover(document, textDocumentPosition.position, {});
// });

// Listen on the connection
connection.listen();
