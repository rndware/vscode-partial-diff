import CommandFactory from './command-factory';
import ContentProvider from './content-provider';
import {EXTENSION_NAMESPACE, EXTENSION_SCHEME} from './const';
import {ExecutionContextLike} from './entities/vscode';
import CommandWrapper from './command-wrapper';

type CommandType = 'TEXT_EDITOR' | 'GENERAL';

interface CommandItem {
    name: string;
    type: CommandType;
    command: CommandWrapper;
}

export default class Bootstrapper {
    private readonly commandFactory: CommandFactory;
    private readonly contentProvider: ContentProvider;
    private readonly vscode: any;

    constructor(commandFactory: CommandFactory,
                contentProvider: ContentProvider,
                vscode: any) {
        this.commandFactory = commandFactory;
        this.contentProvider = contentProvider;
        this.vscode = vscode;
    }

    initiate(context: ExecutionContextLike) {
        this.registerProviders(context);
        this.registerCommands(context);
    }

    private registerProviders(context: ExecutionContextLike) {
        const disposable = this.vscode.workspace.registerTextDocumentContentProvider(
            EXTENSION_SCHEME,
            this.contentProvider
        );
        context.subscriptions.push(disposable);
    }

    private registerCommands(context: ExecutionContextLike) {
        this.commandList.forEach(cmd => {
            const registerer = this.getCommandRegisterer(cmd.type);
            const disposable = registerer(cmd.name, cmd.command.execute, cmd.command);
            context.subscriptions.push(disposable);
        });
    }

    private getCommandRegisterer(commandType: CommandType) {
        return commandType === 'TEXT_EDITOR'
            ? this.vscode.commands.registerTextEditorCommand
            : this.vscode.commands.registerCommand;
    }

    private get commandList(): CommandItem[] {
        return [
            {
                name: `${EXTENSION_NAMESPACE}.diffVisibleEditors`,
                type: 'GENERAL',
                command: this.commandFactory.createCompareVisibleEditorsCommand()
            },
            {
                name: `${EXTENSION_NAMESPACE}.markSection1`,
                type: 'TEXT_EDITOR',
                command: this.commandFactory.crateSaveText1Command()
            },
            {
                name: `${EXTENSION_NAMESPACE}.markSection2AndTakeDiff`,
                type: 'TEXT_EDITOR',
                command: this.commandFactory.createCompareSelectionWithText1Command()
            },
            {
                name: `${EXTENSION_NAMESPACE}.diffSelectionWithClipboard`,
                type: 'TEXT_EDITOR',
                command: this.commandFactory.createCompareSelectionWithClipboardCommand()
            },
            {
                name: `${EXTENSION_NAMESPACE}.togglePreComparisonTextNormalizationRules`,
                type: 'GENERAL',
                command: this.commandFactory.createToggleNormalisationRulesCommand()
            }
        ];
    }
}
