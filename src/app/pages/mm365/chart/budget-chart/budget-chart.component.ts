import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NbDateService, NbDialogService } from '@nebular/theme';
import { Account } from 'app/database/domain/Account';
import { Budget } from 'app/database/domain/Budget';
import { Category } from 'app/database/domain/Category';
import { Transaction } from 'app/database/domain/Transaction';
import { BudgetService } from 'app/database/service/BudgetService';
import { CategoryChartService } from 'app/database/service/CategoryChartService';
import { MyUtils } from 'app/library/MyUtils';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { ChartRowData } from 'app/object/ChartRowData';
import { BudgetViewComponent } from '../../budget/budget-view/budget-view.component';

@Component({
    selector: 'ngx-budget-chart',
    templateUrl: './budget-chart.component.html',
    styleUrls: ['./budget-chart.component.scss']
})
export class BudgetChartComponent implements OnInit {

    @ViewChild("viewTotalAmount") viewTotalAmount: ElementRef;
    @ViewChild("viewAmountLeft") viewAmountLeft: ElementRef;

    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;

    selectedBudgetId: string = "";
    budgetList: Budget[] = [];
    accountList: Account[] = [];
    categoryList: Category[] = [];


    isLoading: boolean = false;
    totalAmount: number = 0;
    decimalPlaces = 2;
    percentage = 0;


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
    selectedBudget:Budget = null;

    constructor(
        protected dateService: NbDateService<Date>,
        private dialogService: NbDialogService
    ) {
        this.initData();
    }

    ngOnInit(): void { }

    initData() {
        this.categoryList = this.globalData.categoryList;
        this.downloadAllData();
    }

    downloadAllData() {
        this.isLoading = true;
        BudgetService.all((xmlHttp: XMLHttpRequest) => {

            let data = JSON.parse(xmlHttp.responseText);

            let budgetList : Budget[] = data["budget"];
            if (budgetList != null) {
                this.budgetList = budgetList;
            } else {
                this.budgetList = [];
            }
            this.globalData.budgetList = this.budgetList;

            let accountList : Account[] = data["account"];
            if (accountList != undefined && accountList != null) {
                this.accountList = accountList;
                this.globalData.accountList = accountList;
                this.globalData.initAccountList(accountList);
                if(this.accountList.length > 0){
                    this.decimalPlaces = accountList[0].decimal;
                }
            }

            let categoryList: Category[] = data["category"];
            if (categoryList != undefined && categoryList != null) {
                this.categoryList = categoryList;
                this.globalData.categoryList = categoryList;
            }

            if (this.budgetList.length > 0) {
                if(this.selectedBudget == null){
                    this.selectedBudget = this.budgetList[0];
                    this.selectedBudgetId = this.selectedBudget.budgetId;
                    this.downloadBudgetTransaction(this.selectedBudget);
                }
            } else {
                this.isLoading = false;
            }


        }, (xmlHttp: XMLHttpRequest) => {
            this.isLoading = false;
            console.log(xmlHttp.responseText);
        });
    }

    downloadBudgetTransaction(budget: Budget) {

        let categoryIdList :string[] = budget.categoryIdList.split(",");
        let categoryNameList:string[] = [];
        for (const key in this.categoryList) {
            if (Object.prototype.hasOwnProperty.call(this.categoryList, key)) {
                const category = this.categoryList[key];
                if(categoryIdList.indexOf(category.categoryId) >= 0){
                    categoryNameList.push(category.name);
                }
            }
        }
        if(categoryNameList.length <= 0){
            this.clearAllData();
            this.isLoading = false;
            return; 
        }

        CategoryChartService.downloadBudgetTransaction(
            budget,
            categoryNameList,
            (xmlHttp: XMLHttpRequest) => {
                this.isLoading = false;
                this.onDownloadSuccess(xmlHttp);
            }, (xmlHttp: XMLHttpRequest) => {
                this.isLoading = false;
                console.log(xmlHttp.responseText);
            });
    }

    clearAllData(){
        this.categoryGroupAmountMap.clear();
        this.categoryTransactionMap.clear();
        this.categoryNameTop5List.splice(0, this.categoryNameTop5List.length);
        this.chartRowDataTop5List.splice(0, this.chartRowDataTop5List.length);
        this.categoryColorMap.clear();
        this.categoryTotalTransactionMap.clear();
        this.categoryColorTop5List.splice(0, this.categoryColorTop5List.length);
        this.transactionList = [];
        this.chartRowDataList = [];
        this.percentage = 0;
        this.viewTotalAmount.nativeElement.innerHTML = 0;
        this.viewAmountLeft.nativeElement.innerHTML = 0;
        this.globalData.transactionComponent.updateData(this.transactionList);

    }

    onDownloadSuccess(xmlHttp: XMLHttpRequest) {

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
        let transactionList: Transaction[] = data["downloadBudgetTransaction"];
        
        this.categoryGroupAmountMap.clear();
        this.totalAmount = 0;

        
        console.log(data);

        if(transactionList == null){
            this.transactionList = [];
            return
        }
        this.transactionList = transactionList;
        

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

        let totalTransactionAmount = this.totalAmount.toFixed(this.decimalPlaces);
        let budgetAmount = this.selectedBudget.amount.toFixed(this.decimalPlaces);
        let amountLeft = this.selectedBudget.amount - this.totalAmount;
        let budgetAmountString = totalTransactionAmount + " / " + budgetAmount;

        if(this.selectedBudget.amount != 0){
            this.percentage = parseInt((this.totalAmount/this.selectedBudget.amount * 100).toFixed(0));
        }

        this.viewTotalAmount.nativeElement.innerHTML = budgetAmountString;
        this.viewAmountLeft.nativeElement.innerHTML = amountLeft.toFixed(this.decimalPlaces);

        this.globalData.transactionComponent.updateData(transactionList);

    }

    getBudgetByBudgetId(budgetId: string) {
        for (const key in this.budgetList) {
            if (Object.prototype.hasOwnProperty.call(this.budgetList, key)) {
                const budget = this.budgetList[key];
                if (budget.budgetId == budgetId) {
                    return budget;
                }
            }
        }
        return null;
    }





    // Button Callback
    onBudgetChanged(budgetId: string) {
        this.selectedBudgetId = budgetId;
    }

    onEditClicked(){
        let budget = this.getBudgetByBudgetId(this.selectedBudgetId); 
        if(budget == null){
            return;
        }
        this.dialogService.open(BudgetViewComponent, {
            context: {
                budget: budget,
                onYesClickedCallback: (budget) => {
                    console.log("Yes");

                    // Refresh the select options
                    let tempBudgetId = this.selectedBudgetId;
                    this.selectedBudgetId = "";
                    setTimeout(() => {
                        this.selectedBudgetId = tempBudgetId;
                    }, 10);
                }
            },
            closeOnBackdropClick: false,
        });
    }

    onRefreshClicked(){
        let budget = this.getBudgetByBudgetId(this.selectedBudgetId);
        this.selectedBudget = budget;
        if(this.selectedBudget == null){
            return;
        }
        this.isLoading = true;
        this.downloadBudgetTransaction(budget);
    }


}
