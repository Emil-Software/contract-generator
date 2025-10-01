import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface TemplateFont {
  id: string;
  nome: string;
  dimensione: number;
  colore: string;
  style: string;
  installPath?: string;
}

interface TemplateMargins {
  sx: number;
  dx: number;
  alto: number;
  basso: number;
}

interface TemplateBox {
  background: string;
  raggio: number;
  padding: number;
  lineWidth: number;
  lineColor: string;
}

interface TemplateContentBase {
  tipo: 'testo' | 'testoBox' | 'saltoRiga' | 'tabella' | 'punti' | 'immagine';
}

interface TemplateTextContent extends TemplateContentBase {
  tipo: 'testo';
  testo: string;
}

interface TemplateTextBoxContent extends TemplateContentBase {
  tipo: 'testoBox';
  testoBox: string[];
}

interface TemplateLineBreakContent extends TemplateContentBase {
  tipo: 'saltoRiga';
  saltoRiga: number;
}

interface TemplateTableContent extends TemplateContentBase {
  tipo: 'tabella';
  tabella: string;
}

interface TemplateBulletContent extends TemplateContentBase {
  tipo: 'punti';
  punti: Array<{
    titolo: string;
    sottopunti: Array<{
      titolo: string;
      contenuto: string[];
    }>;
  }>;
}

interface TemplateImageContent extends TemplateContentBase {
  tipo: 'immagine';
  immagine: {
    path: string;
    posizione: [number, number];
    dimensioni: [number, number];
    coeffDim?: number;
  };
}

type TemplateContent =
  | TemplateTextContent
  | TemplateTextBoxContent
  | TemplateLineBreakContent
  | TemplateTableContent
  | TemplateBulletContent
  | TemplateImageContent;

interface TemplateConfig {
  versione: string;
  impostazioniPagina: {
    fonts: TemplateFont[];
    margini: TemplateMargins;
    interlinea: number;
    staccoriga: number;
    rientro: number;
    box: TemplateBox;
  };
  contenuti: TemplateContent[];
}

@Component({
  selector: 'app-template-generator',
  templateUrl: './template-generator.component.html',
  styleUrls: ['./template-generator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateGeneratorComponent {
  readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      versione: ['0.1.1', Validators.required],
      impostazioniPagina: this.fb.group({
        fonts: this.fb.array([this.createFontGroup()]),
        margini: this.fb.group({
          sx: [10, Validators.required],
          dx: [19, Validators.required],
          alto: [10, Validators.required],
          basso: [10, Validators.required],
        }),
        interlinea: [1.08, Validators.required],
        staccoriga: [5, Validators.required],
        rientro: [3, Validators.required],
        box: this.fb.group({
          background: ['#faffc7'],
          raggio: [2],
          padding: [2],
          lineWidth: [0.12],
          lineColor: ['#cc1269'],
        }),
      }),
      contenuti: this.fb.array([this.createTextContentGroup()]),
    });
  }

  get fonts(): FormArray<FormGroup> {
    return this.form.get('impostazioniPagina.fonts') as FormArray<FormGroup>;
  }

  get contenuti(): FormArray<FormGroup> {
    return this.form.get('contenuti') as FormArray<FormGroup>;
  }

  addFont(): void {
    this.fonts.push(this.createFontGroup());
  }

  removeFont(index: number): void {
    this.fonts.removeAt(index);
  }

  addContent(type: TemplateContent['tipo']): void {
    switch (type) {
      case 'testo':
        this.contenuti.push(this.createTextContentGroup());
        break;
      case 'testoBox':
        this.contenuti.push(this.createTextBoxContentGroup());
        break;
      case 'saltoRiga':
        this.contenuti.push(this.createLineBreakGroup());
        break;
      case 'tabella':
        this.contenuti.push(this.createTableGroup());
        break;
      case 'punti':
        this.contenuti.push(this.createBulletGroup());
        break;
      case 'immagine':
        this.contenuti.push(this.createImageGroup());
        break;
    }
  }

  removeContent(index: number): void {
    this.contenuti.removeAt(index);
  }

  addTestoBoxRow(contentIndex: number): void {
    const rows = this.contenuti.at(contentIndex).get('testoBox') as FormArray;
    rows.push(this.fb.control('', Validators.required));
  }

  removeTestoBoxRow(contentIndex: number, rowIndex: number): void {
    const rows = this.contenuti.at(contentIndex).get('testoBox') as FormArray;
    rows.removeAt(rowIndex);
  }

  addBulletPoint(contentIndex: number): void {
    const bulletArray = this.contenuti.at(contentIndex).get('punti') as FormArray<FormGroup>;
    bulletArray.push(this.createBulletPointGroup());
  }

  removeBulletPoint(contentIndex: number, bulletIndex: number): void {
    const bulletArray = this.contenuti.at(contentIndex).get('punti') as FormArray<FormGroup>;
    bulletArray.removeAt(bulletIndex);
  }

  addSubPoint(contentIndex: number, bulletIndex: number): void {
    const bulletArray = this.contenuti.at(contentIndex).get('punti') as FormArray<FormGroup>;
    const subPoints = bulletArray.at(bulletIndex).get('sottopunti') as FormArray<FormGroup>;
    subPoints.push(this.createSubPointGroup());
  }

  removeSubPoint(contentIndex: number, bulletIndex: number, subPointIndex: number): void {
    const bulletArray = this.contenuti.at(contentIndex).get('punti') as FormArray<FormGroup>;
    const subPoints = bulletArray.at(bulletIndex).get('sottopunti') as FormArray<FormGroup>;
    subPoints.removeAt(subPointIndex);
  }

  addSubPointContentRow(
    contentIndex: number,
    bulletIndex: number,
    subPointIndex: number
  ): void {
    const bulletArray = this.contenuti.at(contentIndex).get('punti') as FormArray<FormGroup>;
    const subPoints = bulletArray.at(bulletIndex).get('sottopunti') as FormArray<FormGroup>;
    const rows = subPoints.at(subPointIndex).get('contenuto') as FormArray;
    rows.push(this.fb.control('', Validators.required));
  }

  removeSubPointContentRow(
    contentIndex: number,
    bulletIndex: number,
    subPointIndex: number,
    rowIndex: number
  ): void {
    const bulletArray = this.contenuti.at(contentIndex).get('punti') as FormArray<FormGroup>;
    const subPoints = bulletArray.at(bulletIndex).get('sottopunti') as FormArray<FormGroup>;
    const rows = subPoints.at(subPointIndex).get('contenuto') as FormArray;
    rows.removeAt(rowIndex);
  }

  getTemplateJson(pretty = true): string {
    const value = this.form.getRawValue();
    return JSON.stringify(this.mapFormToTemplate(value), null, pretty ? 2 : undefined);
  }

  downloadTemplate(): void {
    const json = this.getTemplateJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'template.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  loadExample(): void {
    const example = this.getExampleTemplate();
    this.form.reset();

    while (this.fonts.length) {
      this.fonts.removeAt(0);
    }

    example.impostazioniPagina.fonts.forEach((font) => {
      this.fonts.push(
        this.fb.group({
          id: [font.id, Validators.required],
          nome: [font.nome, Validators.required],
          dimensione: [font.dimensione, [Validators.required, Validators.min(1)]],
          colore: [font.colore, Validators.required],
          style: [font.style, Validators.required],
          installPath: [font.installPath ?? ''],
        })
      );
    });

    while (this.contenuti.length) {
      this.contenuti.removeAt(0);
    }

    example.contenuti.forEach((content) => {
      switch (content.tipo) {
        case 'testo':
          this.contenuti.push(
            this.fb.group({
              tipo: ['testo'],
              testo: [content.testo, Validators.required],
            })
          );
          break;
        case 'testoBox':
          this.contenuti.push(
            this.fb.group({
              tipo: ['testoBox'],
              testoBox: this.fb.array(content.testoBox.map((row) => this.fb.control(row, Validators.required))),
            })
          );
          break;
        case 'saltoRiga':
          this.contenuti.push(
            this.fb.group({
              tipo: ['saltoRiga'],
              saltoRiga: [content.saltoRiga, [Validators.required, Validators.min(1)]],
            })
          );
          break;
        case 'tabella':
          this.contenuti.push(
            this.fb.group({
              tipo: ['tabella'],
              tabella: [content.tabella, Validators.required],
            })
          );
          break;
        case 'punti':
          this.contenuti.push(
            this.fb.group({
              tipo: ['punti'],
              punti: this.fb.array(
                content.punti.map((point) =>
                  this.fb.group({
                    titolo: [point.titolo, Validators.required],
                    sottopunti: this.fb.array(
                      point.sottopunti.map((sub) =>
                        this.fb.group({
                          titolo: [sub.titolo, Validators.required],
                          contenuto: this.fb.array(sub.contenuto.map((row) => this.fb.control(row, Validators.required))),
                        })
                      )
                    ),
                  })
                )
              ),
            })
          );
          break;
        case 'immagine':
          this.contenuti.push(
            this.fb.group({
              tipo: ['immagine'],
              immagine: this.fb.group({
                path: [content.immagine.path, Validators.required],
                posizione: this.fb.group({
                  x: [content.immagine.posizione[0], Validators.required],
                  y: [content.immagine.posizione[1], Validators.required],
                }),
                dimensioni: this.fb.group({
                  width: [content.immagine.dimensioni[0], Validators.required],
                  height: [content.immagine.dimensioni[1], Validators.required],
                }),
                coeffDim: [content.immagine.coeffDim ?? null],
              }),
            })
          );
          break;
      }
    });

    this.form.patchValue({
      versione: example.versione,
      impostazioniPagina: {
        margini: example.impostazioniPagina.margini,
        interlinea: example.impostazioniPagina.interlinea,
        staccoriga: example.impostazioniPagina.staccoriga,
        rientro: example.impostazioniPagina.rientro,
        box: example.impostazioniPagina.box,
      },
    });
  }

  private createFontGroup(): FormGroup {
    return this.fb.group({
      id: ['', Validators.required],
      nome: ['', Validators.required],
      dimensione: [8, [Validators.required, Validators.min(1)]],
      colore: ['#000000', Validators.required],
      style: ['normal', Validators.required],
      installPath: [''],
    });
  }

  private createTextContentGroup(): FormGroup {
    return this.fb.group({
      tipo: ['testo'],
      testo: ['', Validators.required],
    });
  }

  private createTextBoxContentGroup(): FormGroup {
    return this.fb.group({
      tipo: ['testoBox'],
      testoBox: this.fb.array([this.fb.control('', Validators.required)]),
    });
  }

  private createLineBreakGroup(): FormGroup {
    return this.fb.group({
      tipo: ['saltoRiga'],
      saltoRiga: [1, [Validators.required, Validators.min(1)]],
    });
  }

  private createTableGroup(): FormGroup {
    return this.fb.group({
      tipo: ['tabella'],
      tabella: ['', Validators.required],
    });
  }

  private createBulletGroup(): FormGroup {
    return this.fb.group({
      tipo: ['punti'],
      punti: this.fb.array([this.createBulletPointGroup()]),
    });
  }

  private createBulletPointGroup(): FormGroup {
    return this.fb.group({
      titolo: ['', Validators.required],
      sottopunti: this.fb.array([this.createSubPointGroup()]),
    });
  }

  private createSubPointGroup(): FormGroup {
    return this.fb.group({
      titolo: ['', Validators.required],
      contenuto: this.fb.array([this.fb.control('', Validators.required)]),
    });
  }

  private createImageGroup(): FormGroup {
    return this.fb.group({
      tipo: ['immagine'],
      immagine: this.fb.group({
        path: ['', Validators.required],
        posizione: this.fb.group({
          x: [0, Validators.required],
          y: [0, Validators.required],
        }),
        dimensioni: this.fb.group({
          width: [40, Validators.required],
          height: [20, Validators.required],
        }),
        coeffDim: [null],
      }),
    });
  }

  private mapFormToTemplate(formValue: any): TemplateConfig {
    const fonts: TemplateFont[] = formValue.impostazioniPagina.fonts.map((font: any) => ({
      id: font.id,
      nome: font.nome,
      dimensione: Number(font.dimensione),
      colore: font.colore,
      style: font.style,
      ...(font.installPath ? { installPath: font.installPath } : {}),
    }));

    const contenuti: TemplateContent[] = formValue.contenuti.map((content: any) => {
      switch (content.tipo) {
        case 'testo':
          return {
            tipo: 'testo',
            testo: content.testo,
          } satisfies TemplateTextContent;
        case 'testoBox':
          return {
            tipo: 'testoBox',
            testoBox: content.testoBox,
          } satisfies TemplateTextBoxContent;
        case 'saltoRiga':
          return {
            tipo: 'saltoRiga',
            saltoRiga: Number(content.saltoRiga),
          } satisfies TemplateLineBreakContent;
        case 'tabella':
          return {
            tipo: 'tabella',
            tabella: content.tabella,
          } satisfies TemplateTableContent;
        case 'punti':
          return {
            tipo: 'punti',
            punti: content.punti.map((point: any) => ({
              titolo: point.titolo,
              sottopunti: point.sottopunti.map((sub: any) => ({
                titolo: sub.titolo,
                contenuto: sub.contenuto,
              })),
            })),
          } satisfies TemplateBulletContent;
        case 'immagine':
          return {
            tipo: 'immagine',
            immagine: {
              path: content.immagine.path,
              posizione: [Number(content.immagine.posizione.x), Number(content.immagine.posizione.y)],
              dimensioni: [Number(content.immagine.dimensioni.width), Number(content.immagine.dimensioni.height)],
              ...(content.immagine.coeffDim ? { coeffDim: Number(content.immagine.coeffDim) } : {}),
            },
          } satisfies TemplateImageContent;
        default:
          return content;
      }
    });

    return {
      versione: formValue.versione,
      impostazioniPagina: {
        fonts,
        margini: {
          sx: Number(formValue.impostazioniPagina.margini.sx),
          dx: Number(formValue.impostazioniPagina.margini.dx),
          alto: Number(formValue.impostazioniPagina.margini.alto),
          basso: Number(formValue.impostazioniPagina.margini.basso),
        },
        interlinea: Number(formValue.impostazioniPagina.interlinea),
        staccoriga: Number(formValue.impostazioniPagina.staccoriga),
        rientro: Number(formValue.impostazioniPagina.rientro),
        box: {
          background: formValue.impostazioniPagina.box.background,
          raggio: Number(formValue.impostazioniPagina.box.raggio),
          padding: Number(formValue.impostazioniPagina.box.padding),
          lineWidth: Number(formValue.impostazioniPagina.box.lineWidth),
          lineColor: formValue.impostazioniPagina.box.lineColor,
        },
      },
      contenuti,
    } satisfies TemplateConfig;
  }

  private getExampleTemplate(): TemplateConfig {
    return {
      versione: '0.1.1',
      impostazioniPagina: {
        fonts: [
          {
            id: 'default',
            nome: 'Montserrat',
            dimensione: 8,
            colore: '#000000',
            style: 'bold, normal',
            installPath: './Montserrat-Bold.ttf, ./Montserrat-Regular.ttf',
          },
          {
            id: 'helvetica_10',
            nome: 'helvetica',
            dimensione: 10,
            colore: '#000000',
            style: 'normal',
          },
          {
            id: 'testiPiccoli',
            nome: 'courier',
            dimensione: 6,
            colore: '#000000',
            style: 'italic',
          },
        ],
        margini: { sx: 10, dx: 19, alto: 10, basso: 10 },
        interlinea: 1.08,
        staccoriga: 5,
        rientro: 3,
        box: {
          background: '#faffc7',
          raggio: 2,
          padding: 2,
          lineWidth: 0.12,
          lineColor: '#cc1269',
        },
      },
      contenuti: [
        {
          tipo: 'testoBox',
          testoBox: [
            'Contratto di servizio tra **pincoPallino Joe srl** e $cliente:denominazione$',
            'Altro testo su una nuova riga per vedere dove arriva il cursore',
            'Magari proviamo a scendere ulteriormente',
          ],
        },
        {
          tipo: 'immagine',
          immagine: {
            path: './logo.png',
            posizione: [0, 0],
            dimensioni: [40, 20],
            coeffDim: 0.042,
          },
        },
        {
          tipo: 'testo',
          testo: 'Questo è un testo di prova, potrebbe essere una intestazione con il **nome azienda**',
        },
        {
          tipo: 'saltoRiga',
          saltoRiga: 1,
        },
        {
          tipo: 'testo',
          testo: 'Contratto di servizio tra pincoPallino Joe srl e $cliente:denominazione$ in data $data$',
        },
        {
          tipo: 'testo',
          testo:
            '<|fontId: default|>Il presente contratto (di seguito, "Contratto") regola i **termini** e le **condizioni** tra $fornitore:denominazione$, codice fiscale $fornitore:codiceFiscale$, con sede in $fornitore:indirizzoCompleto$, e $cliente:denominazione$, **codice fiscale** $cliente:codiceFiscale$, con sede in $cliente:indirizzoCompleto$, per la fornitura e gestione di kit di biancheria da lavanderie industriali.',
        },
        {
          tipo: 'testo',
          testo:
            '^Omnis illo molestiae ut et amet **blanditiis** amet. Ea voluptas est nostrum saepe corrupti. Incidunt nobis quos voluptatem laboriosam excepturi sed. Deserunt exercitationem praesentium quasi. Ab blanditiis vero sit eveniet. Accusamus quae explicabo rerum rem corrupti placeat similique voluptatem. Non assumenda at voluptas deleniti ipsum numquam accusantium. Laudantium eum ut possimus ullam perferendis nemo. Facere distinctio earum quia. Unde rerum qui dolorum. Repellat esse veniam voluptatum dolores placeat et. Autem et labore provident non. Nihil dolore exercitationem vel hic dolorem voluptatem. Rerum quae natus quia consectetur eaque natus veritatis consequatur. Corporis magnam suscipit nihil autem natus. Quia libero et hic ipsam praesentium omnis aut esse.^',
        },
        {
          tipo: 'testo',
          testo: '<|fontId: helvetica_10|>^Box della **denominazione** del cliente $cliente:denominazione$^',
        },
        {
          tipo: 'tabella',
          tabella: 'TABLE1',
        },
        {
          tipo: 'punti',
          punti: [
            {
              titolo: '1. OGGETTO DEL CONTRATTO',
              sottopunti: [
                {
                  titolo: '1.1. Servizio fornito da pincoPallino Joe srl',
                  contenuto: [
                    'pincoPallino Joe si impegna a:',
                    '• Lanciare ',
                    '• Schivare ',
                    '• Piegarsi ',
                    '• Abbassarsi ',
                    '• Schivare ',
                  ],
                },
                {
                  titolo: '**1.3. Ordini**',
                  contenuto: [
                    'Gli **ordini** possono essere caricati:',
                    '• Manualmente tramite lo store e-commerce pincoPallino Joe,',
                    '• Gli ordini devono rispettare i check-out',
                  ],
                },
                {
                  titolo: '2.2. Il pagamento deve avvenire al momento dell\'ordine tramite:',
                  contenuto: ['• Carta di credito', '• SEPA (bonifico bancario)', '• SDD'],
                },
                {
                  titolo: '3.3. Consegne mancanti o ritardate',
                  contenuto: [
                    'In caso di mancata consegna per cause imputabili al Cliente, la consegna sarà riprogrammata con addebito:',
                    '• Del costo della consegna “saltata”.',
                    '• Del costo della nuova consegna.',
                  ],
                },
                {
                  titolo: '7.1. Obblighi del Cliente',
                  contenuto: ['• Giocare a dodgeball'],
                },
              ],
            },
          ],
        },
        {
          tipo: 'immagine',
          immagine: {
            path: './logo.png',
            posizione: [0, 0],
            dimensioni: [40, 30],
            coeffDim: 0.042,
          },
        },
      ],
    } satisfies TemplateConfig;
  }
}
