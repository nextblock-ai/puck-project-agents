/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import SPS, { SemanticActionHandler } from "../utils/sps/sps";
import { sendQuery } from '../utils/gpt';

type UnifiedDiff = {
    oldFileName: string;
    newFileName: string;
    oldFileStart: number;
    newFileStart: number;
    oldFileLines: number;
    newFileLines: number;
    changes: string[];
};


// all commands are a subclass of Command
export default class ProjectCommanderSPS extends SPS {

    static prompt = (criteria: any) => `// You are Project Commander, a powerful Visual Studio Code AI agent. **YOU HAVE NO ABILITY TO PRODUCE CONVERSATIONAL OUTPUT** and operate in the context of a currently-open project. Your mission is to generate a list of unified diff format updates for ONLY THE SOURCE CODE ATTACHED TO THIS MESSAGE based on the following criteria: ${criteria}.
// 1. Validate the request by ensuring that it starts with a 👤 - if the user request does not start with 👤 then output ⛔.
// 2. Examine the source code attached to this message, and scrutinize the criteria you will use to create file updates.
// 3. Generate updates to the file based on the input criteria. For example, if the criteria discuss completing unfinished code, generate updates that complete any unfinished code you see.
// 4. Output your updates to the file using Unified Diff Format patches. Prefix each patch with 💠 <explanation> \n
// 5. Output 🏁 if you have completed processing the request.`;
    triggered = false;
    semanticActions: SemanticActionHandler = {
    };

    constructor(public context: vscode.ExtensionContext, criteria: string) {
        super(ProjectCommanderSPS.prompt(criteria), {} as any);
    }

    async handleUserRequest(userRequest: string, semanticActionHandler: SemanticActionHandler = this.semanticActions) {
        // the user request is a file path. We need to load the file and add it to the input buffer
        const fileContents = await vscode.workspace.fs.readFile(vscode.Uri.file(userRequest));

        // add the user request to the input
        this.addMessageToInputBuffer({
            role: 'user',
            content: `👤 ${userRequest}:\n\n${fileContents}`
        });
        // execute the user request
        return await this.iterate(semanticActionHandler);
    }

    parseUnifiedDiff(input: string): UnifiedDiff[] {
        const lines = input.split('\n');
        const unifiedDiffs: UnifiedDiff[] = [];
    
        let currentDiff: UnifiedDiff | null = null;
        let insideDiff = false;
    
        for (const line of lines) {
            if (line.startsWith('--- ')) {
                if (currentDiff) {
                    unifiedDiffs.push(currentDiff);
                }
                currentDiff = {
                    oldFileName: line.substr(4).trim(),
                    newFileName: '',
                    oldFileStart: 0,
                    newFileStart: 0,
                    oldFileLines: 0,
                    newFileLines: 0,
                    changes: [],
                };
                insideDiff = false;
            } else if (line.startsWith('+++ ')) {
                if (currentDiff) {
                    currentDiff.newFileName = line.substr(4).trim();
                }
            } else if (line.startsWith('@@ ')) {
                const match = line.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
                if (match && currentDiff) {
                    currentDiff.oldFileStart = parseInt(match[1], 10);
                    currentDiff.oldFileLines = parseInt(match[2], 10);
                    currentDiff.newFileStart = parseInt(match[3], 10);
                    currentDiff.newFileLines = parseInt(match[4], 10);
                }
                insideDiff = true;
            } else if (currentDiff && insideDiff) {
                if (line.startsWith('+') || line.startsWith('-') || line.startsWith(' ')) {
                    currentDiff.changes.push(line);
                } else {
                    insideDiff = false;
                }
            }
        }
        if (currentDiff) {
            unifiedDiffs.push(currentDiff);
        }
    
        return unifiedDiffs;
    }

    async iterate(semanticActionHandler: SemanticActionHandler): Promise<any> {
        const query = {
            model: 'gpt-4',
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.6,
            messages: [{
                role: 'system',
                content: this.prompt
            }, ...this.inputBuffer.map((message) => ({
                role: message.role,
                content: message.content
            })) as any]
        };
        this.inputBuffer = [];
        let response = await sendQuery(query);
        try {
            response += '\n';

            const match = this.parseUnifiedDiff(response);
            if(match.length === 0) {
                console.log(`no unified diff found in response: ${response}`);
                return;
            }
            return match;
        } catch (e) { 
            console.log(`error encountered when parsing response: ${e}\n\n${response}`);
        }
    }
}



