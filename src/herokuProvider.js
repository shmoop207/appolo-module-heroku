"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HerokuProvider = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const date_1 = require("@appolo/date");
const utils_1 = require("@appolo/utils");
const Heroku = require("heroku-client");
let HerokuProvider = class HerokuProvider {
    initialize() {
        this._heroku = new Heroku({ token: this.moduleOptions.token });
        this._herokuMetrics = new Heroku({ token: this.moduleOptions.token, host: "https://api.metrics.heroku.com" });
    }
    async getAllApps() {
        let apps = await this._heroku.get(`/apps/`);
        return apps;
    }
    async getAppFormation(appName) {
        try {
            let formation = await this._heroku.get(`/apps/${appName}/formation`);
            return formation;
        }
        catch (e) {
            this.logger.error(`failed to getAppFormation ${appName}`, { e });
            throw e;
        }
    }
    async getDynosCount(appName) {
        let formation = await this.getAppFormation(appName);
        return formation[0].quantity;
    }
    async updateAppFormation(appName, dynos, type, size) {
        try {
            let params = {
                body: {
                    size: size,
                    quantity: dynos
                }
            };
            await this._heroku.patch(`/apps/${appName}/formation/${type}`, params);
        }
        catch (e) {
            this.logger.error(`failed to updateAppFormation ${appName}`, { e: e });
            throw e;
        }
    }
    async getAppThroughputAvg(appId, timeSpanMinutes = 10) {
        const end = date_1.date.utc().startOf('minute').subtract(1, 'minute');
        const start = date_1.date.utc().startOf('minute').subtract(timeSpanMinutes, 'minute');
        let qs = {
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            step: '1m',
            process_type: 'web'
        };
        let result = await this._herokuMetrics.get(`/metrics/${appId}/router/status?${new URLSearchParams(qs).toString()}`);
        let metric = (0, utils_1._)(Object.values(result.data)).map((item) => Math.ceil((0, utils_1._)(item).compact().sum() / (0, utils_1._)(item).compact().value().length)).sum();
        return metric;
    }
    async getStatusCodesPercentage(appId, statusCodes, timeSpanMinutes = 10) {
        const end = date_1.date.utc().startOf('minute').subtract(1, 'minute');
        const start = date_1.date.utc().startOf('minute').subtract(timeSpanMinutes, 'minute');
        let qs = {
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            step: '1m',
            process_type: 'web'
        };
        let result = await this._herokuMetrics.get(`/metrics/${appId}/router/status?${new URLSearchParams(qs).toString()}`);
        const totalResponsesCount = (0, utils_1._)(Object.values(result.data)).map((item) => (0, utils_1._)(item).compact().sum()).sum();
        const totalRequestedStatusCodesResponsesCount = (0, utils_1._)(Object.values(utils_1.Objects.pick(result.data, ...statusCodes)))
            .map((item) => (0, utils_1._)(item).compact().sum()).sum();
        return totalRequestedStatusCodesResponsesCount / totalResponsesCount;
    }
};
(0, tslib_1.__decorate)([
    (0, inject_1.inject)()
], HerokuProvider.prototype, "logger", void 0);
(0, tslib_1.__decorate)([
    (0, inject_1.inject)()
], HerokuProvider.prototype, "moduleOptions", void 0);
(0, tslib_1.__decorate)([
    (0, inject_1.init)()
], HerokuProvider.prototype, "initialize", null);
HerokuProvider = (0, tslib_1.__decorate)([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], HerokuProvider);
exports.HerokuProvider = HerokuProvider;
//# sourceMappingURL=herokuProvider.js.map