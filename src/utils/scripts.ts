import * as vscode from 'vscode';
import * as fs from 'fs';

export function loadScript(webview: vscode.Webview, extensionUri: vscode.Uri, libName: string) {
    const libPath = vscode.Uri.joinPath(extensionUri, libName);
    const libContent = fs.readFileSync(libPath.fsPath, 'utf8');
    return `<script type="text/javascript">
${libContent}
</script>`;
}

export function formatMultilineBash(input: string): string[] {
    const lines = input.split('\n');
    const formattedCommands = [];
    let currentCommand = '';

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine === '' || trimmedLine.startsWith('#')) {
            continue;
        }

        if (trimmedLine.startsWith('sed')) {
            const pattern = /'(.*?)'/g;
            const replacement = (_: any, match: string) => {
                return '\'' + match.replace(/'/g, '\'"\'"\'') + '\'';
            };
            const escapedLine = trimmedLine.replace(pattern, replacement);
            currentCommand += escapedLine;
        } else {
            currentCommand += trimmedLine;
        }

        if (currentCommand.endsWith('\\')) {
            currentCommand = currentCommand.slice(0, -1) + ' ';
            continue;
        }

        formattedCommands.push(currentCommand);
        currentCommand = '';
    }

    return formattedCommands;
}
