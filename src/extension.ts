import * as vscode from 'vscode';
import * as fs from "fs";

function seekDir(dirpath: string): string[] {
    let dirs: string[] = [];
    let list = fs.readdirSync(dirpath);
    if (list !== undefined) {
        list.forEach(function (dir) {
            if (!dir.startsWith('.') && fs.statSync(dirpath + "\\" + dir).isDirectory()) {
                dirs.push(dir);
            }
        });
    }
    
    return dirs;
}

export function activate(context: vscode.ExtensionContext) {
    const gopath: string = vscode.workspace.getConfiguration('go').get('gopath') || "";
    if (gopath === "") {
        vscode.window.showErrorMessage('goimport-intellisense: Not found setting of `GOPATH`', 'OK');
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
                    console.log(diff);
                    const prevLine = position.translate(-diff, 0);
                    const prevLineStr = document.lineAt(prevLine).text;
                    console.log("'%s'", prevLineStr);
                    let result = prevLineStr.match(importRegex);
                    if (result !== null) {
                        console.log(result['input']);
                        console.log('this is import statement');
                        found = true;
                        break;
                    } else if (prevLineStr.match(importQuatationRegex) === null) {
                        console.log('invalid import statement: this line must match by import path');
                        return undefined;
                    }
                    diff++;
                }
                if (!found) {
                    console.log('this is not import statement');
                    return undefined;
                }

                const linePrefix = document.lineAt(position).text;
                console.log(linePrefix);
                let result = linePrefix.match(importQuatationRegex);
                if (result === null) {
                    console.log('invalid import path: this line is import path but not must match by import path');
                    return undefined;
                }
                console.log('found " statement');
                console.log(result);
                const importPath = result[4];
                console.log("imported '%s'", importPath);

                let suggets = seekDir(gopath + "\\src\\" + importPath).map(function (dir) {
                    const completionItem = new vscode.CompletionItem(dir, vscode.CompletionItemKind.Folder);
                    completionItem.documentation = new vscode.MarkdownString('_test_ complesion');
                    completionItem.commitCharacters = ['\t'];
                    completionItem.command = { command: 'editor.action.triggerSugget', title: "test" };
                    return completionItem;
                });
                console.log(suggets);

                return suggets;
            }
        }
        , '"', "/"
    );

    context.subscriptions.push(providor1);
}

// this method is called when your extension is deactivated
export function deactivate() { }
