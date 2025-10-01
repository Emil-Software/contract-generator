import { DocumentConfig } from "../interfaces/doc";
export declare class TemplateGenerator {
    private configPath?;
    private template?;
    private initialized;
    constructor(configPath?: string);
    load(): Promise<DocumentConfig>;
    getTemplate(): DocumentConfig;
    setTemplate(config: DocumentConfig): void;
    updateTemplate(update: Partial<DocumentConfig>): Promise<DocumentConfig>;
    resetTemplate(): DocumentConfig;
    save(targetPath?: string): Promise<void>;
    private ensureTemplate;
    private static mergeTemplates;
    private static mergePageSettings;
}
