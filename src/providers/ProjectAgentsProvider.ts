/* eslint-disable @typescript-eslint/no-explicit-any */
import * as vscode from "vscode";
import ProjectAgentManager from "../managers/ProjectAgentManager";
import { loadStyle } from "../utils/style";
import { loadScript } from "../utils/scripts";
import { ProjectAgent } from "../types";

export default class ProjectAgentsProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _context: vscode.ExtensionContext;
    private _cancellationToken?: vscode.CancellationToken;
    private _projectAgentManager: ProjectAgentManager;

    constructor(context: vscode.ExtensionContext, projectAgentManager: ProjectAgentManager) {
        this._context = context;
        this._projectAgentManager = projectAgentManager;
        vscode.window.registerWebviewViewProvider('puck.agentsConfig', this );
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView, 
        _context: any, 
        token: vscode.CancellationToken): void | Thenable<void> | never {
        this._view = webviewView;
        this._cancellationToken = token;
        this._view.webview.options = {
            enableScripts: true,
        };
        this._view.webview.html = this._getHtmlForWebview(this._view.webview);
        this._view.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'startAgent':
                    this._projectAgentManager.startAgent(message.agent);
                    break;
                case 'stopAgent':
                    this._projectAgentManager.stopAgent(message.agent);
                    break;
                case 'updateAgent':
                    this._projectAgentManager.saveAgent(message.agent);
                    break;
                case 'deleteAgent':
                    this._projectAgentManager.deleteAgent(message.agent);
                    break;
            }
        });
    }

    public acceptProposedChange(proposedChange: ProjectAgent) {
        this._projectAgentManager.applyProposedChange(proposedChange as any);
        this.refresh();
    }

    public refresh() {
        this._view?.webview.postMessage({
            command: 'updateContent',
            data: {
                diffs: this._projectAgentManager.getAllProposedChanges(),
            },
        });
    }

    // shows the agent in a webview panel
    _getHtmlForWebview(webview: vscode.Webview): string {
        // create a Uri of the extension path
        const style = loadStyle(webview, this._context.extensionPath as any, 'resources/css/diff2html.css');
        const script = loadScript(webview, this._context.extensionPath as any, 'resources/js/diff2html.js');
        const proposedChanges = this._projectAgentManager.getAllProposedChanges();
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            ${style}
            <title>Project Agents</title>
            </head>
            <body>
            <div id="root"></div>
            ${script}
            <script>
            function createDiffWebView(diffs, onClicked) {
                const createChangeElement = (diff, index) => {
                    const changeContainer = document.createElement('div');
                    changeContainer.className = 'change-container';
                    const diffContainer = document.createElement('div');
                    diffContainer.className = 'diff-container';
                    diffContainer.innerHTML = diff;
                    diffContainer.onclick = () => onClicked(index, true);
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
                                diffs: ${JSON.stringify(proposedChanges)}
                            },
                        },
                    };
                    handleMessage(event);
                </script>
            </body>
        </html>
        `;
    }
}
