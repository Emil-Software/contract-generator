import { jsPDF, TextOptionsLight } from "jspdf";
import autotable, { UserOptions } from "jspdf-autotable";
import { promises as fs, readFileSync, statSync } from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib'

export interface IPartiContratto {
  fornitore: { denominazione: string; codiceFiscale: string; indirizzoCompleto: string; };
  cliente: { denominazione: string; codiceFiscale: string; indirizzoCompleto: string; };
}

export interface DocumentParams {
  nomeFile: string;
  parti?: IPartiContratto;
  tipOutput?: 'f' | 'd' | 'u';
  dynamicFields?: { [key: string]: string };
  dynamicElements?: { [placeholder: string]: DynamicElement };
  allegaDocPrima?: string;
  allegaDocDopo?: string;
  numPagina?: {
    /**
     * label to put before the page nuber
     */
    label: string;
    /**
     * an ID of those defined in the document config
     */
    fontId?: string;
    /**
     * If present, the string is used between the page number and the total pages
     * If not present the total will not be visible
     */
    totPages?: string;
  }
}

export type DynamicElement = {
  type: 'table' | 'csv';
  // content?: string[][];
  config: UserOptions;
  // {
  //   head?: string[][];
  //   body: string[][];
  //   options?: any;
  //   styles?: any;
  //   headStyles?: any;
  // };
};


export interface DocumentConfig {
  versione?: string;
  impostazioniPagina?: PageSettings;
  contenuti: Partial<Content>[];
  /**
   * move table style inside the definition of a table becouse there could be multiple tables with different styles
   */
  tableStyle?: { lineColor?: string; lineWidth?: number; font?: string; fontSize?: number; cellPadding?: number; fillColor?: string; };
}

export interface PageSettings {
  /**
   * the fontDefault is assumed when no other formatting rules is given
   */
  // fontDefault: DocumentFont;
  fonts: DocumentFont[];
  // fontAlternative?: DocumentFont;
  margini?: { sx: number; dx: number; alto: number; basso: number; },
  staccoriga: number;
  interlinea: number;
  rientro: number;
  box: {
    background: string;
    raggio: number;
    padding: number;
    lineWidth: number;
    lineColor: string;
  };
  labelPage?: string;
}


export interface DocumentFont {
  /**
   * internal name used to refer to a particular configuration
   */
  id: string;
  /**
   * name of the font
   */
  nome: string;
  /**
   * size of the font
   */
  dimensione: number;

  colore: string;
  /**
   * path in the system to the installation file of the font
   */
  installPath?: string;
  /**
   * not every font has all the styles
   */
  style?: 'bold' | 'italic' | 'normal' | 'bolditalic'
}



export interface ImageParams {
  path: string;
  posizione?: [number, number];
  dimensioni?: [number, number];
  coeffDim?: number;
}

export interface Content {
  /**
   * simple text, or if string array is passed, text on multiple line
   */
  testo: string | string[];
  /**
   * text in a box (see PageSettings -> box for styling)
   */
  testoBox: string[];
  /**
   * list
   */
  punti: Elenco[];
  /**
   * parameters for image
   */
  immagini: ImageParams;

};

export interface Elenco {
  titolo: string;
  sottopunti: Array<{
    titolo: string;
    punto?: string;
    contenuto: string[];
  }>;
}

interface FormattedText {
  content: string;
  fontId?: string;
  hAlign?: HAlign;
  vAlign?: VAlign;
  maxWidth?: number;
  riportaCursore?: 'fianco' | 'sotto';
  offsetX?: number;
  offsetY?: number;
  centra?: boolean;
}

interface SectionsText {
  text: string;
  type: 'bold' | 'normal';
  start: number;
  end: number;
}

type HAlign = "center" | "left" | "right" | "justify";

type VAlign = "top" | "bottom" | "middle";

type ConfigData = {
  template: DocumentConfig;
  pageSettings: PageSettings;
  contenuti: Partial<Content>[];
};

class ConfigService {
  private readonly configPath?: string;
  private template?: DocumentConfig;
  private pageSettings?: PageSettings;
  private contenuti?: Partial<Content>[];
  private configLoaded = false;

  constructor(configPath?: string) {
    this.configPath = configPath;
  }

  public setConfig(config: DocumentConfig): void {
    this.template = config;
    this.pageSettings = this.applyMarginDefaults(config.impostazioniPagina);
    this.contenuti = config.contenuti;
    this.configLoaded = true;
  }

  public async loadConfig(): Promise<ConfigData> {
    if (this.configLoaded) {
      return this.getConfigData();
    }
    if (!this.configPath) {
      throw new Error("No configuration provided.");
    }
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      const template = JSON.parse(data) as DocumentConfig;
      this.template = template;
      this.pageSettings = this.applyMarginDefaults(template.impostazioniPagina);
      this.contenuti = template.contenuti;
      this.configLoaded = true;
      return this.getConfigData();
    } catch (error) {
      throw new Error(`Error reading configuration file: ${error}`);
    }
  }

  public getConfigData(): ConfigData {
    if (!this.template || !this.pageSettings || !this.contenuti) {
      throw new Error('Configuration not loaded.');
    }
    return {
      template: this.template,
      pageSettings: this.pageSettings,
      contenuti: this.contenuti,
    };
  }

  public getConfigPath(): string | undefined {
    return this.configPath;
  }

  private applyMarginDefaults(pageSettings: PageSettings): PageSettings {
    const defaultMargins = {
      sx: 8,
      dx: 8,
      alto: 8,
      basso: 8,
    };
    const margini = pageSettings.margini ?? defaultMargins;
    return {
      ...pageSettings,
      margini: {
        sx: margini.sx ?? defaultMargins.sx,
        dx: margini.dx ?? defaultMargins.dx,
        alto: margini.alto ?? defaultMargins.alto,
        basso: margini.basso ?? defaultMargins.basso,
      },
    };
  }
}

class FontManager {
  private fonts: DocumentFont[] = [];

  public updateFonts(fonts: DocumentFont[]): void {
    this.fonts = fonts ?? [];
  }

  public async initialize(doc: jsPDF): Promise<void> {
    const fontList = doc.getFontList();
    for (const font of this.fonts) {
      if (!fontList[font.nome] && font.installPath) {
        const styles = font.style ? font.style.split(',') : ['normal'];
        const paths = font.installPath.split(',');
        for (let i = 0; i < paths.length; i++) {
          const style = styles[i] ? styles[i].trim() : styles[0].trim();
          await this.installFont(paths[i].trim(), font.nome, style, doc);
        }
      }
    }
  }

  public setupText(doc: jsPDF, fonts: DocumentFont[], fontId: string = 'default'): DocumentFont {
    let font = fonts.find(font => font.id === fontId);
    if (!font) {
      console.warn(`no font found with the id ${fontId}`);
      font = { nome: 'courier', dimensione: 5, id: 'no configuration', colore: '#000000' } as DocumentFont;
    }
    doc.setFont(font.nome, 'normal');
    doc.setFontSize(font.dimensione);
    doc.setTextColor(font.colore ? font.colore : undefined);
    return font;
  }

  private async installFont(fontPath: string, fontName: string, style: string = 'normal', doc: jsPDF): Promise<void> {
    const absolutePath = path.resolve(fontPath);
    const buffer = await fs.readFile(absolutePath);
    const base64Font = buffer.toString('base64');
    doc.addFileToVFS(`${fontName}.ttf`, base64Font);
    doc.addFont(`${fontName}.ttf`, fontName, style);
    doc.setFont(fontName, style as any);
  }
}

class TemplateProcessor {
  private readonly tagRegex = /<\|(.*?)\|>/g;

  public stripFormattingTags(text: string): string {
    return text?.replace(this.tagRegex, "").trim();
  }

  public applyTemplate(template: string, dynamicFields?: { [key: string]: string }): string {
    if (!dynamicFields) return template;
    return template.replace(/\$(\w+)\$/g, (match, key) =>
      dynamicFields[key] !== undefined ? dynamicFields[key] : match
    );
  }

  public applyPartiPlaceholders(text: string, parti?: IPartiContratto): string {
    if (!parti) {
      return text;
    }
    return text.replace(/\$(fornitore|cliente):(\w+)\$/g, (match, party, field) =>
      (parti[party] && (parti[party] as any)[field]) ? (parti[party] as any)[field] : match
    );
  }

  public getTagConfigurations(text: string): string[][] {
    const matches = Array.from(text.matchAll(this.tagRegex));
    return matches.map(match =>
      match[1]
        .trim()
        .split(';')
        .map(segment => segment.trim())
        .filter(Boolean)
    );
  }

  public parseKeyValue(tagContent: string): [string, string] | null {
    if (!tagContent.includes(':')) {
      return null;
    }
    const [key, value] = tagContent.split(':').map(s => s.trim());
    return [key, value];
  }

  public parseBoldSections(content: string): SectionsText[] {
    let sections: SectionsText[] = [];
    let index = 0;
    let matches = Array.from(content.matchAll(/\*\*(.*?)\*\*/g));
    if (matches.length === 0) {
      sections.push({
        text: content,
        type: 'normal',
        start: 0,
        end: content.length
      });
    } else {
      while (index < content.length) {
        for (const match of matches) {
          if (index !== match['index']) {
            sections.push({
              text: content.substring(index, match['index']),
              type: 'normal',
              start: index,
              end: match['index']
            });
          }
          sections.push({
            text: content.substring(match['index'], match['index'] + match[0].length),
            type: 'bold',
            start: match['index'],
            end: match['index'] + match[0].length
          });
          index = match['index'] + match[0].length;
        }
        sections.push({
          text: content.substring(index, content.length),
          type: 'normal',
          start: index,
          end: content.length - 1
        });
        index = content.length;
      }
    }
    return sections;
  }
}

class CursorManager {
  private curX: number = 0;
  private curY: number = 0;
  private doc!: jsPDF;
  private config!: PageSettings;
  private debugActive: boolean = false;

  public initialize(doc: jsPDF, config: PageSettings): void {
    this.doc = doc;
    this.config = config;
    const margins = this.config.margini ?? { sx: 10, dx: 10, alto: 10, basso: 10 };
    this.curX = margins.sx ?? 10;
    this.curY = margins.alto ?? 10;
  }

  public setDebugActive(active: boolean): void {
    this.debugActive = active;
  }

  public get currentX(): number {
    return this.curX;
  }

  public set currentX(value: number) {
    this.curX = value;
  }

  public get currentY(): number {
    return this.curY;
  }

  public set currentY(value: number) {
    this.curY = value;
  }

  public moveY(param: { yPosition: number; offsetX?: number }): void {
    const maxY = this.doc.internal.pageSize.getHeight() - this.config.margini.basso;
    if (param.yPosition >= this.config.margini.alto && param.yPosition <= maxY) {
      this.curY = param.yPosition;
    } else if (param.yPosition > maxY) {
      this.doc.addPage();
      this.curY = this.config.margini.alto;
      this.curX = this.config.margini.sx;
      if (param.offsetX) {
        this.curX += param.offsetX;
      }
    } else {
      throw new Error(`${param.yPosition} is not a valid position for y coordinate`);
    }
  }

  public advanceX(xPosition: number): void {
    const maxX = this.doc.internal.pageSize.getWidth() - this.config.margini.dx;
    if (xPosition >= this.config.margini.sx && xPosition <= maxX) {
      this.curX = xPosition;
    } else if (xPosition > maxX) {
      this.moveY({ yPosition: this.getNewLine(this.config.interlinea), offsetX: undefined });
      this.curX = this.config.margini.sx;
    } else {
      throw new Error(`${xPosition} is not a valid position for x coordinate`);
    }
  }

  public getNewLine(interlinea: number): number {
    const newY = this.curY + (this.doc.getFontSize() * interlinea / 72) * 25.4;
    if (newY > this.doc.internal.pageSize.getHeight() - this.config.margini.basso) {
      this.doc.addPage();
      this.curY = this.config.margini.alto;
      this.curX = this.config.margini.sx;
      return this.curY;
    }
    return newY;
  }

  public debugCursor(inputColor?: string, label?: string): void {
    const noise = Math.random();
    console.log(`cusor X:(${this.curX.toFixed(4)}), Y:(${this.curY.toFixed(4)}) *** noise: ${noise}`);
    if (this.debugActive) {
      const color = this.doc.getDrawColor();
      const txtColor = this.doc.getTextColor();
      if (inputColor) {
        this.doc.setTextColor(inputColor);
        this.doc.setDrawColor(inputColor);
      }
      else this.doc.setDrawColor('green');
      this.doc.line(this.curX - 2 + noise, this.curY + noise * .1, this.curX + 2, this.curY);
      this.doc.line(this.curX + noise, this.curY - 2 + noise * .1, this.curX, this.curY + 2);
      const txtSize = this.doc.getFontSize();
      this.doc.setFontSize(5);
      if (label) this.doc.text(label, this.curX, this.curY);
      this.doc.setDrawColor(color);
      this.doc.setTextColor(txtColor);
      this.doc.setFontSize(txtSize);
    }
  }

  public debugMargins(): void {
    if (this.debugActive) {
      const color = this.doc.getDrawColor();
      this.doc.setDrawColor("green");
      this.doc.line(
        this.config.margini.sx,
        this.config.margini.alto,
        this.doc.internal.pageSize.getWidth() - this.config.margini.dx,
        this.config.margini.alto,
      );
      this.doc.line(
        this.config.margini.sx,
        this.config.margini.alto,
        this.config.margini.sx,
        this.doc.internal.pageSize.getHeight() - this.config.margini.basso,
      );
      this.doc.line(
        this.doc.internal.pageSize.getWidth() - this.config.margini.dx,
        this.config.margini.alto,
        this.doc.internal.pageSize.getWidth() - this.config.margini.dx,
        this.doc.internal.pageSize.getHeight() - this.config.margini.basso,
      );
      this.doc.line(
        this.config.margini.sx,
        this.doc.internal.pageSize.getHeight() - this.config.margini.basso,
        this.doc.internal.pageSize.getWidth() - this.config.margini.dx,
        this.doc.internal.pageSize.getHeight() - this.config.margini.basso,
      );
      this.doc.setDrawColor(color);
    }
  }
}

async function loadImageAsBase64(imagePath: string): Promise<string> {
  const absolutePath = path.resolve(imagePath);
  const buffer = await fs.readFile(absolutePath);
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const base64 = buffer.toString('base64');
  return `data:image/${ext};base64,${base64}`;
}

export class DocumentGenerator {
  private template!: DocumentConfig;
  private config!: PageSettings;
  private contenuti!: Partial<Content>[];
  private doc!: jsPDF;
  private readonly configService: ConfigService;
  private readonly fontManager: FontManager;
  private readonly templateProcessor: TemplateProcessor;
  private readonly cursorManager: CursorManager;
  private pathFile: string;
  public _configPath?: string;
  public _configObject?: DocumentConfig;
  constructor(private inputConfig?: string | undefined) {
    this.configService = new ConfigService(inputConfig);
    this.fontManager = new FontManager();
    this.templateProcessor = new TemplateProcessor();
    this.cursorManager = new CursorManager();
    this._configPath = inputConfig;
  }

  public setConfig(config: DocumentConfig) {
    this.configService.setConfig(config);
    this.syncConfigData(this.configService.getConfigData());
    this._configObject = this.template;
    this._configPath = this.configService.getConfigPath();
  }


  private async ensureConfig(): Promise<void> {
    const data = await this.configService.loadConfig();
    this.syncConfigData(data);
    this._configObject = this.template;
    this._configPath = this.configService.getConfigPath();
  }

  private syncConfigData(data: ConfigData): void {
    this.template = data.template;
    this.config = data.pageSettings;
    this.contenuti = data.contenuti;
    this.fontManager.updateFonts(this.config.fonts);
  }


  //#region setter
  private set yCursor(param: { yPosition: number; offsetX?: number }) {
    this.cursorManager.moveY(param);
  }

  private set xCursor(xPosition: number) {
    this.cursorManager.advanceX(xPosition);
  }

  private get curX(): number {
    return this.cursorManager.currentX;
  }

  private set curX(value: number) {
    this.cursorManager.currentX = value;
  }

  private get curY(): number {
    return this.cursorManager.currentY;
  }

  private set curY(value: number) {
    this.cursorManager.currentY = value;
  }
  //#endregion

  /**
   * get the position of the cursor in a new line below the actual.
   */
  get yNewLine() {
    return this.cursorManager.getNewLine(this.config.interlinea);
  }
  //#region debug
  private debugCursor(inputColor?: string, label?: string) {
    this.cursorManager.debugCursor(inputColor, label);
  }

  private debugMargini() {
    this.cursorManager.debugMargins();
  }
  //#endregion

  //#region initDoc
  private async initDoc(): Promise<void> {
    try {
      this.doc = new jsPDF();
      this.cursorManager.initialize(this.doc, this.config);
      await this.fontManager.initialize(this.doc);
      this.debugMargini();
    } catch (error) {
      throw error;
    }
  }

  private setupText(fontId: string = 'default'): void {
    this.fontManager.setupText(this.doc, this.config.fonts, fontId);
  }

  private writePageNumber(label: string, totPages?: string, fontId?: string) {
    const pages = this.doc.internal.pages;
    for (let p = 1; p < pages.length; p++) {
      this.doc.setPage(p);
      this.setupText(fontId);
      let strlabel = label ? label : 'Pagina';
      strlabel += ` ${p}`;
      if (totPages) {
        strlabel += ` ${totPages} ${pages.length - 1}`;
      }
      let position = {
        x: this.doc.internal.pageSize.getWidth() * 0.5,
        y: this.doc.internal.pageSize.getHeight() - 10
      };
      this.doc.text(strlabel, position.x, position.y, { align: 'center', baseline: 'hanging' });
    }
  }
  //#endregion

  //#region insertImage

  private async insertImage(imgParam: ImageParams): Promise<{ x: number; y: number }> {
    try {
      let startX = this.curX;
      let startY = this.curY;
      if (imgParam.posizione) {
        startX += imgParam.posizione[0];
        startY += imgParam.posizione[1];
      }

      const format = imgParam.path.split('.').pop()?.toUpperCase() || 'PNG';
      const base64Image = await loadImageAsBase64(imgParam.path);
      if (startY + imgParam.dimensioni[1] > (this.doc.internal.pageSize.getHeight() - this.config.margini.basso)) {
        this.doc.addPage();
        this.curY = this.config.margini.alto;
        startY = this.curY + (imgParam.posizione ? imgParam.posizione[1] : 0);
      }
      this.doc.addImage(base64Image, format, startX, startY, imgParam.dimensioni[0], imgParam.dimensioni[1]);
      this.yCursor = { yPosition: (startY + imgParam.dimensioni[1]) };
      this.xCursor = this.curX + imgParam.dimensioni[0];
      return { x: this.curX, y: this.curY };
    } catch (error) {
      console.error(error);
    }
  }

  //#endregion

  /**
   * # parseText
   * trova i tag di formattazine, li rimuove dal testo e ritorna un oggetto con le impostazioni
   * passate nei tag
   * @param text 
   * @returns 
   */
  //#region parseText
  private parseText(text: string, params: DocumentParams): FormattedText {
    const contentWithoutTags = this.templateProcessor.stripFormattingTags(text);
    let content = this.templateProcessor.applyTemplate(contentWithoutTags, params.dynamicFields);
    content = this.templateProcessor.applyPartiPlaceholders(content, params.parti);
    let formattedText: FormattedText = { content };
    const tagGroups = this.templateProcessor.getTagConfigurations(text);
    for (const tags of tagGroups) {
      for (const tagContent of tags) {
        const keyValue = this.templateProcessor.parseKeyValue(tagContent);
        if (!keyValue) {
          continue;
        }
        const [key, value] = keyValue;
        switch (key) {
          case "fontId":
            formattedText.fontId = value;
            break;
          case "hAlign":
            formattedText.hAlign = value as HAlign;
            break;
          case "vAlign":
            formattedText.vAlign = value as VAlign;
            break;
          case "offsetX":
            const offX = Number(value);
            if (Number.isNaN(offX)) throw new Error("OffsetX is not a number");
            formattedText.offsetX = offX;
            break;
          case "offsetY":
            const offY = Number(value);
            if (Number.isNaN(offY)) throw new Error("OffsetY is not a number");
            formattedText.offsetY = offY;
            break;
          case "allinea":
            if (value === 'centra') {
              this.xCursor = this.doc.internal.pageSize.getWidth() / 2;
              formattedText.centra = true;
            } else {
              console.warn("invalid value passed to 'allinea'");
            }
            break;
        }
      }
    }
    return formattedText;
  }


  //#region parseSections
  private parseBoldSections(content: string): SectionsText[] {
    return this.templateProcessor.parseBoldSections(content);
  }
  //#endregion

  //#region drawBox
  private drawBox(
    text: string,
    maxWidth: number,
    option: TextOptionsLight
  ): { x: number, y: number } {
    let [x, y, w, h, r] = [
      this.curX,
      this.curY,
      maxWidth + this.config.box.padding,
      0,
      this.config.box.raggio
    ];
    let section = this.parseBoldSections(text);
    // writeSection
    let endCur = { x: 0, y: 0 };
    let txtCur = { x: this.curX, y: this.curY };
    for (const s of section) {
      let text = s.text.replace(/\*\*/g, '');
      this.doc.setFont(this.doc.getFont().fontName, s.type);
      endCur = this.writeTextInLine(text, maxWidth, option);
    }
    if (!option.baseline || option.baseline === 'alphabetic') {
      y -= this.doc.getFontSize() * this.config.interlinea / 72 * 25.4;

    } else if (option.baseline === 'middle') {
      y -= (this.doc.getFontSize() * this.config.interlinea / 72 * 25.4) * 0.5;
    }

    x -= this.config.box.padding * .5;
    h = this.config.box.padding + (endCur.y - y);
    this.doc.setDrawColor(this.config.box.lineColor);
    this.doc.setLineWidth(this.config.box.lineWidth);
    this.doc.setFillColor(this.config.box.background);
    this.doc.roundedRect(x, y, w, h, r, r, 'FD');

    this.xCursor = txtCur.x;
    this.yCursor = {yPosition: txtCur.y};
    for (const s of section) {
      let text = s.text.replace(/\*\*/g, '');
      this.doc.setFont(this.doc.getFont().fontName, s.type);
      endCur = this.writeTextInLine(text, maxWidth, option);
    }
    this.yCursor = {yPosition: this.curY + (this.doc.getFontSize() * this.config.interlinea / 72 * 25.4)};
    return endCur;
  }
  //#endregion

  //#region writeTextSection
  private writeTextSection(
    origText: string,
    params: DocumentParams,
    offsetX?: number,
    offsetY?: number
  ): { x: number, y: number } {
    let finalCur = { x: NaN, y: NaN };
    const maxWidth = this.doc.internal.pageSize.getWidth()
      - this.config.margini.dx
      - (offsetX ? offsetX : this.curX);
    let write = this.parseText(origText, params);
    let textToWrite = write.content;
    this.setupText(write.fontId);
    const option: TextOptionsLight = {
      // align: write.hAlign ? write.hAlign : null,
      baseline: write.vAlign ? write.vAlign : null
    };
    let boxedText = textToWrite.match(/^\^.*\^$/);
    if (boxedText) {
      textToWrite = textToWrite.replace(/\^/g, '');
      finalCur = this.drawBox(textToWrite, maxWidth, option);
      this.curX = /*this.config.margini.sx +*/ offsetX;
    } else {
      let section = this.parseBoldSections(textToWrite);
      // writeSection
      for (const s of section) {
        let text = s.text.replace(/\*\*/g, '');
        this.doc.setFont(this.doc.getFont().fontName, s.type);
        // this.xCursor = startCur.x;
        // update the value of offset if there is something returned by parseText
        const [offX, offY] = [
          offsetX + (write.offsetX ? write.offsetX : 0),
          offsetY + (write.offsetY ? write.offsetY : 0),
        ];
        finalCur = this.writeTextInLine(text, maxWidth, option, offX, offY, write.centra);
        // this.debugCursor('#aa00aa', "finalCur");
      }
    }
    this.curX = this.config.margini.sx;
    // this.yCursor = this.curY + this.config.staccoriga;
    this.setupText();
    return finalCur;
  }
  //#endregion

  //#region writeTextInLine
  private writeTextInLine(
    text: string,
    maxWidth: number,
    option: TextOptionsLight,
    offsetX?: number,
    offsetY?: number,
    centra?: boolean
  ): { x: number, y: number } {
    let words = text.split(" ");
    if (offsetX && this.curX < offsetX) {
      this.xCursor = offsetX;
    }
    if (offsetY && this.curY < offsetY) {
      this.yCursor = {yPosition: this.curY + offsetY, offsetX: offsetX};
    }
    let spaceWidth = this.doc.getTextWidth(" ");
    let lineWidth = 0;
    const netWidth = this.doc.internal.pageSize.getWidth() - this.config.margini.dx;

    for (let word of words) {
      let wordWidth = this.doc.getTextWidth(word);
      if (lineWidth + wordWidth >= maxWidth || this.curX + wordWidth >= netWidth) {
        // re-set x-cursor
        this.curX = this.config.margini.sx;
        this.yCursor = { yPosition: this.yNewLine, offsetX: offsetX };
        if (offsetX && this.curX < offsetX) {
          this.xCursor = offsetX;
        }
        lineWidth = 0;
      }

      if (word !== '') {
        this.doc.text(word, this.curX, this.curY, option);
        this.curX += wordWidth + spaceWidth;
        lineWidth += wordWidth + spaceWidth;
      }
    }
    return { x: Number(this.curX), y: Number(this.curY) };
  }
  //#endregion

  //#region generateDocument
  public async generateDocument(params: DocumentParams): Promise<string> {
    try {
      await this.ensureConfig(); // read the config json file
      await this.initDoc(); // prepares the doc obj and the cursor
      this.pathFile = params.nomeFile;
      // Parse contents
      for (const block of this.contenuti) {
        let finalCur = { x: NaN, y: NaN };
        for (const key of Object.keys(block)) {
          const [blockX, blockY] = [this.curX, this.curY];
          switch (key) {
            //#region 'testo'
            case 'testo':
              let testo = block[key];
              if (Array.isArray(testo)) {
                testo.forEach((riga, i, arr) => {
                  let tmpCur = this.writeTextSection(riga, params, blockX);
                  if (tmpCur.x > finalCur.x || Number.isNaN(finalCur.x))
                    finalCur.x = Number(tmpCur.x);
                  if (tmpCur.y > finalCur.y || Number.isNaN(finalCur.y))
                    finalCur.y = Number(tmpCur.y);
                  if (i < arr.length - 1) this.yCursor = {yPosition: this.yNewLine, offsetX: blockX};
                });
              } else {
                finalCur = this.writeTextSection(testo, params, blockX);
              }
              break;
            //#region 'testoBox'
            case 'testoBox':
              let testoBox = block[key];
              if (Array.isArray(testoBox)) {
                let tmpCur = {
                  x: NaN,
                  y: NaN
                }
                testoBox.forEach((riga: string, i: number, arr) => {
                  tmpCur = this.writeTextSection(riga, params, blockX);
                  if (tmpCur.x > finalCur.x || Number.isNaN(finalCur.x))
                    finalCur.x = Number(tmpCur.x);
                  if (tmpCur.y > finalCur.y || Number.isNaN(finalCur.y))
                    finalCur.y = Number(tmpCur.y);
                  if (i < arr.length - 1) this.yCursor = {yPosition: this.yNewLine, offsetX: blockX};
                });
                const [x, y, w, h] = [
                  blockX - this.config.box.padding * 0.5,
                  blockY - (this.doc.getFontSize() * this.config.interlinea / 72) * 25.4 - (this.config.box.padding * 0.5),
                  finalCur.x - blockX + this.config.box.padding,
                  finalCur.y - blockY + this.config.box.padding + (this.doc.getFontSize() * this.config.interlinea / 72) * 25.4,
                  this.config.box.raggio,
                  this.config.box.raggio
                ];

                this.doc.setDrawColor(this.config.box.lineColor);
                this.doc.setLineWidth(this.config.box.lineWidth);
                this.doc.setFillColor(this.config.box.background);
                this.doc.roundedRect(
                  x,
                  y,
                  w,
                  h,
                  this.config.box.raggio,
                  this.config.box.raggio,
                  "FD"
                );
                this.curX = blockX;
                this.curY = blockY;
                testoBox.forEach((riga: string, i: number, arr) => {
                  tmpCur = this.writeTextSection(riga, params, blockX);
                  if (tmpCur.x > finalCur.x || Number.isNaN(finalCur.x))
                    finalCur.x = Number(tmpCur.x);
                  if (tmpCur.y > finalCur.y || Number.isNaN(finalCur.y))
                    finalCur.y = Number(tmpCur.y);
                  if (i < arr.length - 1) this.yCursor = {yPosition: this.yNewLine, offsetX: blockX};
                });


              } else {
                console.warn("testoBox value must be an array of strings");
              }
              break;
            //#region 'Punti'
            case 'punti':
              const punti = block[key] as Elenco[];

              for (const section of punti) {
                let numRientri = 1;
                finalCur = this.writeTextSection(section.titolo, params);
                this.curY += this.config.staccoriga;

                let tmpCur = { x: finalCur.x, y: finalCur.y };
                for (const point of section.sottopunti) {
                  numRientri = 2;
                  const offsetX = this.config.margini.sx + this.config.rientro * numRientri;
                  tmpCur = this.writeTextSection(point.titolo, params, offsetX, undefined);
                  numRientri++
                  this.curY = this.yNewLine;
                  // adding numbers or symbol at the beginning of the row
                  if (point.punto) {
                    tmpCur = this.writeTextSection(
                      point.punto, params,
                      this.config.margini.sx + this.config.rientro * numRientri,
                      undefined
                    );
                    numRientri++;
                  }
                  point.contenuto?.forEach(line => {
                    const offsetX = this.config.margini.sx + this.config.rientro * numRientri;
                    tmpCur = this.writeTextSection(line, params, offsetX, undefined);
                    // this.curY = this.yNewLine;
                    this.yCursor = {yPosition: this.yNewLine, offsetX: offsetX}
                  })
                  this.yCursor = {yPosition: (this.curY + this.config.staccoriga), offsetX: offsetX};
                }
                if (tmpCur.x > finalCur.x || Number.isNaN(finalCur.x))
                  finalCur.x = Number(tmpCur.x);
                if (tmpCur.y > finalCur.y || Number.isNaN(finalCur.y))
                  finalCur.y = Number(tmpCur.y);
              }
              break;
            //#region 'immagine'
            case 'immagine':
              let imgParam = block[key] as ImageParams
              let tmpCur = await this.insertImage(imgParam);
              if (tmpCur.x > finalCur.x || Number.isNaN(finalCur.x))
                finalCur.x = Number(tmpCur.x);
              if (tmpCur.y > finalCur.y || Number.isNaN(finalCur.y))
                finalCur.y = Number(tmpCur.y);
              break;
            //#region 'tabella'
            case 'tabella':
              const tabData = params.dynamicElements[block[key]];
              if (!tabData.config.styles) {
                tabData.config.styles = {
                  font: this.doc.getFont().fontName,
                  fontSize: this.doc.getFontSize(),
                  textColor: this.doc.getTextColor(),
                }
              } else if (!tabData.config.styles.font) {
                tabData.config.styles.font = this.doc.getFont().fontName;
                tabData.config.styles.fontSize = this.doc.getFontSize();
                tabData.config.styles.textColor = this.doc.getTextColor();
              }
              autotable(this.doc, {
                ...tabData.config as UserOptions,
                startY: this.curY,
                margin: {
                  left: this.config.margini.sx,
                  right: this.config.margini.dx
                },
                styles: {
                  ...tabData.config.styles,
                },
                didDrawCell: (data) => {
                  this.xCursor = data.cursor.x;
                  this.yCursor = {yPosition: data.cursor.y};
                }
              });
              finalCur = {
                x: this.curX,
                y: this.yNewLine
              }
              break;
            //#region 'saltoRiga'
            case 'saltoRiga':
              const rowsNumber = Number(block[key]);
              finalCur.y = this.curY + (this.doc.getFontSize() * this.config.interlinea / 72) * 25.4 * rowsNumber;
              break;
            //#endregion
            default:
              break;
          }
          if (!Number.isNaN(finalCur.x))
            this.xCursor = finalCur.x;
          if (!Number.isNaN(blockY))
            this.yCursor = {yPosition: blockY, offsetX: undefined};
        }
        if (!Number.isNaN(finalCur.y))
          this.yCursor = {yPosition: finalCur.y, offsetX: undefined};
        this.yCursor = {yPosition: (this.yNewLine + this.config.staccoriga), offsetX: undefined};
        this.curX = this.config.margini.sx;
      };
      if (params.numPagina) {
        this.writePageNumber(params.numPagina.label, params.numPagina.totPages, params.numPagina.fontId);
      }
      this.doc.save(params.nomeFile);
      if (params.allegaDocDopo || params.allegaDocPrima)
        await this.mergeDocument(params);

      return this.document;
    } catch (error) {
      console.error(error);
    }
  }
  //#endregion

  //#region mergeDocument
  /**
   * # Merge external pdf
   * Take the path of a file and the path of the generated doc, merge the generated with 
   * the input file and saves the final document with `nomeFile` found un `DocumentParams`
   * 
   * @param pathDocBefore 
   * @param pathDocAfter 
   */
  private async mergeDocument(params: DocumentParams) {
    const mergedPdf = await PDFDocument.create();

    const before = await PDFDocument.load(
      await fs.readFile(params.allegaDocPrima)
    );
    const doc = await PDFDocument.load(
      await fs.readFile(params.nomeFile)
    );
    const after = await PDFDocument.load(
      await fs.readFile(params.allegaDocDopo)
    );

    // copy pages on the temporary object document


    let copiedPages = await mergedPdf.copyPages(before, before.getPageIndices())
    copiedPages.forEach(page => {
      mergedPdf.addPage(page);
    });

    copiedPages = []
    copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach(page => {
      mergedPdf.addPage(page);
    });

    copiedPages = []
    copiedPages = await mergedPdf.copyPages(after, after.getPageIndices());
    copiedPages.forEach(page => {
      mergedPdf.addPage(page);
    });

    await fs.writeFile(params.nomeFile, await mergedPdf.save());
  }
  //#endregion


  /**
   * @returns base64 string from read Buffer of pdf 
   */
  get document(): string {
    try {
      console.log("name file ", this.pathFile);
      const stat = statSync(this.pathFile);
      console.log("Stat: ", stat, "File?", stat.isFile())
      if (!stat.isFile()) throw new Error("Path does not point to a file");
      return readFileSync(this.pathFile, {encoding: 'base64'});
    } catch (error) {
      console.error("GET Document: ", error);
    }
  }
}