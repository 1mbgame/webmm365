import { Injectable } from '@angular/core';
import { FunctionName } from 'app/constant/FunctionName';
import { GlobalData } from 'app/model/GlobalData';
import { Observable } from 'rxjs/Observable';
import { HttpPost } from '../HttpPost';
import { SendDataUtils } from '../SendDataUtils';
import { AndyORM } from './AndyORM';





export class MultiORM {

    private url = GlobalData.getInstance().serverUrl + FunctionName.API_ORM;
    private apiKey = GlobalData.getInstance().apiKey;

    public andyORM: AndyORM;

    constructor() {
        this.andyORM = new AndyORM();
    }


    private static _instance: MultiORM = new MultiORM();

    public static getInstance(): MultiORM {
        return MultiORM._instance;
    }

    public setParameterize(hasParameterize : boolean) {
        this.andyORM.multiQueryHasParameterize = hasParameterize;
    }
    /**
     * newQuery
     */
    public newQuery(queryName: string = '') {
        this.andyORM.setQueryName(queryName);
        return this.andyORM;
    }

    public concatenateQuery() {
        return this.andyORM;
    }

    public callWebAPI(successCallback: any, failureCallback: any, isDataSaveOnFailed: boolean = false) {

        const httpPost = new HttpPost();
        httpPost.request(
            FunctionName.API_ORM, 
            this.andyORM.multiQuery, 
            successCallback, 
            failureCallback,
            isDataSaveOnFailed
        );

        this.andyORM.initMultiQuery();
    }



}