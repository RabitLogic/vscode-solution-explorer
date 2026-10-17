declare const require: (name: string) => any;

const assert = require("assert/strict");
const test = require("node:test");
const path = require("path");
import { compareSolutionItems, isSamePath, isStartupProjectPath } from "../src/core/Solutions/SolutionItemSort";
import type { SolutionItem } from "../src/core/Solutions/model";

type TestItem = SolutionItem & { getFolders?: () => SolutionItem[] };

function createItem(name: string, fullPath: string, displayName: string, isFolder: boolean = false): TestItem {
    const item: TestItem = {
        id: name,
        name,
        fullPath,
        parent: undefined,
        getFullDisplayName: () => displayName
    };

    if (isFolder) {
        item.getFolders = () => [];
    }

    return item;
}

const solutionName = 'MySolution';
const root = process.cwd();
const solutionPath = path.join(root, solutionName + '.sln');

const srcFolder = createItem('src', path.join(root, 'src'), solutionName + path.sep + 'src', true);
const testsFolder = createItem('tests', path.join(root, 'tests'), solutionName + path.sep + 'tests', true);
const entry = createItem('MPAssembleRecipe.Entry', path.join(root, 'src', 'MPAssembleRecipe.Entry', 'MPAssembleRecipe.Entry.csproj'), solutionName + path.sep + 'src' + path.sep + 'MPAssembleRecipe.Entry');
const business = createItem('MPAssembleRecipe.Business', path.join(root, 'src', 'MPAssembleRecipe.Business', 'MPAssembleRecipe.Business.csproj'), solutionName + path.sep + 'src' + path.sep + 'MPAssembleRecipe.Business');

test("isStartupProjectPath recognizes the startup project and its ancestor solution folders", () => {
    assert.equal(isStartupProjectPath(entry, entry), true);
    assert.equal(isStartupProjectPath(srcFolder, entry), true);
    assert.equal(isStartupProjectPath(testsFolder, entry), false);
    assert.equal(isStartupProjectPath(business, entry), false);
});

test("isStartupProjectPath is false when there is no startup project", () => {
    assert.equal(isStartupProjectPath(entry, undefined), false);
});

test("compareSolutionItems moves the startup project above the other projects", () => {
    const projects = [business, entry].sort((a, b) => compareSolutionItems(a, b, entry));

    assert.deepEqual(projects.map(p => p.name), ['MPAssembleRecipe.Entry', 'MPAssembleRecipe.Business']);
});

test("compareSolutionItems moves the solution folder containing the startup project first", () => {
    const folders = [testsFolder, srcFolder].sort((a, b) => compareSolutionItems(a, b, entry));

    assert.deepEqual(folders.map(f => f.name), ['src', 'tests']);
});

test("compareSolutionItems keeps alphabetical order when there is no startup project", () => {
    const projects = [business, entry].sort((a, b) => compareSolutionItems(a, b, undefined));
    const folders = [testsFolder, srcFolder].sort((a, b) => compareSolutionItems(a, b, undefined));

    assert.deepEqual(projects.map(p => p.name), ['MPAssembleRecipe.Business', 'MPAssembleRecipe.Entry']);
    assert.deepEqual(folders.map(f => f.name), ['src', 'tests']);
});

test("isSamePath compares normalized paths and ignores case on Windows", () => {
    assert.equal(isSamePath(solutionPath, solutionPath), true);
    assert.equal(isSamePath(solutionPath, solutionPath + '.other'), false);

    if (process.platform === 'win32') {
        assert.equal(isSamePath(solutionPath, solutionPath.toUpperCase()), true);
    }
});
