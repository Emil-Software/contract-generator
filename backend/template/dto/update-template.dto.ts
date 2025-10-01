import { DocumentConfig } from '../../../interfaces/doc';

export interface UpdateTemplateDto {
  /**
   * Path to the configuration file to load and optionally persist after the update.
   */
  path: string;
  /**
   * Partial configuration containing only the properties to update.
   */
  update: Partial<DocumentConfig>;
  /**
   * When true (default) the updated template is written back to the same path.
   */
  persist?: boolean;
}

export interface UpdateTemplateResponse {
  template: DocumentConfig;
  savedPath?: string;
}
