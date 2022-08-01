"use strict";
import {Module, module,IModuleParams} from '@appolo/engine';
import {IOptions} from "./src/IOptions";
import {HerokuProvider} from "./src/herokuProvider";
import {HerokuApp} from "./src/interfaces/IHerokuApp";

export {IOptions}  from "./src/IOptions"

export {HerokuProvider, HerokuApp}

@module()
export class HerokuModule extends Module<IOptions> {

    public get defaults(): Partial<IOptions> {
        return {
            id: "herokuProvider",
        }
    }

    public static for(options?: IOptions): IModuleParams {
        return {type:HerokuModule,options};
    }

    public get exports() {
        let exports: any = [{id: this.moduleOptions.id, type: HerokuProvider}];


        return exports;
    }

}
