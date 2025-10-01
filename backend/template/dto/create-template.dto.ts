import { DocumentConfig } from '../../../interfaces/doc';

export interface CreateTemplateDto {
  /**
   * Optional destination path on disk where the configuration should be saved.
   */
  destinationPath?: string;
  /**
   * Optional template to use instead of the default configuration.
   */
  template?: DocumentConfig;
  /**
   * When true the configuration is written immediately to the destination path.
   * If no destination path is provided an error is thrown.
   */
  persist?: boolean;
}

export interface CreateTemplateResponse {
  template: DocumentConfig;
  savedPath?: string;
}
