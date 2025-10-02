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
  style?: 'bold' | 'italic' | 'normal' | 'bolditalic' | string;
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

export interface FormattedText {
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

export interface SectionsText {
  text: string;
  type: 'bold' | 'normal';
  start: number;
  end: number;
}

export type HAlign = "center" | "left" | "right" | "justify";

export type VAlign = "top" | "bottom" | "middle";

export type ConfigData = {
  template: DocumentConfig;
  pageSettings: PageSettings;
  contenuti: Partial<Content>[];
};