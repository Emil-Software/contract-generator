"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateGenerator = exports.DocumentGenerator = exports.autobind = void 0;
const autobind_1 = require("./autobind");
Object.defineProperty(exports, "autobind", { enumerable: true, get: function () { return autobind_1.autobind; } });
const ContractGenerator_1 = require("./ContractGenerator");
Object.defineProperty(exports, "DocumentGenerator", { enumerable: true, get: function () { return ContractGenerator_1.DocumentGenerator; } });
const TemplateGenerator_1 = require("./services/TemplateGenerator");
Object.defineProperty(exports, "TemplateGenerator", { enumerable: true, get: function () { return TemplateGenerator_1.TemplateGenerator; } });
