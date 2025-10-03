import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentConfig } from '../../../interfaces/doc';

//#region GenerateDocumentDto
export class GenerateDocumentDto {
  
  //#region fileName
  @ApiProperty({ 
    description: 'Name or path of the generated file',
    example: 'new_contract_document'
  })
  fileName: string;
  //#endregion
  
  //#region config
  /** allow to pass a json to use for the template of the document */
  @ApiHideProperty()
  config?: DocumentConfig;
  //#endregion


  //#region Client-Supplier
  @ApiPropertyOptional({ 
    description: 'Business name for the client', 
    example: 'Average Joe\' Gymnasium' 
  })
  client?: string;
  
  @ApiPropertyOptional({ 
    description: 'Business name for the supplier', 
    example: 'Dodgeball National Association' 
  })
  supplier?: string;

  
  @ApiPropertyOptional({ 
    description: 'Business address for the client', 
    example: 'Average Joe\' Gymnasium' 
  })
  clientAddress?: string;
  
  @ApiPropertyOptional({ 
    description: 'Business address for the supplier', 
    example: 'Dodgeball National Association' 
  })
  supplierAddress?: string;

  
  @ApiPropertyOptional({ 
    description: 'Tax code / Tax identification number for the client', 
    example: '4242424242424' 
  })
  pIvaCfClient?: string;
  
  @ApiPropertyOptional({ description: 'Tax code / Tax identification number for the supplier', example: '4242424242424' })
  pIvaCfSupplier?: string;
  //#endregion

  //#region page enumeration
  @ApiPropertyOptional({ 
    description: 'Label to print before the page number. If nothing is passed, the page number will not be shown in the page', 
    example: 'Pag. ' 
  })
  labelPagNum?: string;
  
  @ApiPropertyOptional({
    description: 'Font to use, among the defined in the config file. If not passed, default will be used', 
    example: 'helvetica' 
  })
  fontPagNum?: string;
  
  @ApiPropertyOptional({
    description: 'Label before the total number of the page. If not passed only the number will be shown, not the total', 
    example: ' of ' })
  totPagNum?: string;
  //#endregion

  //#region table
  @ApiPropertyOptional({
    description: 'Name defined in the configuration to attach a table in the document. **Must be defined in the conf file**',
    example: 'PRICE_TABLE'
  })
  tableAnchor?: string;
  
  @ApiPropertyOptional({
    description: 'array of labels (string) to use as header for the table',
    example: ['service', 'period (weeks)', 'require machinery', 'Amount (€)']
  })
  tableHead?: string[];
  
  @ApiPropertyOptional({
    description: 'array of array of value to use as table rows',
    example: [
      ['dodge ball training', '6', 'No', '35'],
      ['dodge ball training', '12', 'No', '60'],
      ['power lifting', '6', 'yes', '80'],
      ['power lifting', '12', 'yes', '145'],
    ]
  })
  tableBody?: any[][];
  //#endregion
}
//#endregion

//#region GenerateDocumentResponse
export class GenerateDocumentResponse {
  @ApiProperty({ description: 'Base64-encoded PDF document generated from the template.' })
  document!: string;

  @ApiProperty({ description: 'Path on disk where the generated PDF has been saved.' })
  filePath!: string;
}
//#endregion
