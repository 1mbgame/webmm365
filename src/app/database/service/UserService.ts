import { FunctionName } from "app/constant/FunctionName";
import { HttpPost } from "app/library/HttpPost";
import { SendDataUtils } from "app/library/SendDataUtils";
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";

export class UserService {

    public static updateExportDateFormat(isDefaultFormat: boolean, exportFormat: string) {
        
        let sendData = {
            "isDefaultFormat" : isDefaultFormat,
            "exportFormat" : exportFormat
        }

        const httpPost = new HttpPost();
        httpPost.request(FunctionName.UPDATE_EXPORT_DATE_FORMAT, sendData, null, null,true);

    }

}