import ProjectAgentManager from "../managers/ProjectAgentManager";
import FooterContent from "../utils/FooterContent";
import { Command } from "../utils/Command";
import * as vscode from 'vscode';

const org = 'puck.projectAgents';

export class ExecuteAgentCommand extends Command {
    constructor(commandId: string, title: string, context: vscode.ExtensionContext, public projectAgentManager: ProjectAgentManager) {
        super(`${org}.${commandId}`, title, context);
    }
    
    async execute(): Promise<void> {
        // pick one of the existing agents
        const selectedAgent = await vscode.window.showQuickPick(this._projectAgentQuickPickItems(), {
            placeHolder: 'Select an agent to execute',
            ignoreFocusOut: true,
        });
        if (!selectedAgent) { return; }
        
        // get the agent configuration data
        const agent = this.projectAgentManager.getAgentByName(selectedAgent.label);
        if (!agent) { return; }

        // execute the agent
        await this.projectAgentManager.runAgentOnChangedFiles(agent.id);

        // show the proposed changes
        await vscode.commands.executeCommand('workbench.view.extension.proposedChanges');
        // show the agent configuration
        await vscode.commands.executeCommand('workbench.view.extension.agentConfig');
    }
    
    _projectAgentQuickPickItems() {
        return this.projectAgentManager.loadAllAgents().map((agent) => {
            return {
                label: agent.name,
                description: agent.description,
                detail: agent.prompt,
            };
        });
    }
}
