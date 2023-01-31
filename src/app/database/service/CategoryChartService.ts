import { TableName } from "app/constant/TableName";
import { MyUtils } from "app/library/MyUtils";
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { Budget } from "../domain/Budget";
import { Category } from "../domain/Category";

export class CategoryChartService {

    public static downloadAllData(type, startDate: Date, endDate: Date, successCallback, failureCallback) {

        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);

        let multiORM = MultiORM.getInstance();
        let globalData = GlobalData.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;
        //let mysqlStartDate = MyUtils.dateToMysqlDatetime(startDate);
        //let mysqlEndDate = MyUtils.dateToMysqlDatetime(endDate);

        multiORM.newQuery("transaction")
            .table(TableName.Transaction)
            .select("transactionId", "category", "categoryColor", "amount")
            //.whereEqual("user_id", localData.userId)
            .where("transactionDate", ">=", startDate.getTime())
            .where("transactionDate", "<=", endDate.getTime())
            .where("type", "=", type)
            .get();
        
        if(globalData.accountList.length <= 0){
            multiORM.newQuery("account")
            .table(TableName.Account)
            //.where("user_id", "=", localData.userId)
            .orderByAsc("sequence")
            .get();
        }
        
        if(globalData.categoryList.length <= 0){
            multiORM.newQuery("category")
            .table(TableName.Category)
            //.where("user_id", "=", localData.userId)
            .orderByAsc("sequence")
            .get();
        }
        

        multiORM.callWebAPI((xmlHttp: XMLHttpRequest) => {
            if (successCallback != null) {
                successCallback(xmlHttp);
            }
        }, (xmlHttp: XMLHttpRequest) => {
            if (failureCallback != null) {
                failureCallback(xmlHttp);
            }
        });


    }

    public static downloadData(type, accountIdList: string[], startDate: Date, endDate: Date, successCallback, failureCallback) {

        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);

        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;
        //let mysqlStartDate = MyUtils.dateToMysqlDatetime(startDate);
        //let mysqlEndDate = MyUtils.dateToMysqlDatetime(endDate);

        multiORM.newQuery("transaction")
            .table(TableName.Transaction)
            .select("transactionId", "category", "categoryColor", "amount")
            //.whereEqual("user_id", localData.userId)
            .where("transactionDate", ">=", startDate.getTime())
            .where("transactionDate", "<=", endDate.getTime())
            .whereIn("accountId", accountIdList)
            .where("type", "=", type)
            .get();

        multiORM.callWebAPI((xmlHttp: XMLHttpRequest) => {
            if (successCallback != null) {
                successCallback(xmlHttp);
            }
        }, (xmlHttp: XMLHttpRequest) => {
            if (failureCallback != null) {
                failureCallback(xmlHttp);
            }
        });


    }

    public static downloadMultipleTransaction(transactionIdList: string[], successCallback, failureCallback) {
        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;

        multiORM.newQuery("downloadMultipleTransaction")
            .table(TableName.Transaction)
            //.whereEqual("user_id", localData.userId)
            .whereIn("transactionId", transactionIdList)
            .orderByDesc("transactionDate")
            .get();

        multiORM.callWebAPI((xmlHttp: XMLHttpRequest) => {
            if (successCallback != null) {
                successCallback(xmlHttp);
            }
        }, (xmlHttp: XMLHttpRequest) => {
            if (failureCallback != null) {
                failureCallback(xmlHttp);
            }
        });
    }

    public static downloadBudgetTransaction(budget:Budget,categoryNameList:string[], successCallback, failureCallback){
        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;

        let accountIdList = budget.accountIdList.split(",");

        multiORM.newQuery("downloadBudgetTransaction")
        .table(TableName.Transaction)
        .whereIn("accountId", accountIdList)
        .whereIn("category", categoryNameList)
        .where("transactionDate", ">=", budget.startDate)
        .where("transactionDate", "<=", budget.endDate)
        //.whereEqual("user_id", localData.userId)
        .get();

        multiORM.callWebAPI((xmlHttp: XMLHttpRequest) => {
            if (successCallback != null) {
                successCallback(xmlHttp);
            }
        }, (xmlHttp: XMLHttpRequest) => {
            if (failureCallback != null) {
                failureCallback(xmlHttp);
            }
        });



    }

    



}