import { Component, OnInit } from '@angular/core';
import { TransactionType } from 'app/constant/TransactionType';
import { Account } from 'app/database/domain/Account';
import { AccountService } from 'app/database/service/AccountService';
import { TransactionService } from 'app/database/service/TransactionService';
import { MyUtils } from 'app/library/MyUtils';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';

@Component({
    selector: 'ngx-chart-compare',
    templateUrl: './chart-compare.component.html',
    styleUrls: ['./chart-compare.component.scss']
})
export class ChartCompareComponent implements OnInit {

    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;


    selectedAccountIdList: string[] = [];
    accountList: Account[] = [];
    typeList: string[] = [];
    yearList: number[] = [];
    line1AmountList : number[] = [];
    line2AmountList : number[] = [];
    line1TotalAmount : number = 0;
    line2TotalAmount : number = 0;
    netAmount : number = 0;
    line1TotalAmountView : string = "0";
    line2TotalAmountView : string = "0";
    netAmountView : string = "0";
    monthList: string[] = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];


    selectedType: string = TransactionType.EXPENSE;
    line1Year: number = 0;
    line2Year: number = 0;


    isChartShow : boolean = false;
    isLoading: boolean = false;

    constructor() {
        this.initData();

        //let currentDate = new Date();
        //console.log(currentDate);
        //currentDate.setFullYear(2020, 0, 1);
        //console.log(MyUtils.dateToMysqlDatetime(MyUtils.getMonthStart(currentDate)));
        //console.log(MyUtils.dateToMysqlDatetime(MyUtils.getMonthEnd(currentDate)));
        //console.log(MyUtils.dateToMysqlDatetime(MyUtils.getYearStart(currentDate)));
        //console.log(MyUtils.dateToMysqlDatetime(MyUtils.getYearEnd(currentDate)));
    
        this.downloadChartData();
    }

    ngOnInit(): void { }

    initData() {
        // Type
        this.typeList.push(TransactionType.EXPENSE);
        this.typeList.push(TransactionType.INCOME);


        // Year
        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        console.log(currentYear);

        this.line1Year = currentYear - 1;
        this.line2Year = currentYear;

        let startYear = currentYear + 15;
        for (let i = 0; i < 30; i++) {
            this.yearList.push(startYear - i);
        }

        // Account
        this.accountList = this.globalData.accountList;

        if(this.accountList.length > 0){
            let account = this.accountList[0];
            this.selectedAccountIdList.push(account.accountId);
        }

        this.downloadData();
    }

    downloadData() {
        this.isLoading = true;
        if (this.accountList.length <= 0) {
            AccountService.downloadAccountList(
                (xmlHttp: XMLHttpRequest) => {
                    
                    let data = JSON.parse(xmlHttp.responseText);

                    // Account
                    let accounts: Account[] = data["accountList"];
                    if (accounts == null) {
                        accounts = [];
                    }
                    this.accountList = accounts;
                    this.globalData.initAccountList(accounts);
                    if (this.accountList.length > 0) {
                        this.selectedAccountIdList.push(this.accountList[0].accountId);
                    }
                    this.downloadChartData();
                }, (xmlHttp: XMLHttpRequest) => {
                    this.isLoading = false;
                    console.log(xmlHttp.responseText);
                });
        } else {
            this.downloadChartData();
        }

    }

    downloadChartData() {
        this.isLoading = true;
        
        TransactionService.chartCompareData(
            this.selectedAccountIdList,
            this.selectedType,
            this.line1Year,
            this.line2Year, (xmlHttp: XMLHttpRequest) => {
                this.isLoading = false;
                let data = JSON.parse(xmlHttp.responseText);
                console.log(data);
                this.onDownloadChartDataSuccess(data);
            }, (xmlHttp: XMLHttpRequest) => {
                this.isLoading = false;
                console.log(xmlHttp.responseText);
            });
    }

    onDownloadChartDataSuccess(data:any){

        this.line1AmountList = [];
        this.line2AmountList = [];
        this.line1TotalAmount = 0;
        this.line2TotalAmount = 0;

        // Line-1 amount list
        for (let i = 0; i < 12; i++) {
            let amount = 0;
            let resultString = data["line1-month-"+i];
            if(resultString != null){
                amount = parseFloat(resultString);
            }
            this.line1AmountList[i] = amount;
        }


        // Line-2 amount list
        for (let i = 0; i < 12; i++) {
            let amount = 0;
            let resultString = data["line2-month-"+i];
            if(resultString != null){
                amount = parseFloat(resultString);
            }
            this.line2AmountList[i] = amount;
        }

        // Line-1 Total amount
        let amount = 0;
        let resultString = data["line1-total-amount"];
        if(resultString != null){
            amount = parseFloat(resultString);
        }
        this.line1TotalAmount = amount;


        // Line-2 Total amount
        amount = 0;
        resultString = data["line2-total-amount"];
        if(resultString != null){
            amount = parseFloat(resultString);
        }
        this.line2TotalAmount = amount;


        GlobalData.getInstance().chartjsLineComponent.initChart(
            this.line1Year,
            this.line2Year,
            this.monthList,
            this.line1AmountList,
            this.line2AmountList
        );
        let decimal : number = 2;
        if(this.selectedAccountIdList.length > 0){
            let accountId = this.selectedAccountIdList[0];
            let account = this.globalData.accountMap.get(accountId);
            decimal = account.decimal;
        }
        this.netAmount = this.line2TotalAmount - this.line1TotalAmount;
        
        // Update the view data
        this.line1TotalAmountView = this.line1TotalAmount.toFixed(decimal);
        this.line2TotalAmountView = this.line2TotalAmount.toFixed(decimal);
        this.netAmountView = this.netAmount.toFixed(decimal);
    }



    // Button Callback
    onTypeChanged(type) {
        console.log(type);
        this.selectedType = type;
    }

    onRefreshClicked() {
        this.downloadChartData();
    }

    onLine1YearChanged(yearString: string) {
        let year = parseInt(yearString);
        this.line1Year = year;
    }

    onLine2YearChanged(yearString: string) {
        let year = parseInt(yearString);
        this.line2Year = year;
    }

    onAccountCheckedChange(isChecked, account: Account) {
        console.log(isChecked);
        console.log(account);
        if (isChecked == true) {
            if (this.selectedAccountIdList.indexOf(account.accountId) < 0) {
                this.selectedAccountIdList.push(account.accountId);
            }
        } else {
            let index = this.selectedAccountIdList.indexOf(account.accountId);
            if (index >= 0) {
                this.selectedAccountIdList.splice(index, 1);
            }
        }
    }
}
