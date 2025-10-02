import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse } from "@nestjs/swagger";
import { GenerateDocumentDto, GenerateDocumentResponse } from "./dto/generate-document.dto";
import { GenerateService } from "./generate.service";


@ApiTags('generate')
@Controller('generate')
export class GenerateController {

	constructor(
		private generateService: GenerateService
	) { }

	@Post()
	@ApiOperation({ summary: 'Generate a document using the provided template configuration.' })
	@ApiBody({ type: GenerateDocumentDto })
	@ApiOkResponse({ type: GenerateDocumentResponse })
	generateDocument(@Body() body: GenerateDocumentDto) {
		return this.generateService.generateDocument(body);
	}
}