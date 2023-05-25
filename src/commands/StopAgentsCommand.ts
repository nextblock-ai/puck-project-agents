import ProjectAgentManager from "../managers/ProjectAgentManager";
import FooterContent from "../utils/FooterContent";
import { Command } from "../utils/Command";
import * as vscode from 'vscode';

const org = 'attila.projectAgents';

export class StopAgentsCommand extends Command {
    constructor(commandId: string, title: string, context: vscode.ExtensionContext, public projectAgentManager: ProjectAgentManager) {
        super(`${org}.${commandId}`, title, context);
    }
    async execute() {
        // Implement agent stop functionality here
        vscode.window.showInformationMessage('Agent stopped');
        FooterContent.getInstance().setStatus('ready');
        this.projectAgentManager.stopAgentScan();
    }
}
