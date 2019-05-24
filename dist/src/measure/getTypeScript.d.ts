export declare function getTypeScript(version: string, localTypeScriptPath?: string, install?: boolean): Promise<{
    ts: typeof import('typescript');
    tsPath: string;
}>;
