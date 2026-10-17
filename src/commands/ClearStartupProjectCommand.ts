import { SolutionExplorerProvider } from "@SolutionExplorerProvider";
import { ContextValues, TreeItem } from "@tree";
import { Action, SetStartupProject } from "@actions";
import { SingleItemActionsCommand } from "./SingleItemActionsCommand";

function isProjectItem(item: TreeItem | undefined): boolean {
    if (!item || !item.solutionItem || !item.solutionItem.fullPath) { return false; }
    return item.contextValue === ContextValues.project
        || item.contextValue === ContextValues.project + '-standard'
        || item.contextValue === ContextValues.project + '-cps';
}

export class ClearStartupProjectCommand extends SingleItemActionsCommand {
    constructor(private readonly provider: SolutionExplorerProvider) {
        super('Clear Startup Project');
    }

    public shouldRun(item: TreeItem | undefined): boolean {
        return isProjectItem(item) && this.provider.hasStartupProject(item!.solution);
    }

    public getActions(item: TreeItem | undefined): Promise<Action[]> {
        if (!isProjectItem(item)) { return Promise.resolve([]); }

        return Promise.resolve([ new SetStartupProject(this.provider, item!, undefined) ]);
    }
}
