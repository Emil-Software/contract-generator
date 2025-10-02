import { ApiProperty } from '@nestjs/swagger';
import { DocumentParams } from '../../../interfaces/content';

export class GenerateDocumentDto {
  // @ApiProperty({ description: 'Parameters used to populate the document content.', type: () => Object })
  // params!: DocumentParams;
  @ApiProperty({ description: 'Name or path of the generated file' })
  nomeFile: string;

  params: any;
  // parti?: IPartiContratto;
    // tipOutput?: 'f' | 'd' | 'u';
    // dynamicFields?: { [key: string]: string };
    // dynamicElements?: { [placeholder: string]: DynamicElement };
    // allegaDocPrima?: string;
    // allegaDocDopo?: string;
    // numPagina?: {
    //   /**
    //    * label to put before the page nuber
    //    */
    //   label: string;
    //   /**
    //    * an ID of those defined in the document config
    //    */
    //   fontId?: string;
    //   /**
    //    * If present, the string is used between the page number and the total pages
    //    * If not present the total will not be visible
    //    */
    //   totPages?: string;
}

export class GenerateDocumentResponse {
  @ApiProperty({ description: 'Base64-encoded PDF document generated from the template.' })
  document!: string;

  @ApiProperty({ description: 'Path on disk where the generated PDF has been saved.' })
  filePath!: string;
}
