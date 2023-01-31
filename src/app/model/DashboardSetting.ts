import { Transaction } from "app/database/domain/Transaction";
import { MyUtils } from "app/library/MyUtils";

export class DashboardSetting {
    
    constructor(){
        let currentDate = new Date();
        this.dateStart = MyUtils.getMonthStart(currentDate);
        this.dateEnd = MyUtils.getMonthEnd(currentDate);
        this.transactionList = [];
        this.search = "";
    }

    dateStart : Date;
    dateEnd : Date;
    transactionList : Transaction[];
    search:string;

}