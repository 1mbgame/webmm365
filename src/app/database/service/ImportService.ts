import { TableName } from "app/constant/TableName";
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { Category } from "../domain/Category";
import { Transaction } from "../domain/Transaction";
import { Account } from 'app/database/domain/Account';
import { Currency } from "../domain/Currency";
import { DataSync } from "app/object/DataSync";
import { DataAction } from "app/constant/DataAction";
import { DataSyncService } from "./DataSyncService";

export class ImportService {



    public static createAllData(
        newAccountList: Account[],
        newCurrencyList: Currency[],
        newCategoryList: Category[],
        newTransactionList: Transaction[],
        successCallback
    ) {
        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;

        if (newAccountList.length > 0) {
            for (const key in newAccountList) {
                if (Object.prototype.hasOwnProperty.call(newAccountList, key)) {
                    const item = newAccountList[key];
                    multiORM.newQuery("account")
                        .table(TableName.Account)
                        .insert(item);
                }
            }

        }

        if (newCurrencyList.length > 0) {
            for (const key in newCurrencyList) {
                if (Object.prototype.hasOwnProperty.call(newCurrencyList, key)) {
                    const item = newCurrencyList[key];
                    multiORM.newQuery("currency")
                        .table(TableName.Currency)
                        .insert(item);
                }
            }
        }

        if (newCategoryList.length > 0) {
            for (const key in newCategoryList) {
                if (Object.prototype.hasOwnProperty.call(newCategoryList, key)) {
                    const item = newCategoryList[key];
                    multiORM.newQuery("category")
                        .table(TableName.Category)
                        .insert(item);
                }
            }
        }

        if (newTransactionList.length > 0) {
            for (const key in newTransactionList) {
                if (Object.prototype.hasOwnProperty.call(newTransactionList, key)) {
                    const item = newTransactionList[key];
                    multiORM.newQuery("transaction")
                        .table(TableName.Transaction)
                        .insert(item);
                }
            }

        }

        multiORM.callWebAPI((xmlHttp: XMLHttpRequest) => {
            //let data = JSON.parse(xmlHttp.responseText);
            //console.log(data);
            if (successCallback != null) {
                successCallback();
            }
        }, (xmlHttp: XMLHttpRequest) => {
            console.log(xmlHttp.responseText);
        }, true);


        // Create Data Sync List
        let dataSyncList: DataSync[] = [];

        // Account
        for (const key in newAccountList) {
            if (Object.prototype.hasOwnProperty.call(newAccountList, key)) {
                const item = newAccountList[key];
                let dataSync = new DataSync();
                dataSync.tableName = TableName.Account;
                dataSync.recordId = item.accountId;
                dataSync.dataAction = DataAction.CREATE;
                dataSyncList.push(dataSync);
            }
        }

        // Currency
        for (const key in newCurrencyList) {
            if (Object.prototype.hasOwnProperty.call(newCurrencyList, key)) {
                const item = newCurrencyList[key];
                let dataSync = new DataSync();
                dataSync.tableName = TableName.Currency;
                dataSync.recordId = item.currencyCode;
                dataSync.dataAction = DataAction.CREATE;
                dataSyncList.push(dataSync);
            }
        }

        // Category
        for (const key in newCategoryList) {
            if (Object.prototype.hasOwnProperty.call(newCategoryList, key)) {
                const item = newCategoryList[key];
                let dataSync = new DataSync();
                dataSync.tableName = TableName.Category;
                dataSync.recordId = item.categoryId;
                dataSync.dataAction = DataAction.CREATE;
                dataSyncList.push(dataSync);
            }
        }

        // Transaction
        for (const key in newTransactionList) {
            if (Object.prototype.hasOwnProperty.call(newTransactionList, key)) {
                const item = newTransactionList[key];
                let dataSync = new DataSync();
                dataSync.tableName = TableName.Transaction;
                dataSync.recordId = item.transactionId;
                dataSync.dataAction = DataAction.CREATE;
                dataSyncList.push(dataSync);
            }
        }

        DataSyncService.createMultiple(dataSyncList);
    }
}