import { DataAction } from "app/constant/DataAction";
import { FunctionName } from "app/constant/FunctionName";
import { TableName } from "app/constant/TableName";
import { HttpPost } from "app/library/HttpPost";
import { SendDataUtils } from "app/library/SendDataUtils";
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { color } from "d3-color";
import { Category } from "../domain/Category";
import { DataSyncService } from "./DataSyncService";

export class CategoryService {

    public static all(successCallback, failureCallback) {
        let multiORM = MultiORM.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;
        multiORM.newQuery("all")
            .table(TableName.Category)
            //.where("user_id", "=", localData.userId)
            .orderByAsc("sequence")
            .limit(100)
            .get();

        multiORM.callWebAPI(successCallback, failureCallback);
    }

    public static update(oldCategoryName: string, oldCategoryColor, category: Category) {
        let multiORM = MultiORM.getInstance();
        let globalData: GlobalData = GlobalData.getInstance();
        let localData: LocalData = GlobalData.getInstance().localData;


        multiORM.newQuery("update")
            .table(TableName.Category)
            .where("categoryId", "=", category.categoryId)
            .update(category);


        // Update Transaction as well
        if (oldCategoryName != category.name || oldCategoryColor != category.color) {

            const sendData = {
                "oldCategory": oldCategoryName,
                "newCategory": category.name,
                "color": category.color
            };

            const httpPost = new HttpPost();
            httpPost.request(FunctionName.UPDATE_TRANSACTION, sendData, null, null,true);

        }

        
        multiORM.callWebAPI(null, null, true);

        DataSyncService.create(TableName.Category, category.categoryId, DataAction.UPDATE);
    }




    public static create(category: Category) {
        let multiORM = MultiORM.getInstance();
        multiORM.newQuery("create")
            .table(TableName.Category)
            .insertGetId(category);

        multiORM.callWebAPI((xmlHttp: XMLHttpRequest) => {
            let data = xmlHttp.responseText;
            
        }, (xmlHttp: XMLHttpRequest) => {
            console.log(xmlHttp.responseText);
        },true);

        DataSyncService.create(TableName.Category, category.categoryId, DataAction.CREATE);
    }

    public static delete(category: Category) {
        let multiORM = MultiORM.getInstance();
        multiORM.newQuery("delete")
            .table(TableName.Category)
            .where("categoryId", "=", category.categoryId)
            .delete();
        multiORM.callWebAPI(null, null,true);

        DataSyncService.create(TableName.Category, category.categoryId, DataAction.DELETE);
    }

}