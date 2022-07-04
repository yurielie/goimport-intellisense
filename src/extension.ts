import * as vscode from 'vscode';
import {existsSync, readdirSync, statSync} from "fs";

function seekDir(dirpath: string): string[] {
    if (!existsSync(dirpath)) {
        return [];
    }
    const list = readdirSync(dirpath) ?? [];
    return list.filter(dir => !dir.startsWith('.') && statSync(dirpath + '\\' + dir).isDirectory());
}

export function activate(context: vscode.ExtensionContext) {
    const gopath: string = vscode.workspace.getConfiguration('go').get('gopath') ?? "";
    const goroot: string = vscode.workspace.getConfiguration('go').get('goroot') ?? "";
    let failed = false;
    if (gopath === "") {
        vscode.window.showErrorMessage('goimport-intellisense: Not found setting of `GOPATH`', 'OK');
        failed = true;
    }
    if (goroot === "") {
        vscode.window.showErrorMessage('goimport-intellisense: Not found setting of `GOROOT`', 'OK');
        failed = true;
    }
    if (failed) {
        return;
    }

    const importRegex = /^import +\($/;
    const importQuatationRegex = /^((\t| +)("(.*)")?)?$/;
    const importProvider = vscode.languages.registerCompletionItemProvider(
        'go',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
                let diff = 1;
                let found = false;
                while (diff <= position.line) {
                    const prevLine = position.translate(-diff, 0);
                    const prevLineStr = document.lineAt(prevLine).text;
                    let result = prevLineStr.match(importRegex);
                    if (result !== null) {
                        found = true;
                        break;
                    } else if (prevLineStr.match(importQuatationRegex) === null) {
                        return undefined;
                    }
                    diff++;
                }
                if (!found) {
                    return undefined;
                }

                const linePrefix = document.lineAt(position).text;
                let result = linePrefix.match(importQuatationRegex);
                if (result === null) {
                    return undefined;
                }
                const input = result[4];

                const gorooDirs = seekDir(goroot + "\\src\\" + input);
                const gorootSuggets = gorooDirs.map(dir => {
                    const completionItem = new vscode.CompletionItem(dir, vscode.CompletionItemKind.Folder);
                    completionItem.documentation = new vscode.MarkdownString('standard library');
                    completionItem.commitCharacters = ['\t'];
                    completionItem.command = { command: 'editor.action.triggerSugget', title: 'goimport-intellisense' };
                    return completionItem;
                });

                const gopathDirs = seekDir(gopath + "\\src\\" + input);
                const gopathSuggets = gopathDirs.map(dir => {
                    const completionItem = new vscode.CompletionItem(dir, vscode.CompletionItemKind.Folder);
                    completionItem.documentation = new vscode.MarkdownString('user library');
                    completionItem.commitCharacters = ['\t'];
                    completionItem.command = { command: 'editor.action.triggerSugget', title: 'goimport-intellisense' };
                    return completionItem;
                });

                return gorootSuggets.concat(gopathSuggets);
            }
        }
        , '"', "/"
    );

    context.subscriptions.push(importProvider);
}

// this method is called when your extension is deactivated
export function deactivate() { }
