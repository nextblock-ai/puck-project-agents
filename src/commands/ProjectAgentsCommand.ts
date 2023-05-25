/* eslint-disable no-useless-escape */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { Command } from "../utils/Command";
import ProjectCommanderSPS from "../sps/ProjectCommanderSPS";

import { ProjectAgent, ProposedChange } from "../types"; 

import ProjectAgentManager from "../managers/ProjectAgentManager";

const org = "puck.projectAgents";

export default class ProjectAgentsCommand extends Command {
    projectCommander?: ProjectCommanderSPS;
    projectAgentManager: ProjectAgentManager;

    constructor(commandId: string, title: string, context: vscode.ExtensionContext, projectAgentManager: ProjectAgentManager) {
        super(`${org}.${commandId}`, title, context);
        this.projectAgentManager = projectAgentManager;
    }

    async execute() {
        // Focus on the Proposed Changes view
        await vscode.commands.executeCommand('workbench.view.extension.proposedChanges');
        
        // Focus on the Agents Configuration view
        await vscode.commands.executeCommand('workbench.view.extension.agentConfig');
    
        // Show a message box to the user
        vscode.window.showInformationMessage('Project Agents online!');
    }

    protected onDidRegister(): void {
        //
    }
}
