import { jsPDF } from "jspdf";
import { PageSettings } from "../interfaces/doc";

export class CursorManager {
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
