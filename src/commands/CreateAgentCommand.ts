/* eslint-disable @typescript-eslint/no-explicit-any */
import * as vscode from 'vscode';
import { Command } from '../utils/Command';
import ProjectAgentManager from '../managers/ProjectAgentManager';
import ProjectCommanderSPS from '../sps/ProjectCommanderSPS';
import { ProjectAgent } from '../types';

const org = 'puck.projectAgents';

export class CreateAgentCommand extends Command {
    constructor(commandId: string, title: string, context: vscode.ExtensionContext, public projectAgentManager: ProjectAgentManager) {
        super(`${org}.${commandId}`, title, context);
    }
    async execute() {
        // Agent Selection and Configuration
        const selectedAgentName = await vscode.window.showInputBox({ prompt: 'Enter a name for the agent' });
        const selectedAgentPrompt = await vscode.window.showInputBox({ prompt: 'Enter a prompt (i.e. fix any bugs you encounter in the code)' });
        const selectedAgentFilter = await vscode.window.showInputBox({ prompt: 'Enter a file filter (i.e. .* for all files)' });
        // Save configuration data
        const configurationData: ProjectAgent = {
            id: await this.projectAgentManager.getAgentHash(selectedAgentName || ''),
            name: selectedAgentName || '',
            description: selectedAgentPrompt || '',
            prompt: selectedAgentPrompt || '',
            sps: new ProjectCommanderSPS(this.context, selectedAgentPrompt || ''),
            agentSettings: {},
            fileFilter: selectedAgentFilter && [selectedAgentFilter] || ['.*'],
            proposedChanges: []
        };
        // we save the agent configuration data to the global state
        // so that it can be accessed from other commands
        this.projectAgentManager.saveAgent(configurationData as any);
    }
}
