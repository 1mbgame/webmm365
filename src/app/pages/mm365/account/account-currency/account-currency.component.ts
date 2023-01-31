import { AfterViewInit, OnInit } from "@angular/core";
import { Input } from "@angular/core";
import { Component } from "@angular/core";
import { NbDateService, NbDialogService } from "@nebular/theme";
import { SaveKeys } from "app/constant/SaveKeys";
import { Account } from "app/database/domain/Account";
import { Currency } from "app/database/domain/Currency";
import { AccountService } from "app/database/service/AccountService";
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { Cell, DefaultEditor, LocalDataSource } from "ng2-smart-table";


@Component({
    selector: 'ngx-account-currency',
    templateUrl: './account-currency.component.html',
    styleUrls: ['./account-currency.component.scss']
})
export class AccountCurrencyComponent extends DefaultEditor implements AfterViewInit , OnInit {

    renderValue: string;

    @Input() value: string;
    @Input() rowData: any;

    currencyList : Currency[] = [];
    selectedCurrencyCode : string = "";


    constructor(
       
    ) {
        super();
        console.log("AccountCurrencyComponent.constructor()");
        this.currencyList = GlobalData.getInstance().currencyList;
        
    }

    ngOnInit(): void {
        console.log("AccountCurrencyComponent.ngOnInit()");
        console.log(this.cell);
        let currencyCode : string = this.cell.getValue();
        if(currencyCode == ""){
            this.selectedCurrencyCode = "USD";
            this.cell.setValue("USD");
        }else{
            this.selectedCurrencyCode = currencyCode;
        }
    }

    ngAfterViewInit(): void {
        console.log("AccountCurrencyComponent.ngAfterViewInit()");

    }

    


    





    // Button  Callback
    onCurrencyChanged(currencyCode){
        console.log(currencyCode);
        this.selectedCurrencyCode = currencyCode;
        this.cell.setValue(currencyCode)
    }
}