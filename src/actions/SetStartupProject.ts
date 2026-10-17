import * as path from "@extensions/path";
import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { TreeItem } from "@tree";
import { Action, ActionContext } from "./base/Action";

export class SetStartupProject implements Action {
    constructor(private readonly provider: SolutionExplorerProvider,
                private readonly treeItem: TreeItem,
                private readonly projectPath: string | undefined) {
    }

    public async execute(context: ActionContext): Promise<void> {
        if (context.cancelled) { return; }

        await this.provider.setStartupProject(this.treeItem.solution, this.projectPath);

        let parent = this.treeItem.parent;
        while (parent) {
            parent.refresh();
            parent = parent.parent;
        }
    }

    public toString(): string {
        const name = this.projectPath ? path.basename(this.projectPath) : 'none';
        return `Set startup project to ${name}`;
    }
}
