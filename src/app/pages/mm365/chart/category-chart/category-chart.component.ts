import { ElementRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NbDateService } from '@nebular/theme';
import { TransactionType } from 'app/constant/TransactionType';
import { Account } from 'app/database/domain/Account';
import { Category } from 'app/database/domain/Category';
import { Transaction } from 'app/database/domain/Transaction';
import { CategoryChartService } from 'app/database/service/CategoryChartService';
import { MyUtils } from 'app/library/MyUtils';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { ChartRowData } from 'app/object/ChartRowData';
import { LocalDataSource } from 'ng2-smart-table';
import { CategoryColumnColorComponent } from '../../component/table-column/category-column-color/category-column-color';

var categoryChartComponent: CategoryChartComponent;

@Component({
    selector: 'ngx-category-chart',
    templateUrl: './category-chart.component.html',
    styleUrls: ['./category-chart.component.scss']
})
export class CategoryChartComponent implements OnInit {

    @ViewChild("inputDatePickerRange") inputDatePickerRange: ElementRef;
    @ViewChild("viewTotalAmount") viewTotalAmount: ElementRef;

    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;

    selectedAccountIdList: string[] = [];
    accountList: any[] = [];
    currentAccountId: string = "";
    dateFormat: string = "MMM d, yyyy";

    startDate: Date;
    endDate: Date;
    isLoading: boolean = false;
    isTableLoading: boolean = false;
    totalAmount: number = 0;
    type: string = TransactionType.EXPENSE;
    isShowTransactionTable:boolean = false;
    decimalPlaces = 2;
    isReloaded:boolean = false;

    // Chart
    transactionList: Transaction[] = [];
    chartRowDataList: ChartRowData[] = [];
    categoryTransactionMap: Map<string, Transaction[]> = new Map();
    categoryGroupAmountMap: Map<string, number> = new Map();
    categoryColorMap: Map<string, string> = new Map();
    categoryTotalTransactionMap: Map<string, number> = new Map();
    categoryNameTop5List: string[] = [];
    chartRowDataTop5List: ChartRowData[] = [];
    categoryColorTop5List: string[] = [];

    // Bar Chart Values
    barChartXAxisDataList:string[] = [];
    barChartYAxisDataList:number[] = [];



    constructor(
        protected dateService: NbDateService<Date>,
    ) {
        this.initData();
        categoryChartComponent = this;
    }

    ngOnInit(): void {
        
    }

    ngAfterViewInit(): void {
        this.initView();
        this.globalData.chartTableComponent.onEditClickedCallback = this.onEditClicked;
    }

    initData() {
        this.accountList = this.globalData.accountList;
        let currentDate = new Date();
        this.startDate = MyUtils.getMonthStart(currentDate);
        this.endDate = MyUtils.getMonthEnd(currentDate);
        this.downloadAllData();
    }

    initView() {
        this.updateDateRange();
        
    }

    downloadAllData() {

        this.isLoading = true;

        CategoryChartService.downloadAllData(this.type, this.startDate, this.endDate,
            (xmlHttp: XMLHttpRequest) => {
                this.onDownloadSuccess(xmlHttp, false);
                this.isLoading = false;
            }, (xmlHttp: XMLHttpRequest) => {
                console.log(xmlHttp.responseText);
                this.isLoading = false;
            }
        );

    }

    refreshData() {
        this.isLoading = true;
        CategoryChartService.downloadData(this.type, this.selectedAccountIdList, this.startDate, this.endDate,
            (xmlHttp: XMLHttpRequest) => {
                this.onDownloadSuccess(xmlHttp, true);
                this.isLoading = false;
            }, (xmlHttp: XMLHttpRequest) => {
                console.log(xmlHttp.responseText);
                this.isLoading = false;
            }
        );
    }

    onDownloadSuccess(xmlHttp: XMLHttpRequest, isRefresh: boolean) {

        this.categoryGroupAmountMap.clear();
        this.categoryTransactionMap.clear();
        this.categoryNameTop5List.splice(0, this.categoryNameTop5List.length);
        this.chartRowDataTop5List.splice(0, this.chartRowDataTop5List.length);
        this.categoryColorMap.clear();
        this.categoryTotalTransactionMap.clear();
        this.categoryColorTop5List.splice(0, this.categoryColorTop5List.length);
        this.transactionList = [];
        this.chartRowDataList = [];

        let data = JSON.parse(xmlHttp.responseText);
        let transactionList: Transaction[] = data["transaction"];
        let accountList: Account[] = data["account"];
        let categoryList : Category[] = data["category"];
        this.categoryGroupAmountMap.clear();
        this.totalAmount = 0;

        if(this.globalData.accountList.length <= 0){
            if(accountList != undefined && accountList != null){
                this.globalData.initAccountList(accountList);
            }
        }else{
            accountList = this.globalData.accountList;
        }
        
        if(this.globalData.categoryList.length <= 0){
            if(categoryList!= undefined && categoryList != null){
                this.globalData.categoryList = categoryList;
            }
        }


        this.decimalPlaces = accountList[0].decimal;
        this.transactionList = transactionList;
        if(this.transactionList == null){
            this.transactionList = [];
            return;
        }

        for (const key in transactionList) {
            if (Object.prototype.hasOwnProperty.call(transactionList, key)) {
                const transaction: Transaction = transactionList[key];
                let amount = this.categoryGroupAmountMap.get(transaction.category);
                let totalTransaction = this.categoryTotalTransactionMap.get(transaction.category);
                if (amount != undefined) {
                    amount += transaction.amount;
                } else {
                    amount = transaction.amount;
                }
                if (totalTransaction != undefined) {
                    totalTransaction += 1;
                } else {
                    totalTransaction = 1;
                }
                this.categoryGroupAmountMap.set(transaction.category, amount);
                this.categoryTotalTransactionMap.set(transaction.category, totalTransaction);

                // Transaction
                let transactions = this.categoryTransactionMap.get(transaction.category);
                if (transactions == undefined) {
                    transactions = [];
                    this.categoryTransactionMap.set(transaction.category, transactions);
                }
                transactions.push(transaction);

                // Color list
                let color = this.categoryColorMap.get(transaction.category);
                if (color == undefined) {
                    this.categoryColorMap.set(transaction.category, transaction.categoryColor);
                }

                this.totalAmount += transaction.amount;
            }
        }

        if (accountList != undefined) {
            this.accountList = accountList;
            GlobalData.getInstance().initAccountList(accountList);
            if (isRefresh == false) {
                this.selectedAccountIdList = [];
                for (const key in accountList) {
                    if (Object.prototype.hasOwnProperty.call(accountList, key)) {
                        const account = accountList[key];
                        this.selectedAccountIdList.push(account.accountId);
                    }
                }
            }

        }



        this.categoryGroupAmountMap = MyUtils.sortMapObject(this.categoryGroupAmountMap, 1, false);




        let i = 0;
        for (let [key, value] of this.categoryGroupAmountMap) {

            let color = this.categoryColorMap.get(key);
            let totalTransaction = this.categoryTotalTransactionMap.get(key);
            let transactions = this.categoryTransactionMap.get(key);
            this.categoryNameTop5List[i] = key;
            let chartRowData = new ChartRowData();
            chartRowData.name = key;
            chartRowData.value = parseFloat(value.toFixed(this.decimalPlaces));
            chartRowData.color = color;
            chartRowData.totalTransaction = totalTransaction;
            chartRowData.transactionList = transactions;

            if (i < 5) {
                // Top 5 Amount
                this.chartRowDataTop5List.push(chartRowData);

                // Top 5 Color List 
                this.categoryColorTop5List.push(color);


                // Category Data List
            }

            this.chartRowDataList.push(chartRowData);

            i += 1;

        }

        this.globalData.categoryPieComponent.updateData(
            this.categoryColorTop5List,
            this.categoryNameTop5List,
            this.chartRowDataTop5List
        );

        this.viewTotalAmount.nativeElement.innerHTML = this.totalAmount.toFixed(this.decimalPlaces);

        this.globalData.chartTableComponent.updateData(this.chartRowDataList);

    }

    updateDateRange() {
        let rangeStart = this.dateService.format(this.startDate, this.dateFormat);
        let rangeEnd = this.dateService.format(this.endDate, this.dateFormat);
        this.inputDatePickerRange.nativeElement.value = rangeStart + " - " + rangeEnd;
    }

    initBarChartData(transactionList:Transaction[]){
        
    }

    // Button Callback
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

    onRefreshClicked() {
        // Date Range
        try {
            let datePickerRangeValue: string = this.inputDatePickerRange.nativeElement.value;
            let datePickerRanges = datePickerRangeValue.split("-");
            let minDateString = datePickerRanges[0].trim();
            let maxDateString = datePickerRanges[1].trim();
            let minDate = this.dateService.parse(minDateString, this.dateFormat);
            let maxDate = this.dateService.parse(maxDateString, this.dateFormat);
            this.startDate = minDate;
            this.endDate = maxDate;
        } catch (error) {
            console.log(error);
            let newDate = new Date();
            let minDate = MyUtils.getMonthStart(newDate);
            let maxDate = MyUtils.getMonthEnd(newDate);
            this.startDate = minDate;
            this.endDate = maxDate;
            this.updateDateRange();
        }
        this.refreshData();
    }

    onTypeIncomeClicked(type) {
        console.log(type);
        this.type = type;
    }

    onTypeExpenseClicked(type) {
        console.log(type);
        this.type = type;
    }

    onEditClicked(event) {
        console.log("display transaction table");
        categoryChartComponent.isTableLoading = true;
        let chartRowData: ChartRowData = event["data"];
        let transactionList = categoryChartComponent.categoryTransactionMap.get(chartRowData.name);
        let transactionIdList: string[] = [];
        for (const key in transactionList) {
            if (Object.prototype.hasOwnProperty.call(transactionList, key)) {
                const transaction = transactionList[key];
                transactionIdList.push(transaction.transactionId);
            }
        }
        CategoryChartService.downloadMultipleTransaction(transactionIdList,
            (xmlHttp: XMLHttpRequest) => {
                categoryChartComponent.isTableLoading = false;
                let data = JSON.parse(xmlHttp.responseText);
                let transactionList = data["downloadMultipleTransaction"];
                categoryChartComponent.transactionList = transactionList;
                categoryChartComponent.isShowTransactionTable = true;
            }, (xmlHttp: XMLHttpRequest) => {
                console.log(xmlHttp.responseText);
                categoryChartComponent.isTableLoading = false;
            });
    }

    onBackClicked(){
        this.isShowTransactionTable = false;
        this.isReloaded = true;
        setTimeout(() => {
            this.viewTotalAmount.nativeElement.innerHTML = this.totalAmount.toFixed(this.decimalPlaces);
            GlobalData.getInstance().chartTableComponent.onEditClickedCallback = this.onEditClicked;
            this.updateDateRange();
        }, 1000);
    }

   

}
