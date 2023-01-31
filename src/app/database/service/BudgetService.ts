import { DataAction } from "app/constant/DataAction";
import { FunctionName } from "app/constant/FunctionName";
import { TableName } from "app/constant/TableName";
import { SendDataUtils } from "app/library/SendDataUtils";
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { Budget } from "../domain/Budget";
import { DataSyncService } from "./DataSyncService";

export class BudgetService {


    public static all(successCallback, failureCallback) {
        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;
        let globalData: GlobalData = GlobalData.getInstance();
        multiORM.newQuery("budget")
            .table(TableName.Budget)
            //.where("user_id", "=", localData.userId)
            .orderByDesc("createdAt")
            .limit(100)
            .get();

        if (globalData.accountList.length <= 0) {
            multiORM.newQuery("account")
                .table(TableName.Account)
                //.where("user_id", "=", localData.userId)
                .orderByAsc("sequence")
                .get();
        }


        if (globalData.categoryList.length <= 0) {
            multiORM.newQuery("category")
                .table(TableName.Category)
                //.where("user_id", "=", localData.userId)
                .orderByAsc("sequence")
                .get();
        }


        multiORM.callWebAPI(successCallback, failureCallback);
    }

    public static create(budget: Budget) {
        let multiORM = MultiORM.getInstance();
        multiORM.newQuery("create")
            .table(TableName.Budget)
            .insertGetId(budget);

        
        multiORM.callWebAPI((xmlHttp: XMLHttpRequest) => {
            let data = JSON.parse(xmlHttp.responseText);
            
        }, (xmlHttp: XMLHttpRequest) => {
            console.log(xmlHttp.responseText);
        },true);

        DataSyncService.create(TableName.Budget, budget.budgetId, DataAction.CREATE);
    }

    public static update(budget: Budget) {
        let multiORM = MultiORM.getInstance();
        multiORM.newQuery("update")
            .table(TableName.Budget)
            .where("budgetId", "=", budget.budgetId)
            .update(budget);

        multiORM.callWebAPI(null,null,true);

        DataSyncService.create(TableName.Budget, budget.budgetId, DataAction.UPDATE);
    }

    public static delete(budget: Budget) {
        let multiORM = MultiORM.getInstance();
        multiORM.newQuery("delete")
            .table(TableName.Budget)
            .where("budgetId", "=", budget.budgetId)
            .delete();

        multiORM.callWebAPI(null,null,true);

        DataSyncService.create(TableName.Budget, budget.budgetId, DataAction.DELETE);
    }

}

