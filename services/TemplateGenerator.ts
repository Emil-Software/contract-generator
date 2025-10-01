import { promises as fs } from 'fs';
import { DocumentConfig, PageSettings } from "../interfaces/doc";

const DEFAULT_TEMPLATE: DocumentConfig = {
  versione: "1.0.0",
  impostazioniPagina: {
    fonts: [],
    margini: {
      sx: 8,
      dx: 8,
      alto: 8,
      basso: 8,
    },
    staccoriga: 0,
    interlinea: 1,
    rientro: 0,
    box: {
      background: "#ffffff",
      raggio: 0,
      padding: 0,
      lineWidth: 0,
      lineColor: "#000000",
    },
  },
  contenuti: [],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export class TemplateGenerator {
  private configPath?: string;
  private template?: DocumentConfig;
  private initialized = false;

  constructor(configPath?: string) {
    this.configPath = configPath;
    if (!configPath) {
      this.template = clone(DEFAULT_TEMPLATE);
      this.initialized = true;
    }
  }

  public async load(): Promise<DocumentConfig> {
    await this.ensureTemplate();
    return clone(this.template!);
  }

  public getTemplate(): DocumentConfig {
    if (!this.template) {
      throw new Error('Template not loaded. Call load() or setTemplate() first.');
    }
    return clone(this.template);
  }

  public setTemplate(config: DocumentConfig): void {
    this.template = clone(config);
    this.initialized = true;
  }

  public async updateTemplate(update: Partial<DocumentConfig>): Promise<DocumentConfig> {
    await this.ensureTemplate();
    this.template = TemplateGenerator.mergeTemplates(this.template!, update);
    return clone(this.template);
  }

  public resetTemplate(): DocumentConfig {
    this.template = clone(DEFAULT_TEMPLATE);
    this.initialized = true;
    return clone(this.template);
  }

  public async save(targetPath?: string): Promise<void> {
    await this.ensureTemplate();
    const destination = targetPath ?? this.configPath;
    if (!destination) {
      throw new Error('A destination path must be provided to save the configuration.');
    }
    const serialized = JSON.stringify(this.template, null, 2);
    await fs.writeFile(destination, serialized, 'utf8');
    this.configPath = destination;
  }

  private async ensureTemplate(): Promise<void> {
    if (this.initialized) {
      return;
    }
    if (!this.configPath) {
      this.template = clone(DEFAULT_TEMPLATE);
      this.initialized = true;
      return;
    }
    try {
      const raw = await fs.readFile(this.configPath, 'utf8');
      this.template = JSON.parse(raw) as DocumentConfig;
      this.initialized = true;
    } catch (error) {
      throw new Error(`Unable to read configuration file at ${this.configPath}: ${error}`);
    }
  }

  private static mergeTemplates(base: DocumentConfig, update: Partial<DocumentConfig>): DocumentConfig {
    const merged: DocumentConfig = {
      ...base,
      ...update,
    };

    if (update.impostazioniPagina) {
      merged.impostazioniPagina = TemplateGenerator.mergePageSettings(
        base.impostazioniPagina,
        update.impostazioniPagina,
      );
    }

    if (update.contenuti) {
      merged.contenuti = update.contenuti;
    } else if (!merged.contenuti) {
      merged.contenuti = [];
    }

    return merged;
  }

  private static mergePageSettings(
    base: PageSettings | undefined,
    update: Partial<PageSettings>,
  ): PageSettings {
    const current = base ? clone(base) : clone(DEFAULT_TEMPLATE.impostazioniPagina!);
    const merged: PageSettings = {
      ...current,
      ...update,
    };

    if (update.margini) {
      merged.margini = {
        ...current.margini,
        ...update.margini,
      };
    }

    if (update.box) {
      merged.box = {
        ...current.box,
        ...update.box,
      };
    }

    return merged;
  }
}
