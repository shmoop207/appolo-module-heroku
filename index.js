"use strict";
var HerokuModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HerokuModule = exports.HerokuProvider = void 0;
const tslib_1 = require("tslib");
const engine_1 = require("@appolo/engine");
const herokuProvider_1 = require("./src/herokuProvider");
Object.defineProperty(exports, "HerokuProvider", { enumerable: true, get: function () { return herokuProvider_1.HerokuProvider; } });
let HerokuModule = HerokuModule_1 = class HerokuModule extends engine_1.Module {
    get defaults() {
        return {
            id: "herokuProvider",
        };
    }
    static for(options) {
        return { type: HerokuModule_1, options };
    }
    get exports() {
        let exports = [{ id: this.moduleOptions.id, type: herokuProvider_1.HerokuProvider }];
        return exports;
    }
};
HerokuModule = HerokuModule_1 = (0, tslib_1.__decorate)([
    (0, engine_1.module)()
], HerokuModule);
exports.HerokuModule = HerokuModule;
//# sourceMappingURL=index.js.map