import * as vscode from 'vscode';
export default class FooterContent {
    private statusBarItem: vscode.StatusBarItem;
    private iconReady = '$(check)';
    private iconActive = '$(sync~spin)';
    // constructor is private because we want to enforce singleton pattern
    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
        this.statusBarItem.show();
        this.setStatus('ready');
    }
    // set the status bar text
    public setStatus(status: 'ready' | 'active'): void {
        if (status === 'ready') {
            this.statusBarItem.text = `${this.iconReady} Ready`;
        } else if (status === 'active') {
            this.statusBarItem.text = `${this.iconActive} Scanning...`;
        }
    }
    // set the status bar text
    public setText(text: string): void {
        if (this.statusBarItem.text.includes(this.iconActive)) {
            this.statusBarItem.text = `${this.iconActive} ${text}`;
        }
    }
    // set the status bar tooltip
    private static instance: FooterContent;
    public static getInstance(): FooterContent {
        if (!FooterContent.instance) {
            FooterContent.instance = new FooterContent();
        }
        return FooterContent.instance;
    }
}