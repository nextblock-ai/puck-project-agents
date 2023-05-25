import ProjectAgentManager from "../managers/ProjectAgentManager";
import FooterContent from "../utils/FooterContent";
import { Command } from "../utils/Command";
import * as vscode from 'vscode';

const org = 'puck.projectAgents';

export class StartAgentsCommand extends Command {
    constructor(commandId: string, title: string, context: vscode.ExtensionContext, public projectAgentManager: ProjectAgentManager) {
        super(`${org}.${commandId}`, title, context);
    }
    async execute(): Promise<void> {
        // Implement agent start functionality here
        vscode.window.showInformationMessage('Agent started');
        FooterContent.getInstance().setStatus('active');
        this.projectAgentManager.startAgentScan();
    }
}
