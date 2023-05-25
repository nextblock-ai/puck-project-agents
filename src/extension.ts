import * as vscode from 'vscode';
import * as commands from './commands';

export function activate(context: vscode.ExtensionContext) {

  commands.activate(context);

}

export function deactivate() {}