import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentParams } from '../../../interfaces/content';
import { DocumentConfig } from '../../../interfaces/doc';

export class GenerateDocumentDto {
  @ApiProperty({ description: 'Parameters used to populate the document content.', type: () => Object })
  params!: DocumentParams;

  @ApiPropertyOptional({ description: 'Filesystem path of the template configuration to load.' })
  configPath?: string;

  @ApiPropertyOptional({ description: 'Template configuration to use instead of loading from disk.', type: () => Object })
  config?: DocumentConfig;
}

export class GenerateDocumentResponse {
  @ApiProperty({ description: 'Base64-encoded PDF document generated from the template.' })
  document!: string;

  @ApiProperty({ description: 'Path on disk where the generated PDF has been saved.' })
  filePath!: string;
}
