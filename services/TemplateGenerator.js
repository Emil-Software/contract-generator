"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateGenerator = void 0;
const fs_1 = require("fs");
const DEFAULT_TEMPLATE = {
    versione: "1.0.0",
    impostazioniPagina: {
        fonts: [],
        margini: {
            sx: 8,
            dx: 8,
            alto: 8,
            basso: 8,
        },
        staccoriga: 0,
        interlinea: 1,
        rientro: 0,
        box: {
            background: "#ffffff",
            raggio: 0,
            padding: 0,
            lineWidth: 0,
            lineColor: "#000000",
        },
    },
    contenuti: [],
};
function clone(value) {
    return JSON.parse(JSON.stringify(value));
}
class TemplateGenerator {
    constructor(configPath) {
        this.initialized = false;
        this.configPath = configPath;
        if (!configPath) {
            this.template = clone(DEFAULT_TEMPLATE);
            this.initialized = true;
        }
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureTemplate();
            return clone(this.template);
        });
    }
    getTemplate() {
        if (!this.template) {
            throw new Error('Template not loaded. Call load() or setTemplate() first.');
        }
        return clone(this.template);
    }
    setTemplate(config) {
        this.template = clone(config);
        this.initialized = true;
    }
    updateTemplate(update) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureTemplate();
            this.template = TemplateGenerator.mergeTemplates(this.template, update);
            return clone(this.template);
        });
    }
    resetTemplate() {
        this.template = clone(DEFAULT_TEMPLATE);
        this.initialized = true;
        return clone(this.template);
    }
    save(targetPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureTemplate();
            const destination = targetPath !== null && targetPath !== void 0 ? targetPath : this.configPath;
            if (!destination) {
                throw new Error('A destination path must be provided to save the configuration.');
            }
            const serialized = JSON.stringify(this.template, null, 2);
            yield fs_1.promises.writeFile(destination, serialized, 'utf8');
            this.configPath = destination;
        });
    }
    ensureTemplate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized) {
                return;
            }
            if (!this.configPath) {
                this.template = clone(DEFAULT_TEMPLATE);
                this.initialized = true;
                return;
            }
            try {
                const raw = yield fs_1.promises.readFile(this.configPath, 'utf8');
                this.template = JSON.parse(raw);
                this.initialized = true;
            }
            catch (error) {
                throw new Error(`Unable to read configuration file at ${this.configPath}: ${error}`);
            }
        });
    }
    static mergeTemplates(base, update) {
        const merged = Object.assign(Object.assign({}, base), update);
        if (update.impostazioniPagina) {
            merged.impostazioniPagina = TemplateGenerator.mergePageSettings(base.impostazioniPagina, update.impostazioniPagina);
        }
        if (update.contenuti) {
            merged.contenuti = update.contenuti;
        }
        else if (!merged.contenuti) {
            merged.contenuti = [];
        }
        return merged;
    }
    static mergePageSettings(base, update) {
        const current = base ? clone(base) : clone(DEFAULT_TEMPLATE.impostazioniPagina);
        const merged = Object.assign(Object.assign({}, current), update);
        if (update.margini) {
            merged.margini = Object.assign(Object.assign({}, current.margini), update.margini);
        }
        if (update.box) {
            merged.box = Object.assign(Object.assign({}, current.box), update.box);
        }
        return merged;
    }
}
exports.TemplateGenerator = TemplateGenerator;
