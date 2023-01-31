import { ElementRef } from '@angular/core';
import { Input } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NbDateService, NbDialogRef } from '@nebular/theme';
import { DataAction } from 'app/constant/DataAction';
import { TableName } from 'app/constant/TableName';
import { TransactionType } from 'app/constant/TransactionType';
import { Account } from 'app/database/domain/Account';
import { Budget } from 'app/database/domain/Budget';
import { Category } from 'app/database/domain/Category';
import { DatabaseUtils } from 'app/database/domain/DatabaseUtils';
import { BudgetService } from 'app/database/service/BudgetService';
import { DataSyncService } from 'app/database/service/DataSyncService';
import { MyUtils } from 'app/library/MyUtils';
import { MultiORM } from 'app/library/simpleORM/MultiORM';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { CategoryViewComponent } from '../../category/category-view/category-view.component';


@Component({
    selector: 'ngx-budget-view',
    templateUrl: './budget-view.component.html',
    styleUrls: ['./budget-view.component.scss']
})
export class BudgetViewComponent implements OnInit {

    @ViewChild("inputName") inputName: ElementRef;
    @ViewChild("datePickerRange") datePickerRange: ElementRef;
    @ViewChild("errorMessageView") errorMessageView: ElementRef;
    @ViewChild("inputAmount") inputAmount: ElementRef;
    @ViewChild("inputRemark") inputRemark:ElementRef;


    @Input() budget: Budget;
    @Input() onYesClickedCallback;
    @Input() onNoClickedCallback;

    multiORM: MultiORM = MultiORM.getInstance();
    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;
    isEditMode: boolean = false;
    actionTitle: string = "";
    accountList: Account[] = [];
    categoryList: Category[] = [];
    categoryIncomeList: Category[] = [];
    categoryExpenseList: Category[] = [];
    isCategoryExpenseSelectAll: boolean = false;
    dateFormat: string = "MMM d, yyyy";

    name: string = "";
    amount: number = 0;
    selectedAccountIdList: string[] = [];
    selectedCategoryIdList: string[] = [];
    startDate: Date;
    endDate: Date;
    remark: string = "";

    constructor(
        private ref: NbDialogRef<BudgetViewComponent>,
        protected dateService: NbDateService<Date>,
    ) {
        

    }

    ngOnInit(): void {
        this.initData();
    }

    ngAfterViewInit(): void {
        this.initView();
    }

    initData() {
        console.log(this.budget);
        if (this.budget != undefined) {
            this.isEditMode = true;
            this.actionTitle = "Edit Budget:";
            this.name = this.budget.name;
            this.amount = this.budget.amount;
            this.selectedAccountIdList = this.budget.accountIdList.split(",");
            this.selectedCategoryIdList = this.budget.categoryIdList.split(",");
            this.startDate = new Date(this.budget.startDate);
            this.endDate = new Date(this.budget.endDate);
            this.remark = this.budget.remark;
        } else {
            let currentDate = new Date();
            this.actionTitle = "New Budget:";
            this.startDate = MyUtils.getMonthStart(currentDate);
            this.endDate = MyUtils.getMonthEnd(currentDate);
        }
        this.accountList = this.globalData.accountList;
        this.categoryList = this.globalData.categoryList;
        this.initCategoryList();

        if (this.isEditMode == false) {
            // Select all account
            for (const key in this.accountList) {
                if (Object.prototype.hasOwnProperty.call(this.accountList, key)) {
                    const account = this.accountList[key];
                    this.selectedAccountIdList.push(account.accountId);
                }
            }

            // Select all category
            this.isCategoryExpenseSelectAll = true;
            for (const key in this.categoryExpenseList) {
                if (Object.prototype.hasOwnProperty.call(this.categoryExpenseList, key)) {
                    const category = this.categoryExpenseList[key];
                    this.selectedCategoryIdList.push(category.categoryId);
                }
            }
        }else{
            if(this.selectedCategoryIdList.length >= this.categoryExpenseList.length){
                this.isCategoryExpenseSelectAll = true;
            }
        }

    }

    initView() {

        // Name
        this.inputName.nativeElement.value = this.name;
        this.inputName.nativeElement.focus();

        // Amount
        if(this.amount == 0){
            this.inputAmount.nativeElement.value = "";
        }else{
            this.inputAmount.nativeElement.value = this.amount;
        }

        this.updateDateRange();

        // Remark
        this.inputRemark.nativeElement.value = this.remark;

    }

    initCategoryList() {
        this.categoryIncomeList.splice(0, this.categoryIncomeList.length);
        this.categoryExpenseList.splice(0, this.categoryExpenseList.length);
        for (const key in this.categoryList) {
            if (Object.prototype.hasOwnProperty.call(this.categoryList, key)) {
                const category = this.categoryList[key];
                if (category.transactionType == TransactionType.EXPENSE) {
                    this.categoryExpenseList.push(category);
                } else {
                    this.categoryIncomeList.push(category);
                }
            }
        }
    }


    updateDateRange() {
        let rangeStart = this.dateService.format(this.startDate, this.dateFormat);
        let rangeEnd = this.dateService.format(this.endDate, this.dateFormat);
        this.datePickerRange.nativeElement.value = rangeStart + " - " + rangeEnd;
    }


    validateData(): boolean {

        // Name
        this.name = this.inputName.nativeElement.value;
        this.name = this.name.trim();

        // Amount
        try {
            let amountValue: string = this.inputAmount.nativeElement.value;
            let amountString = amountValue.trim();
            let amountNumber = parseFloat(amountString);
            if (isNaN(amountNumber) == true) {
                amountNumber = 0;
            }
            this.amount = amountNumber;
        } catch (error) {
            console.log(error);
            this.amount = 0
        }

        // Date Range
        try {
            let datePickerRangeValue: string = this.datePickerRange.nativeElement.value;
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

        // Remark
        let remarkValue : string = this.inputRemark.nativeElement.value;
        this.remark = remarkValue.trim();

        return true;
    }

    save() {
        if (this.isEditMode == true) {
            this.updateButget()
        } else {
            this.createBudget();
        }
    }

    updateButget() {
        let currentDate = new Date();

        this.endDate.setHours(23);
        this.endDate.setMinutes(59);
        this.endDate.setSeconds(59);
        
        this.budget.name = this.name;
        this.budget.amount = this.amount;
        this.budget.startDate = this.startDate.getTime();
        this.budget.endDate = this.endDate.getTime();
        this.budget.accountIdList = this.selectedAccountIdList.join(",");
        this.budget.categoryIdList = this.selectedCategoryIdList.join(",");
        this.budget.remark = this.remark;
        this.budget.updatedAt = currentDate.getTime();
        
        BudgetService.update(this.budget);

       
    }

    createBudget() {

        let currentDate = new Date();
        this.budget = new Budget();

        this.endDate.setHours(23);
        this.endDate.setMinutes(59);
        this.endDate.setSeconds(59);

        this.budget.budgetId = DatabaseUtils.generateId();
        this.budget.name = this.name;
        this.budget.amount = this.amount;
        this.budget.startDate = this.startDate.getTime();
        this.budget.endDate = this.endDate.getTime();
        this.budget.accountIdList = this.selectedAccountIdList.join(",");
        this.budget.categoryIdList = this.selectedCategoryIdList.join(",");
        this.budget.remark = this.remark;
        this.budget.createdAt = currentDate.getTime();
        this.budget.updatedAt = this.budget.createdAt;
        
        this.globalData.budgetList.splice(0,0,this.budget);

        BudgetService.create(this.budget);

        
    }





    // Button Callback
    onYesClicked() {
        if (this.validateData() == true) {
            this.save();
            if (this.onYesClickedCallback != undefined) {
                this.onYesClickedCallback(this.budget);
            }
            this.ref.close();
        }
    }

    onNoClicked() {
        if (this.onNoClickedCallback != undefined) {
            this.onNoClickedCallback();
        }
        this.ref.close();
    }

    onCategoryAllClicked() {
        this.isCategoryExpenseSelectAll = !this.isCategoryExpenseSelectAll;
        if (this.isCategoryExpenseSelectAll == true) {
            for (const key in this.categoryExpenseList) {
                if (Object.prototype.hasOwnProperty.call(this.categoryExpenseList, key)) {
                    const category = this.categoryExpenseList[key];
                    if (this.selectedCategoryIdList.indexOf(category.categoryId) < 0) {
                        this.selectedCategoryIdList.push(category.categoryId);
                    }
                }
            }
        } else {
            for (const key in this.categoryExpenseList) {
                if (Object.prototype.hasOwnProperty.call(this.categoryExpenseList, key)) {
                    const category = this.categoryExpenseList[key];
                    let index = this.selectedCategoryIdList.indexOf(category.categoryId);
                    if (index >= 0) {
                        this.selectedCategoryIdList.splice(index, 1);
                    }
                }
            }
        }
    }

    onAccountCheckedChange(isChecked, account : Account) {
        console.log(isChecked);
        console.log(account);
        if(isChecked == true){
            if(this.selectedAccountIdList.indexOf(account.accountId) < 0){
                this.selectedAccountIdList.push(account.accountId);
            }
        }else{
            let index = this.selectedAccountIdList.indexOf(account.accountId);
            if(index >= 0){
                this.selectedAccountIdList.splice(index,1);
            }
        }
    }

    onCategoryCheckedChange(isChecked, category : Category) {
        console.log(isChecked);
        console.log(category);
        if(isChecked == true){
            if(this.selectedCategoryIdList.indexOf(category.categoryId) < 0){
                this.selectedCategoryIdList.push(category.categoryId);
            }
        }else{
            let index = this.selectedCategoryIdList.indexOf(category.categoryId);
            if(index >= 0){
                this.selectedCategoryIdList.splice(index,1);
            }
        }
    }


}
