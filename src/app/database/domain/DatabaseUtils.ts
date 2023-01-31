import { MyUtils } from "app/library/MyUtils";

export class DatabaseUtils {
    

    public static generateId():string{
        let dateValue = (new Date()).getTime();
        let uniqueId = "D" + dateValue + MyUtils.randomString(20);
        return uniqueId;
    }


}