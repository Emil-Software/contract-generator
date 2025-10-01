import { promises as fs } from 'fs';
import { DocumentConfig, PageSettings, Content, ConfigData } from "../interfaces/doc";

export class ConfigService {
  private readonly configPath?: string;
  private template?: DocumentConfig;
  private pageSettings?: PageSettings;
  private contenuti?: Partial<Content>[];
  private configLoaded = false;

  constructor(configPath?: string) {
    this.configPath = configPath;
  }

  public setConfig(config: DocumentConfig): void {
    this.template = config;
    this.pageSettings = this.applyMarginDefaults(config.impostazioniPagina);
    this.contenuti = config.contenuti;
    this.configLoaded = true;
  }

  public async loadConfig(): Promise<ConfigData> {
    if (this.configLoaded) {
      return this.getConfigData();
    }
    if (!this.configPath) {
      throw new Error("No configuration provided.");
    }
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      const template = JSON.parse(data) as DocumentConfig;
      this.template = template;
      this.pageSettings = this.applyMarginDefaults(template.impostazioniPagina);
      this.contenuti = template.contenuti;
      this.configLoaded = true;
      return this.getConfigData();
    } catch (error) {
      throw new Error(`Error reading configuration file: ${error}`);
    }
  }

  public getConfigData(): ConfigData {
    if (!this.template || !this.pageSettings || !this.contenuti) {
      throw new Error('Configuration not loaded.');
    }
    return {
      template: this.template,
      pageSettings: this.pageSettings,
      contenuti: this.contenuti,
    };
  }

  public getConfigPath(): string | undefined {
    return this.configPath;
  }

  private applyMarginDefaults(pageSettings: PageSettings): PageSettings {
    const defaultMargins = {
      sx: 8,
      dx: 8,
      alto: 8,
      basso: 8,
    };
    const margini = pageSettings.margini ?? defaultMargins;
    return {
      ...pageSettings,
      margini: {
        sx: margini.sx ?? defaultMargins.sx,
        dx: margini.dx ?? defaultMargins.dx,
        alto: margini.alto ?? defaultMargins.alto,
        basso: margini.basso ?? defaultMargins.basso,
      },
    };
  }
}
