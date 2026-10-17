import * as vscode from "vscode";
import { isSamePath, normalizePath } from "./core/Solutions/SolutionItemSort";

const STARTUP_PROJECTS_KEY = 'solutionExplorer.startupProjects';

export class StartupProjectService implements vscode.Disposable {
    private readonly startupProjects: { [solutionPath: string]: string };
    private readonly onDidChangeEmitter = new vscode.EventEmitter<void>();

    public readonly onDidChange = this.onDidChangeEmitter.event;

    constructor(private readonly context: vscode.ExtensionContext) {
        const stored = context.workspaceState.get<{ [solutionPath: string]: string }>(STARTUP_PROJECTS_KEY, {});
        this.startupProjects = { ...stored };
    }

    public getStartupProject(solutionPath: string): string | undefined {
        return this.startupProjects[normalizePath(solutionPath)];
    }

    public isStartupProject(solutionPath: string, projectPath: string): boolean {
        const startupProject = this.getStartupProject(solutionPath);
        return !!startupProject && isSamePath(startupProject, projectPath);
    }

    public isStartupProjectPath(filepath: string): boolean {
        return Object.values(this.startupProjects).some(projectPath => isSamePath(projectPath, filepath));
    }

    public hasStartupProject(): boolean {
        return Object.keys(this.startupProjects).length > 0;
    }

    public async setStartupProject(solutionPath: string, projectPath: string): Promise<void> {
        this.startupProjects[normalizePath(solutionPath)] = projectPath;
        await this.save();
    }

    public async clearStartupProject(solutionPath: string): Promise<void> {
        delete this.startupProjects[normalizePath(solutionPath)];
        await this.save();
    }

    public dispose(): void {
        this.onDidChangeEmitter.dispose();
    }

    private async save(): Promise<void> {
        await this.context.workspaceState.update(STARTUP_PROJECTS_KEY, this.startupProjects);
        this.onDidChangeEmitter.fire();
    }
}
