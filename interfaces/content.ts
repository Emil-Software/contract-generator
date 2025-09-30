import { UserOptions } from "jspdf-autotable";

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

