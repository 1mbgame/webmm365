import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Budget } from 'app/database/domain/Budget';
import { GlobalData } from 'app/model/GlobalData';
import { ViewCell } from 'ng2-smart-table';

@Component({
    selector: 'ngx-budget-account',
    templateUrl: './budget-account.component.html',
    styleUrls: []
})
export class BudgetAccountComponent implements ViewCell,OnInit {

    @Input() value: string;
    @Input() rowData: Budget;

    globalData: GlobalData = GlobalData.getInstance();
    displayValue: string = "";


    constructor() { }

    ngOnInit(): void { 

        let accountIdString = this.rowData.accountIdList;
        if(accountIdString == ""){
            return;
        }

        let accountIds = accountIdString.split(",");
        for (const key in accountIds) {
            if (Object.prototype.hasOwnProperty.call(accountIds, key)) {
                let accountId = accountIds[key];
                let account = this.globalData.accountMap.get(accountId);
                if(account != undefined){
                    this.displayValue += account.name + ", ";
                }
            }
        }

        if(this.displayValue.length <= 0){
            return;
        }

        let length = this.displayValue.length;
        if(length > 2){
            let lastTwoChars = this.displayValue.substring(length-2);
            if(lastTwoChars == ", "){
                this.displayValue = this.displayValue.substring(0,length-2);
            }
        }

        
    }


}
