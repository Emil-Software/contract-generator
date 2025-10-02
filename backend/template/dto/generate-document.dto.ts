import { ApiProperty } from '@nestjs/swagger';
import { DocumentParams } from '../../../interfaces/content';

export class GenerateDocumentDto {
  @ApiProperty({ description: 'Parameters used to populate the document content.', type: () => Object })
  params!: DocumentParams;

}

export class GenerateDocumentResponse {
  @ApiProperty({ description: 'Base64-encoded PDF document generated from the template.' })
  document!: string;

  @ApiProperty({ description: 'Path on disk where the generated PDF has been saved.' })
  filePath!: string;
}
