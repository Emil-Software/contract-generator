import { DocumentParams } from '../../interfaces/content';
import { DocumentConfig } from '../../interfaces/doc';
import { DocumentGenerator } from '../../ContractGenerator';

async function testDocumentGenerator() {
    const generator = new DocumentGenerator('test.json');
    // const generator = new DocumentGenerator({
    //     versione: '',
    //     impostazioniPagina: {
    //         fonts: [],
    //         margini: {
    //             sx: 0,
    //             dx: 0,
    //             alto: 0,
    //             basso: 0
    //         },
    //         staccoriga: 0,
    //         interlinea: 0,
    //         rientro: 0,
    //         box: {
    //             background: '',
    //             raggio: 0,
    //             padding: 0,
    //             lineWidth: 0,
    //             lineColor: ''
    //         }
    //     },
    //     contenuti: [
    //         {
    //             testo: "Hello World!",
    //         }
    //     ]
    // });

    const params: DocumentParams = {
        nomeFile: "Documento Generato.pdf",
        // allegaDocDopo: "",
        // allegaDocPrima: "",
        numPagina: {
            label: "Pag",
            fontId: "testiPiccoli",
            totPages: "di"
        },
        parti: {
            fornitore: {
                denominazione: "Supplier Co",
                codiceFiscale: "123456789",
                indirizzoCompleto: "Via Supplier, 1, 00100 Roma"
            },
            cliente: {
                denominazione: "Acme Corp",
                codiceFiscale: "987654321",
                indirizzoCompleto: "Via Client, 2, 20100 Milano"
            }
        },
        tipOutput: 'd', // 'f' to open in a new window for visual inspection.
        dynamicFields: {
            numeroContratto: 'ABC123',
            data: new Date().toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })

        },

        dynamicElements: {
            TABLE1: {
                type: 'table',
                config: {
                    head: [['Column 1', 'Column 2']],
                    body: [
                        ['Row 1, Col 1', 'Row 1, Col 2'],
                        ['Row 2, Col 1', 'Row 2, Col 2'],
                        ['Row 3, Col 1', 'Row 3, Col 2'],
                        ['Row 4, Col 1', 'Row 4, Col 2'],
                        ['Row 5, Col 1', 'Row 5, Col 2'],
                        ['Row 6, Col 1', 'Row 6, Col 2'],
                        ['Row 7, Col 1', 'Row 7, Col 2'],
                        ['Row 8, Col 1', 'Row 8, Col 2'],
                        ['Row 9, Col 1', 'Row 9, Col 2']
                    ],
                    theme: 'plain',
                    headStyles: {
                        fillColor: "#9aa0ff",

                    },
                    columnStyles: {
                        0: {
                            fontStyle: 'bold'
                        }
                    },
                    styles: {
                        lineWidth: 0.01,
                        lineColor: 50
                    }
                }
            }
        }
    };

    try {
        const output = await generator.generateDocument(params);
        const file = generator.document;
        console.log("Document generated successfully");
    } catch (error) {
        console.error("Error generating document:", error);
    }
}

// Run the test.
testDocumentGenerator();