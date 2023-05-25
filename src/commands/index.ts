import * as vscode from "vscode";

import SetOpenAIKeyCommand from "./SetOpenAIKeyCommand";
import ProjectAgentsCommand from "./ProjectAgentsCommand";
import { StartAgentsCommand } from "./StartAgentsCommand";
import { StopAgentsCommand } from "./StopAgentsCommand";
import { ExecuteAgentCommand } from "./ExecuteAgentCommand";
import { CreateAgentCommand } from "./CreateAgentCommand";

import FooterContent from "../utils/FooterContent";
import ProjectAgentManager from "../managers/ProjectAgentManager";

export function activate(context: vscode.ExtensionContext) {

    // create the project agent manager
    const projectAgentManager = new ProjectAgentManager(
        context, 
        (fileName: string) => FooterContent.getInstance().setText(`Processing: ${fileName}`), 
        (agent: any) => FooterContent.getInstance().setText(`Agent updated: ${agent.name}`)
    );

    // SET OPENAI KEY
    new SetOpenAIKeyCommand("setOpenAIKey", "Update OpenAI Key", context);

    // PROJECT AGENTS
    new CreateAgentCommand("createAgent", "Create Agent", context, projectAgentManager);
    new ProjectAgentsCommand("projectAgents", "Project Agents", context, projectAgentManager);
    new StartAgentsCommand("startAgents", "Start Agents", context, projectAgentManager);
    new StopAgentsCommand("stopAgents", "Stop Agents", context, projectAgentManager);
    new ExecuteAgentCommand("runAgent", "Run an Agent", context, projectAgentManager);

}


export function deactivate() { }