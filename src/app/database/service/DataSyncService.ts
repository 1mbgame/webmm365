
import { FunctionName } from "app/constant/FunctionName";
import { Platform } from "app/constant/Platform";
import { HttpPost } from "app/library/HttpPost";
import { SendDataUtils } from "app/library/SendDataUtils";
import { GlobalData } from "app/model/GlobalData";
import { DataSync } from "app/object/DataSync";

export class DataSyncService {
    
    public static create(tableName, recordId, dataAction){
        

        let sendData = {
            "tableName" : tableName,
            "recordId" : recordId,
            "dataAction" : dataAction
        };

        const httpPost = new HttpPost();
        httpPost.request(FunctionName.DATA_SYNC, sendData, null, null,true);

    }

    public static createMultiple(dataSyncList : DataSync[]){
        
       

        let sendData = dataSyncList;

        const httpPost = new HttpPost();
        httpPost.request(FunctionName.DATA_SYNC_LIST, sendData, null, null,true);



    }

}