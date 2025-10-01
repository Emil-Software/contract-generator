import { promises as fs } from 'fs';
import * as path from 'path';
import { jsPDF } from "jspdf";
import { DocumentFont } from "../interfaces/doc";

export class FontManager {
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
