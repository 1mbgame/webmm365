
import { DataAction } from "app/constant/DataAction";
import { FunctionName } from "app/constant/FunctionName";
import { TableName } from "app/constant/TableName";
import { HttpPost } from "app/library/HttpPost";
import { MyUtils } from "app/library/MyUtils";
import { SendDataUtils } from "app/library/SendDataUtils";
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { Account } from "../domain/Account";
import { DataSyncService } from "./DataSyncService";

export class AccountService {

    public static downloadAccountCategory(successCallback, failureCallback) {
        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;
        multiORM.newQuery("accountList")
            .table(TableName.Account)
            //.where("user_id", "=", localData.userId)
            .orderByAsc("sequence")
            .get();

        multiORM.newQuery("categoryList")
            .table(TableName.Category)
            //.where("user_id", "=", localData.userId)
            .orderByAsc("sequence")
            .get();

        multiORM.callWebAPI(successCallback, failureCallback);

    }

    public static downloadAccountList(successCallback, failureCallback) {
        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;
        multiORM.newQuery("accountList")
            .table(TableName.Account)
            //.where("user_id", "=", localData.userId)
            .orderByAsc("sequence")
            .get();
        multiORM.callWebAPI(successCallback, failureCallback);

    }

    public static downloadAccountCurrency(successCallback, failureCallback) {
        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;
        multiORM.newQuery("currencyList")
            .table(TableName.Currency)
            //.where("user_id", "=", localData.userId)
            .orderByAsc("currencyCode")
            .get();

        multiORM.newQuery("accountList")
            .table(TableName.Account)
            //.where("user_id", "=", localData.userId)
            .orderByAsc("sequence")
            .get();

        multiORM.callWebAPI(successCallback, failureCallback);

    }

    public static update(account: Account) {
        let multiORM = MultiORM.getInstance();
        multiORM.newQuery("update")
            .table(TableName.Account)
            .where("accountId", "=", account.accountId)
            .update(account);

        multiORM.callWebAPI(null, null,true);

       
        DataSyncService.create(TableName.Account, account.accountId, DataAction.UPDATE);
    }

    public static delete(account: Account) {
        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;
        multiORM.newQuery("delete")
            .table(TableName.Account)
            .where("accountId", "=", account.accountId)
            .delete();

        // Delete all transations belong to this account
        multiORM.newQuery("delete-transaction")
            .table(TableName.Transaction)
            .where("accountId", "=", account.accountId)
            .delete();

        multiORM.callWebAPI(null, null,true);

        DataSyncService.create(TableName.Account, account.accountId, DataAction.DELETE);
    }

    public static create(account: Account) {
        let multiORM = MultiORM.getInstance();
        multiORM.newQuery("create")
            .table(TableName.Account)
            .insertGetId(account);


        
        multiORM.callWebAPI((xmlHttp: XMLHttpRequest) => {
            let data = JSON.parse(xmlHttp.responseText);
            
        }, (xmlHttp: XMLHttpRequest) => {
            
            console.log(xmlHttp.responseText);
        }, true);

        DataSyncService.create(TableName.Account, account.accountId, DataAction.CREATE);
    }

    public static reCalculateBalance(accountId : string){
        const httpPost: HttpPost = new HttpPost();
        httpPost.requestWithDataString(
          FunctionName.RE_CALCULATE_BALANCE,
          accountId,
          null,
          null
        );
    }

}