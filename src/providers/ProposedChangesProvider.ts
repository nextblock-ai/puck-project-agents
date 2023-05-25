/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as vscode from 'vscode';
import { ProposedChange } from '../types';
import DiffSVGMaker from '../utils/DiffSVGMaker';
import { loadStyle } from '../utils/style';
import { loadScript } from '../utils/scripts';

export default class ProposedChangesProvider implements vscode.TreeDataProvider<ProposedChange> {

    // fired when the tree changes
    proposedChanges: ProposedChange[];
    svgs: string[];
    context: vscode.ExtensionContext;
    private _onDidChangeTreeData: vscode.EventEmitter<ProposedChange | undefined | void> = new vscode.EventEmitter<ProposedChange | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<ProposedChange | undefined | void> = this._onDidChangeTreeData.event;
    
    // constructor - pass in the proposed changes
    constructor(context: vscode.ExtensionContext, private _proposedChanges: ProposedChange[]) {
        this.proposedChanges = _proposedChanges;
        this.context = context;
        this.svgs = this.proposedChanges.map((change) => {
            const diffSVGMaker = new DiffSVGMaker(context.extensionUri, change, {
                darkMode: true
            });
            return diffSVGMaker.createSVG();
        });
        vscode.window.registerWebviewViewProvider('proposedChanges', this );
    }

    // get the tree item
    getTreeItem(element: ProposedChange): vscode.TreeItem {
        const idx = this.proposedChanges.findIndex((change) => change === element);
        if (idx !== -1) {
            const treeItem = new vscode.TreeItem(
                element.agent && element.agent.name || '', // Set the label to the change title
                vscode.TreeItemCollapsibleState.None
            );
            treeItem.command = {
                command: 'puck.proposedChangesView',
                title: 'View Proposed Change',
                arguments: [element]
            };
            treeItem.iconPath = vscode.Uri.parse(this.svgs[idx]); // Set the iconPath to the SVG data URI
            return treeItem;
        } else {
            return new vscode.TreeItem('', vscode.TreeItemCollapsibleState.None);
        }
    }
    
    // get the children of the tree
    getChildren(element?: ProposedChange): Thenable<ProposedChange[]> {
        if (element) {
            // If an element is provided, return an empty array since we don't have children for proposed changes
            return Promise.resolve([]);
        } else {
            // If no element is provided, return the root proposed changes
            return Promise.resolve(this.proposedChanges);
        }
    }

    // refresh the tree
    resolveWebviewView(
        webviewView: vscode.WebviewView, 
        context: any, 
        _token: vscode.CancellationToken): void | Thenable<void> {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
        };
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'acceptProposedChange':
                    this.acceptProposedChange(message.proposedChange);
                    break;
                case 'rejectProposedChange':
                    this.rejectProposedChange(message.proposedChange);
                    break;
            }
        });
    }

    // accept or reject a proposed change
    public acceptProposedChange(proposedChange: ProposedChange) {
        //
    }

    // accept or reject a proposed change
    public rejectProposedChange(proposedChange: ProposedChange) {
        //
    }

    // get the html for the webview
    getHtmlForWebview(webview: any): string {
        // create a Uri of the extension path
        const style = loadStyle(webview, this.context.extensionPath as any, 'resources/css/diff2html.css');
        const script = loadScript(webview, this.context.extensionPath as any, 'resources/js/diff2html.js');
        return `<html lang="en" sandbox="allow-scripts allow-same-origin">
        <head>
        <title>Changes</title>
        ${style}
        </head>
        <body>
        ${script}
        <script id="rendered-js" >
            function createDiffWebView(diffs, onClicked) {
                const createChangeElement = (diff, index) => {
                    const changeContainer = document.createElement('div');
                    changeContainer.className = 'change';
                    const changeTitle = document.createElement('div');
                    changeTitle.className = 'change-title';
                    changeTitle.textContent = \`Change \${index + 1}: \${diff.title}\`;
                    changeContainer.appendChild(changeTitle);
                    const buttons = document.createElement('div');
                    buttons.className = 'buttons';
                    changeContainer.appendChild(buttons);
                    const acceptBtn = document.createElement('button');
                    acceptBtn.className = 'accept-btn';
                    acceptBtn.textContent = 'Accept';
                    acceptBtn.onclick = () => onClicked(index, true);
                    buttons.appendChild(acceptBtn);
                    const rejectBtn = document.createElement('button');
                    rejectBtn.className = 'reject-btn';
                    rejectBtn.textContent = 'Reject';
                    rejectBtn.onclick = () => onClicked(index, false);
                    buttons.appendChild(rejectBtn);
                    const diffContainer = document.createElement('div');
                    diffContainer.innerHTML = Diff2Html.getPrettyHtml(diff.data, {
                        inputFormat: 'diff',
                        showFiles: false,
                        matching: 'lines',
                        outputFormat: 'side-by-side',
                    });
                    changeContainer.appendChild(diffContainer);
                    return changeContainer;
                };
                const webViewContent = document.createElement('div');
                diffs.forEach((diff, index) => {
                    webViewContent.appendChild(createChangeElement(diff, index));
                });
                return webViewContent;
            }
            const sendApplyDiffToExtension = (diffIndex, accepted) => {
                window.postMessage({
                    command: 'applyDiff',
                    diffIndex, accepted,
                }, '*');
            };
            function handleMessage(event) {
                if (event.data.command === 'diffsAdded') {
                    const messages = event.data.diffs;
                    // add the new diffs to the UI
                    messages.forEach((diff) => {
                        const messageCard = createChangeElement(diff);
                        document.body.appendChild(messageCard);
                    });
                }
            }
            // receive messages from extension and process them
            window.addEventListener('message', (event) => {
                const message = event.data;
                switch (message.command) {
                    case 'updateContent':
                        // remove the old webview and create a new one with the updated content
                        let diffs = message.data.diffs;
                        let webView = createDiffWebView(diffs, onClicked);
                        document.body.removeChild(document.body.lastChild);
                        document.body.appendChild(webView);
                        break;
                    case 'initializeContent':
                        // Update the React app state with the initial content
                        diffs = message.data.diffs;
                        webView = createDiffWebView(diffs, onClicked);
                        document.body.appendChild(webView);
                        break;
                }
            });
            const onClicked = (diffIndex, accepted) => {
                sendApplyDiffToExtension({
                    diffIndex,
                    accepted,
                });
                console.log(\`Diff \${diffIndex + 1} was \${accepted ? 'accepted' : 'rejected'}\`);
            };
        
            const event = {
                data: {
                    command: 'initializeContent',
                    data: {
                        diffs: ${JSON.stringify(this.proposedChanges)}
                    },
                },
            };
            handleMessage(event);    
        </script>
        </body>
        </html>
        `;
    }
    
    // refresh the tree
    refresh(proposedChanges: ProposedChange[]): void {
        this.proposedChanges = proposedChanges;
        this._onDidChangeTreeData.fire();
    }

    // dispose the tree
    public dispose() {
        this._onDidChangeTreeData.dispose();
    }
}
