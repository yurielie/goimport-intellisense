import * as vscode from 'vscode';
import * as fs from "fs";

function seekDir(dirpath: string): string[] {
    let list = fs.readdirSync(dirpath) ?? [];
    return list.filter(dir => !dir.startsWith('.') && fs.statSync(dirpath + '\\' + dir).isDirectory());
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

    const providor1 = vscode.languages.registerCompletionItemProvider(
        'go',
        {

            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {

                // check this line in import statement
                const importRegex = /^import +\($/;
                const importQuatationRegex = /^((\t| +)("(.*)")?)?$/;
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
                const importPath = result[4];

                // const gorootSrc = seekDir(goroot + "\\src\\" + importPath);
                // let gorootSuggets = gorootSrc.map(dir => {
                //     const completionItem = new vscode.CompletionItem(dir, vscode.CompletionItemKind.Folder);
                //     completionItem.documentation = new vscode.MarkdownString('standard library');
                //     completionItem.commitCharacters = ['\t'];
                //     completionItem.command = { command: 'editor.action.triggerSugget', title: 'goimport-intellisense' };
                //     return completionItem;
                // });

                const gopathSrc = seekDir(gopath + "\\src\\" + importPath);
                let gopathSuggets = gopathSrc.map(dir => {
                    const completionItem = new vscode.CompletionItem(dir, vscode.CompletionItemKind.Folder);
                    completionItem.documentation = new vscode.MarkdownString('user library');
                    completionItem.commitCharacters = ['\t'];
                    completionItem.command = { command: 'editor.action.triggerSugget', title: 'goimport-intellisense' };
                    return completionItem;
                });

                // const resultList = gorootSuggets.concat(gopathSuggets);
                // console.log(resultList);
                // return resultList;
                return gopathSuggets;
            }
        }
        , '"', "/"
    );

    context.subscriptions.push(providor1);
}

// this method is called when your extension is deactivated
export function deactivate() { }
