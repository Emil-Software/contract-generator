import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentConfig } from '../../../interfaces/doc';

export class UpdateTemplateDto {
  @ApiProperty({ description: 'Path to the configuration file to load and optionally persist after the update.' })
  path!: string;

  @ApiProperty({ description: 'Partial configuration containing only the properties to update.', type: () => Object })
  update!: Partial<DocumentConfig>;

  @ApiPropertyOptional({ description: 'When true (default) the updated template is written back to the same path.' })
  persist?: boolean;
}

export class UpdateTemplateResponse {
  @ApiProperty({ description: 'Updated template configuration.', type: () => Object })
  template!: DocumentConfig;

  @ApiPropertyOptional({ description: 'Path where the updated template was saved.' })
  savedPath?: string;
}
