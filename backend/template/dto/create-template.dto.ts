import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentConfig } from '../../../interfaces/doc';

export class CreateTemplateDto {
  @ApiPropertyOptional({
    description: 'Optional destination path on disk where the configuration should be saved.'
  })
  destinationPath?: string;

  @ApiPropertyOptional({
    description: 'Optional template to use instead of the default configuration.',
    type: () => Object
  })
  template?: DocumentConfig;

  @ApiPropertyOptional({
    description:
      'When true the configuration is written immediately to the destination path. If no destination path is provided an error is thrown.'
  })
  persist?: boolean;
}

export class CreateTemplateResponse {
  @ApiProperty({ description: 'Generated template configuration.', type: () => Object })
  template!: DocumentConfig;

  @ApiPropertyOptional({ description: 'Absolute path where the template has been saved.' })
  savedPath?: string;
}
