"use strict";
import {define, init, inject, singleton} from '@appolo/inject'
import {ILogger} from '@appolo/logger';
import {date} from '@appolo/date';
import {_, Objects} from '@appolo/utils';
import {IOptions} from "./IOptions";
import {HerokuApp} from "./IHerokuApp";
import Heroku = require('heroku-client');


@define()
@singleton()
export class HerokuProvider {

    @inject() protected logger: ILogger;
    @inject() protected moduleOptions: IOptions;

    private _heroku: Heroku;
    private _herokuMetrics: Heroku;

    @init()
    public initialize() {
        this._heroku = new Heroku({token: this.moduleOptions.token});
        this._herokuMetrics = new Heroku({token: this.moduleOptions.token, host: "https://api.metrics.heroku.com"})
    }

    public async getAllApps(): Promise<HerokuApp[]> {
        let apps = await this._heroku.get(`/apps/`);

        return apps;
    }

    public async getAppFormation(appName: string): Promise<{ size: string, type: string, quantity: number, id: string }[]> {

        try {
            let formation = await this._heroku.get(`/apps/${appName}/formation`);

            return formation;
        } catch (e) {
            this.logger.error(`failed to getAppFormation ${appName}`, {e})
            throw e
        }
    }

    public async getDynosCount(appName: string): Promise<number> {
        let formation = await this.getAppFormation(appName);

        return formation[0].quantity
    }

    public async updateAppFormation(appName: string, dynos: number, type: string, size: string): Promise<void> {

        try {

            let params = {
                body: {
                    size: size,
                    quantity: dynos
                }
            };

            await this._heroku.patch(`/apps/${appName}/formation/${type}`, params);
        } catch (e) {

            this.logger.error(`failed to updateAppFormation ${appName}`, {e: e});

            throw e;
        }
    }

    public async getAppThroughputAvg(appId: string, timeSpanMinutes = 10): Promise<number> {

        const end = date.utc().startOf('minute').subtract(1, 'minute');
        const start = date.utc().startOf('minute').subtract(timeSpanMinutes, 'minute');

        let qs = {
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            step: '1m',
            process_type: 'web'
        };



        let result: { data: { [index: string]: number[] } } = await this._herokuMetrics.get(`/metrics/${appId}/router/status?${ new URLSearchParams(qs).toString()}`);


        let metric = _(Object.values(result.data)).map((item: number[]) => Math.ceil(_(item).compact().sum() / _(item).compact().value().length)).sum();

        return metric;
    }

    public async getStatusCodesPercentage(appId: string, statusCodes: number[], timeSpanMinutes = 10): Promise<number> {

        const end = date.utc().startOf('minute').subtract(1, 'minute');
        const start = date.utc().startOf('minute').subtract(timeSpanMinutes, 'minute');

        let qs = {
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            step: '1m',
            process_type: 'web'
        };

        let result: { data: { [index: string]: number[] } } = await this._herokuMetrics.get(`/metrics/${appId}/router/status?${ new URLSearchParams(qs).toString()}`);

        const totalResponsesCount = _(Object.values(result.data)).map((item: number[]) => _(item).compact().sum()).sum();

        const totalRequestedStatusCodesResponsesCount = _(Object.values(Objects.pick(result.data, ...statusCodes)))
            .map((item: number[]) => _(item).compact().sum()).sum();

        return totalRequestedStatusCodesResponsesCount / totalResponsesCount;
    }
}
