/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ProjectCommanderSPS from "../sps/ProjectCommanderSPS";
import * as vscode from "vscode";
import * as path from 'path';
import sha256 from 'sha256';
import { createHash } from 'crypto';

import ProposedChangesProvider from "../providers/ProposedChangesProvider";
import ProjectAgentsProvider from "../providers/ProjectAgentsProvider";

import fs from 'fs';
import { ProjectAgent, ProposedChange } from "../types";


export default class ProjectAgentManager {
    private context: vscode.ExtensionContext;
    private agents?: ProjectAgent[];
    public proposedChangesProvider?: ProposedChangesProvider;
    public agentsProvider?: ProjectAgentsProvider;
    private serviceInterval: NodeJS.Timeout | undefined;

    constructor(
        context: vscode.ExtensionContext, 
        public onProcessingFile: (file: string) => void, 
        public onAgentChanged: (agent: ProjectAgent) => void) {

        this.context = context;
        this.agents = this.loadAllAgents();
        
        this.proposedChangesProvider = new ProposedChangesProvider(context, this.getAllProposedChanges() as any); 
        this.agentsProvider = new ProjectAgentsProvider(context, this);
    }

    public loadAllAgents(): ProjectAgent[] {
        try {
            // Get the project folder
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (!workspaceFolder) { return [];  }

            // Get the agents.json file
            const agentsFile = path.join(workspaceFolder, 'agents.json');            
            let stat;
            // Check if the file exists
            try {  stat = fs.lstatSync(agentsFile); } 
            catch (err) { return [];  }
            
            // Read the file contents
            const agentsFileContents = fs.readFileSync(agentsFile);
            const agentsFileContentsStr = new TextDecoder().decode(agentsFileContents);
            
            // Parse the file contents
            const agents = JSON.parse(agentsFileContentsStr);
            return agents;
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error loading agents: ${error.message}`);
            return [];
        }
    }
    
    // Starts an agent by setting up its SPS and starting the agent scan
    public startAgent(agent: ProjectAgent): void {
        if(agent.sps) {
            return;
        }
        agent.sps = new ProjectCommanderSPS(this.context, agent.prompt);
        this.startAgentScan();
        vscode.window.showInformationMessage(`Agent ${agent.name} started.`);
    }

    // Stops an agent by removing its SPS and stopping the agent scan
    public stopAgent(agent: ProjectAgent): void {
        if(!agent.sps) {
            return;
        }
        agent.sps = undefined;
        this.stopAgentScan();
        vscode.window.showInformationMessage(`Agent ${agent.name} stopped.`);
    }

    updateProposedChangesProvider() {
        this.proposedChangesProvider && this.proposedChangesProvider.refresh(this.getAllProposedChanges() as any);
    }

    updateProjectAgentsProvider() {
        this.agentsProvider && this.agentsProvider.refresh();
    }

    public getAgentById(agentId: string): ProjectAgent | undefined {
        return this.agents && this.agents.find((agent: ProjectAgent) => agent.id === agentId);
    }

    public getAgentByName(agentName: string): ProjectAgent | undefined {
        return this.agents && this.agents.find((agent: ProjectAgent) => agent.name === agentName);
    }

    async getAgentHash(agent: string) {
        const salt = new Date().toISOString().slice(0, 10);
        Buffer.from(sha256('bacon')).toString('base64'); 
        return createHash('sha256').update(salt + agent).digest('base64');
    }

    public getAgentIndex(agentId: string): number {
        return this.agents && this.agents.findIndex(agent => agent.id === agentId) || 0;
    }

    public saveAgent(agent: ProjectAgent): void {
        if(!this.agents) {
            this.agents = [];
        }
        const agentIndex = this.getAgentIndex(agent.id);
        if (agentIndex > -1) {
            const sps = this.agents[agentIndex].sps;
            this.agents[agentIndex] = agent;
            this.agents[agentIndex].sps = sps;
        } else {
            agent.sps = new ProjectCommanderSPS(this.context, agent.prompt);
            this.agents.push(agent);
        }

        // Save all agents without SPS
        this.saveAllAgents(this.agents.map(agent => this.removeAgentSPS(agent)));
    }

    public deleteAgent(agentId: string): void {
        if(!this.agents) {
            return;
        }
        const agentIndex = this.getAgentIndex(agentId);
        if (agentIndex > -1) {
            this.agents.splice(agentIndex, 1);
        }
        this.saveAllAgents(this.agents);
    }

    public getProposedChangesByAgentId(agentId: string): ProposedChange[] {
        const agent = this.getAgentById(agentId);
        return agent ? agent.proposedChanges : [];
    }

    public getAllProposedChanges(): ProposedChange[] {
        if(!this.agents) { return []; }
        return this.agents.reduce((acc, agent) => acc.concat(agent.proposedChanges as any), []);
    }

    public async runAgentOnFile(agentId: string, file: string): Promise<ProposedChange[]> {
        const agent = this.getAgentById(agentId);
        if(!agent) {
            return [];
        }
        if(!agent.sps) {  agent.sps = new ProjectCommanderSPS(this.context, agent.prompt); }
        this.onProcessingFile(file);
        const response = await agent.sps.handleUserRequest(file);
        const proposedChanges: ProposedChange[] = [];
        if (response) {
            response.forEach((change: ProposedChange) => {
                //change.agent = agent;
                proposedChanges.push(change);
            });
        }
        return proposedChanges;
    }

    public async runAgentsOnChangedFiles() {
        // Get the workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspaceFolder) { return; }
        // Get all files in the workspace folder
        const projectFiles = await this.getAllFiles(workspaceFolder);
        // Iterate through each file
        for (const file of projectFiles) {
            const matchingAgents = this.getMatchingAgents(file);
            // Iterate through each agent
            for (const agent of matchingAgents) {
                // Run the agent on the file
                const proposedChanges = await this._runAgentOnFile(agent, file);
                // Add the proposed changes to the agent
                if(proposedChanges) { 
                    if(!agent.proposedChanges) { agent.proposedChanges = []; }
                    agent.proposedChanges = agent.proposedChanges.concat(proposedChanges);
                }
            }
        }
    }

    public async runAgentOnChangedFiles(agentId: string) {
        // Get the workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspaceFolder) { return; }
        // Get all files in the workspace folder
        const projectFiles = await this.getAllFiles(workspaceFolder);
        // Iterate through each file
        const projectAgent = this.getAgentById(agentId);
        for (const file of projectFiles) {
            const matchingAgents = this.getMatchingAgents(file);
            // Iterate through each agent
            for (const agent of matchingAgents) {
                // Run the agent on the file
                const proposedChanges = this._runAgentOnFile(agent, file);
                if(proposedChanges) { 
                    if(!agent.proposedChanges) { agent.proposedChanges = []; }
                    agent.proposedChanges = agent.proposedChanges.concat(proposedChanges as any);
                }
            }
        }
    }

    // recursively get all files in the workspace folder
    public async getAllFiles (dirPath: string, arrayOfFiles: string[] = []): Promise<string[]> {
        const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(dirPath));
        for (const file of files) {
            // skip .git folder, node_modules folder, and .vscode folder
            if (file[0] === '.git' || file[0] === 'node_modules' || file[0] === '.vscode') {
                continue;
            }
            const filePath = path.join(dirPath, file[0]);
            if (file[1] === vscode.FileType.File) {
                arrayOfFiles.push(filePath);
            } else if (file[1] === vscode.FileType.Directory) {
                arrayOfFiles = await this.getAllFiles(filePath, arrayOfFiles);
            }
        }
        return arrayOfFiles;
    };

    public async _runAgentOnFile(agent: ProjectAgent, file: string) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspaceFolder) { return; }
        // Check if the file has changed since the last scan
        // You can store the last modified time in the context.globalState
        const lastModifiedKey = `lastModified:${file}`;
        const fileStat = await vscode.workspace.fs.stat(vscode.Uri.file(file));
        const lastModified = this.context.globalState.get<number>(lastModifiedKey) || 0;
        if (fileStat.mtime > lastModified) {
            this.context.globalState.update(lastModifiedKey, fileStat.mtime);
            const proposedChanges = await this.runAgentOnFile(agent.id, file);
            this.storeProposedChanges(agent.id, proposedChanges);
            vscode.window.showInformationMessage(`New proposed change from agent: ${agent.name}`);
            return proposedChanges;
        }
        return [];
    }

    public startAgentScan() {
        if(this.serviceInterval) { return; }
        const scanInterval = 10000; // Set the desired interval in milliseconds (e.g., 10000 ms = 10 seconds)
        this.serviceInterval = setInterval(() => {
          // Call the function to scan files and run agents
            this.runAgentsOnChangedFiles();
        }, scanInterval);
    }

    public stopAgentScan() {
        if(!this.serviceInterval) { return; }
        clearInterval(this.serviceInterval);
        this.serviceInterval = undefined;
    }

    public getMatchingAgents(file: string): ProjectAgent[] {
        const matchesFilter = (filter: string) => {
            const regex = new RegExp(filter);
            return regex.test(file);
        };
        const agents = this.loadAllAgents();
        const matchingAgents: ProjectAgent[] = [];
        for (let agentIndex = 0; agentIndex < agents.length; agentIndex++) {
            const agent = agents[agentIndex];
            if(agent.fileFilter.some(matchesFilter) || agent.fileFilter.some((filter: any) => file.endsWith(filter))) {
                matchingAgents.push(agent);
            }
        }
        return matchingAgents;
    }

    public applyProposedChange(proposedChange: ProposedChange): void {
        // Implementation of applying a proposed change
        const oldUri = vscode.Uri.file(proposedChange.oldFileName);
        const newUri = vscode.Uri.file(proposedChange.newFileName);
        const oldText = new vscode.Range(
            new vscode.Position(proposedChange.oldFileStart, 0),
            new vscode.Position(proposedChange.oldFileStart + proposedChange.oldFileLines, 0)
        );
        const newText = proposedChange.changes.join('\n');
        const workspaceEdit = new vscode.WorkspaceEdit();
        workspaceEdit.delete(oldUri, oldText);
        workspaceEdit.insert(newUri, new vscode.Position(proposedChange.newFileStart, 0), newText);
        vscode.workspace.applyEdit(workspaceEdit);
        vscode.window.showInformationMessage(`Applied proposed change to ${proposedChange.newFileName}`);
    }

    public rejectProposedChange(proposedChange: ProposedChange): void {
        vscode.window.showInformationMessage(`Rejected proposed change to ${proposedChange.newFileName}`);
    }

    public storeProposedChanges(agentId: string, proposedChanges: ProposedChange[]): void {
        const agent = this.getAgentById(agentId);
        if (!agent || !this.agents) { return; }

        agent.proposedChanges = agent.proposedChanges.concat(proposedChanges);
        this.saveAllAgents(this.agents.map(agent => this.removeAgentSPS(agent)));
        this.updateProposedChangesProvider();
    }

    public saveAllAgents(agents: ProjectAgent[]): void {
        try {
            this.agents = agents;
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (!workspaceFolder) {
                return;
            }
            const agentsFile = path.join(workspaceFolder, 'agents.json');
            vscode.workspace.fs.writeFile(vscode.Uri.file(agentsFile), Buffer.from(JSON.stringify(agents, null, 4), 'utf8'));
        } catch (error: any) {
            vscode.window.showErrorMessage(`Error saving agents: ${error.message}`);
        }
    }

    private removeAgentSPS(agent: ProjectAgent): ProjectAgent {
        const agentCopy = { ...agent };
        delete agentCopy.sps;
        return agentCopy;
    }

    public async processUserRequest(request: string, agent: ProjectAgent): Promise<string | undefined> {
        if (!agent.sps) {
            agent.sps = new ProjectCommanderSPS(this.context, agent.prompt);
        }
        const response = await agent.sps.handleUserRequest(request);
        if (response) {
            return response;
        }
        return undefined;
    }

}
