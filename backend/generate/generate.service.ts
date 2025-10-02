import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { DocumentGenerator } from "../../ContractGenerator";
import { GenerateDocumentDto, GenerateDocumentResponse } from "./dto/generate-document.dto";
import { DocumentConfig } from "../../interfaces/doc";
import { readFileSync } from "fs";

const DEFAULT_PATH_CONFIG = 'config.json';
const logger = new Logger('Generate');

@Injectable()
export class GenerateService {
	private config: DocumentConfig;
	constructor() {
		// this.logger = new Logger('Generate Document - service');
		const configFile = readFileSync(DEFAULT_PATH_CONFIG, 'utf-8');
		this.config = JSON.parse(configFile);
	}

	async generateDocument(dto: GenerateDocumentDto)/*: Promise<sGenerateDocumentResponse> */ {
		logger.log('start generateDocument')
		logger.verbose(this.config);
		if (!dto.fileName) {
			throw new BadRequestException('file name is required to generate a document.');
		}

		// use exteranl config when present
		if (dto.config) {
			this.config = dto.config;
		}
		const configPages = Object(this.config['impostazioniPagina']);

		// check if there is a table in the params
		if (dto.tableAnchor) {
			// check the config.json to find the anchor, if not found throw error
			console.log("Contenuti: ", configPages);
		}

		try {
			const generator = new DocumentGenerator();
			generator.setConfig(this.config);


			//   const document = await generator.generateDocument(dto);
			//   if (!document) {
			//     throw new Error('Document generation failed.');
			//   }

			//   return {
			//     document,
			//     filePath: dto.fileName,
			//   };
		} catch (error) {
			//   throw new BadRequestException(`Unable to generate document: ${error instanceof Error ? error.message : error}`);
		}
	}
}
