import { DataAction } from "app/constant/DataAction";
import { Platform } from "app/constant/Platform";
import { TableName } from "app/constant/TableName";
import { MyUtils } from "app/library/MyUtils";
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { DashboardSetting } from "app/model/DashboardSetting";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { TransferIds } from "app/object/TransferIds";
import { Account } from "../domain/Account";
import { Transaction } from "../domain/Transaction";
import { DataSyncService } from "./DataSyncService";

export class TransactionService {

    public static findTransaction(transactionId: string, successCallback, failureCallback) {
        let multiORM = MultiORM.getInstance();
        let localData = GlobalData.getInstance().localData;
        multiORM.newQuery("findTransaction")
            .table(TableName.Transaction)
            //.where("user_id", "=", localData.userId)
            .where("transactionId", "=", transactionId)
            .get();

        multiORM.callWebAPI(successCallback, failureCallback);
    }

    public static delete(transactionId: string, successCallback, failureCallback) {
        let multiORM = MultiORM.getInstance();
        let localData = GlobalData.getInstance().localData;
        multiORM.newQuery("delete")
            .table(TableName.Transaction)
            //.where("user_id", "=", localData.userId)
            .where("transactionId", "=", transactionId)
            .delete();

        multiORM.callWebAPI(successCallback, failureCallback, true);

        DataSyncService.create(TableName.Transaction, transactionId, DataAction.DELETE);
    }


    public static create(transaction: Transaction) {
        let multiORM = MultiORM.getInstance();
        multiORM.newQuery("create")
            .table(TableName.Transaction)
            .insertGetId(transaction);

        multiORM.callWebAPI((xmlHttp: XMLHttpRequest) => {
            let data = JSON.parse(xmlHttp.responseText);
            console.log(data);

        }, (xmlHttp: XMLHttpRequest) => {
            console.log(xmlHttp.responseText);
        }, true);

        DataSyncService.create(TableName.Transaction, transaction.transactionId, DataAction.CREATE);
    }

    public static update(transaction: Transaction) {
        let multiORM = MultiORM.getInstance();
        let localData = GlobalData.getInstance().localData;
        multiORM.newQuery("createTransaction")
            .table(TableName.Transaction)
            .where("localId", "=", transaction.localId)
            .update(transaction);

        multiORM.callWebAPI(null, null, true);

        DataSyncService.create(TableName.Transaction, transaction.transactionId, DataAction.UPDATE);
    }



    public static downloadTransactionList(localData: LocalData, successCallback, failureCallback) {

        let multiORM = MultiORM.getInstance();
        let setting: DashboardSetting = GlobalData.getInstance().dashboardSetting;

        multiORM.newQuery("transactionList")
            .table(TableName.Transaction)
            //.where("user_id", "=", localData.userId)
            .where("transactionDate", ">=", setting.dateStart.getTime())
            .where("transactionDate", "<=", setting.dateEnd.getTime())
            .where("accountId", "=", localData.selectedAccountId)
            .limit(1000)
            .orderByDesc("transactionDate")
            .get();

        multiORM.callWebAPI(successCallback, failureCallback);

    }

    public static exportData(
        selectedAccountIdList: string[],
        transactionType: string,
        startDate: Date,
        endDate: Date,
        successCallback,
        failureCallback
    ) {
        let multiORM = MultiORM.getInstance();
        let localData = GlobalData.getInstance().localData;

        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);

        let query = multiORM.newQuery("exportData")
            .table(TableName.Transaction)
            .whereIn("accountId", selectedAccountIdList)
            .where("transactionDate", ">=", startDate.getTime())
            .where("transactionDate", "<=", endDate.getTime())
            //.where("user_id", "=", localData.userId)
            .orderByAsc("transactionDate")
        if (transactionType != "All") {
            query.whereEqual("type", transactionType);
        }

        query.get();


        multiORM.callWebAPI(successCallback, failureCallback);


    }

    public static chartCompareData(
        accountIdList: string[],
        type: string,
        year1: number,
        year2: number,
        successCallback,
        failureCallback
    ) {

        let multiORM = MultiORM.getInstance();
        let localData = GlobalData.getInstance().localData;

        let currentDate: Date = new Date();

        for (let i = 0; i < 12; i++) {
            currentDate.setFullYear(year1, i, 1);
            let monthStart = MyUtils.getMonthStart(currentDate);
            let monthEnd = MyUtils.getMonthEnd(currentDate);
            multiORM.newQuery("line1-month-" + i)
                .table(TableName.Transaction)
                .where("transactionDate", ">=", monthStart.getTime())
                .where("transactionDate", "<=", monthEnd.getTime())
                .where("type", "=", type)
                .whereIn("accountId", accountIdList)
                .sum("amount")
        }

        for (let i = 0; i < 12; i++) {
            currentDate.setFullYear(year2, i, 1);
            let monthStart = MyUtils.getMonthStart(currentDate);
            let monthEnd = MyUtils.getMonthEnd(currentDate);
            multiORM.newQuery("line2-month-" + i)
                .table(TableName.Transaction)
                .where("transactionDate", ">=", monthStart.getTime())
                .where("transactionDate", "<=", monthEnd.getTime())
                .where("type", "=", type)
                .whereIn("accountId", accountIdList)
                .sum("amount")
        }

        currentDate.setFullYear(year1, 1, 1);
        let yearStart = MyUtils.getYearStart(currentDate);
        let yearEnd = MyUtils.getYearEnd(currentDate);
        multiORM.newQuery("line1-total-amount")
            .table(TableName.Transaction)
            .where("transactionDate", ">=", yearStart.getTime())
            .where("transactionDate", "<=", yearEnd.getTime())
            .where("type", "=", type)
            .whereIn("accountId", accountIdList)
            .sum("amount")

        currentDate.setFullYear(year2, 1, 1);
        yearStart = MyUtils.getYearStart(currentDate);
        yearEnd = MyUtils.getYearEnd(currentDate);
        multiORM.newQuery("line2-total-amount")
            .table(TableName.Transaction)
            .where("transactionDate", ">=", yearStart.getTime())
            .where("transactionDate", "<=", yearEnd.getTime())
            .where("type", "=", type)
            .whereIn("accountId", accountIdList)
            .sum("amount")
        multiORM.callWebAPI(successCallback, failureCallback);
    }
}
