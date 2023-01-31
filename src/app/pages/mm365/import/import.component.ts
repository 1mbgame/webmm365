import { Component, OnInit } from '@angular/core';
import { NbDateService, NbDialogService } from '@nebular/theme';
import { ColorName } from 'app/constant/ColorName';
import { FunctionName } from 'app/constant/FunctionName';
import { SaveKeys } from 'app/constant/SaveKeys';
import { TransactionType } from 'app/constant/TransactionType';
import { Account } from 'app/database/domain/Account';
import { Category } from 'app/database/domain/Category';
import { Currency } from 'app/database/domain/Currency';
import { DatabaseUtils } from 'app/database/domain/DatabaseUtils';
import { Transaction } from 'app/database/domain/Transaction';
import { AccountService } from 'app/database/service/AccountService';
import { ImportService } from 'app/database/service/ImportService';
import { HttpPost } from 'app/library/HttpPost';
import { MyFile } from 'app/library/MyFile';
import { MyUtils } from 'app/library/MyUtils';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { isDate } from 'rxjs/internal/util/isDate';
import { InfoDialogComponent } from '../widget/info-dialog/info-dialog.component';

var importComponent: ImportComponent;

@Component({
    selector: 'ngx-import',
    templateUrl: './import.component.html',
    styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;

    isLoading: boolean = false;
    fileList: File[] = [];

    isResultDisplay: boolean = false;
    totalRecordRejected: number = 0;
    totalRecordImported: number = 0;
    errorMessageList: string[] = [];
    filename: string = "";

    currencyMap: Map<string, Currency> = new Map();
    accountMap: Map<string, Account> = new Map();
    categoryMap: Map<string, Category> = new Map();

    newAccountList: Account[] = [];
    newCurrencyList: Currency[] = [];
    newCategoryList: Category[] = [];
    newTransactionList: Transaction[] = [];


    constructor(
        protected dateService: NbDateService<Date>,
        protected dialogService: NbDialogService,
    ) {
        importComponent = this;
        this.downloadAccount();
    }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.initView();
    }

    initView() {
        let dropContainer = document.getElementById("dropContainer");
        let fileInput: any = document.getElementById("fileInput");

        dropContainer.ondragover = dropContainer.ondragenter = function (evt) {
            evt.preventDefault();
        };

        dropContainer.ondrop = function (evt) {
            // pretty simple -- but not for IE :(
            fileInput.files = evt.dataTransfer.files;

            // If you want to use some of the dropped files
            const dT = new DataTransfer();
            dT.items.add(evt.dataTransfer.files[0]);
            //dT.items.add(evt.dataTransfer.files[3]);
            fileInput.files = dT.files;
            
            importComponent.fileList = fileInput.files;
            importComponent.filename = fileInput.files[0].name;
            

            evt.preventDefault();
        };
    }

    importFile(event) {

        this.newAccountList = [];
        this.newCurrencyList = [];
        this.newCategoryList = [];
        this.newTransactionList = [];

        this.initAccountMap();
        this.initCurrencyMap();
        this.initCategoryMap();

        this.totalRecordImported = 0;
        this.totalRecordRejected = 0;



        let fileContent: string = event.target.result;
        let lineList = fileContent.split("\n");
        let total = lineList.length;
        for (let i = 0; i < total; i++) {
            const readLine = lineList[i];
            if (i == 0) {
                continue;
            }
            const line = readLine.trim();
            if(line == ""){
                continue;
            }
            this.createNewTransaction(line, i + 1);
        }

        
        ImportService.createAllData(this.newAccountList, this.newCurrencyList, this.newCategoryList, this.newTransactionList,()=>{
            AccountService.reCalculateBalance("all");
        });

        // Clear file input
        let fileInput: any = document.getElementById("fileInput");
        fileInput.value = "";

    }

    downloadAccount() {

        if(this.globalData.accountList.length > 0){
            return;
        }
        
        this.isLoading = true;

    
        AccountService.downloadAccountCategory(
          (xmlHttp: XMLHttpRequest) => {
            this.isLoading = false;
            let data = JSON.parse(xmlHttp.responseText);
    
            // Category
            let categoryList = data["categoryList"];
            if (categoryList != null) {
              this.globalData.categoryList = categoryList;
            } else {
              this.globalData.categoryList = [];
            }
    
            // Account
            let accounts: Account[] = data["accountList"];
            this.globalData.initAccountList(accounts);
            if (accounts.length > 0) {
              let selectedAccountId = this.localData.selectedAccountId;
              let selectedAccount = this.globalData.accountMap.get(selectedAccountId);
    
              if (selectedAccount == undefined) {
                selectedAccount = accounts[0];
                selectedAccountId = selectedAccount.accountId;
                this.localData.selectedAccountId = selectedAccountId; 
              }
            }
          }, (xmlHttp: XMLHttpRequest) => {
            this.isLoading = false;
            console.log(xmlHttp.responseText);
          });
    
    
    }


    initCurrencyMap() {
        if (this.currencyMap.size > 0) {
            return;
        }
        if(this.globalData.currencyList.length<=0){
            let currencyListString = localStorage.getItem(SaveKeys.currencyList);
            if(currencyListString == undefined){
                currencyListString = "[]";
            }
            this.globalData.currencyList = JSON.parse(currencyListString);
        }
        for (const key in this.globalData.currencyList) {
            if (Object.prototype.hasOwnProperty.call(this.globalData.currencyList, key)) {
                const currency = this.globalData.currencyList[key];
                this.currencyMap.set(currency.currencyCode.toUpperCase(), currency);
            }
        }
    }

    initAccountMap() {
        if (this.accountMap.size > 0) {
            return;
        }
        for (const key in this.globalData.accountList) {
            if (Object.prototype.hasOwnProperty.call(this.globalData.accountList, key)) {
                const account = this.globalData.accountList[key];
                this.accountMap.set(account.name.toUpperCase(), account);
            }
        }
    }

    initCategoryMap() {
        if (this.categoryMap.size > 0) {
            return;
        }
        for (const key in this.globalData.categoryList) {
            if (Object.prototype.hasOwnProperty.call(this.globalData.categoryList, key)) {
                const category = this.globalData.categoryList[key];
                this.categoryMap.set(category.name.toUpperCase(), category);
            }
        }
    }

    createNewTransaction(line: string, rowNumber: number) {

        let columnList = this.parseCsvLine(line);
        let accountName: string = columnList[0].trim();
        let currencyCode: string = columnList[1].trim().toUpperCase();
        let transactionDate: Date = null;
        let currentDate: Date = new Date();

        if (accountName == "") {
            this.totalRecordRejected += 1;
            this.errorMessageList.push("Row " + rowNumber + ", the account name can not be empty!");
            return;
        }

        if (currencyCode.length != 3) {
            this.totalRecordRejected += 1;
            this.errorMessageList.push("Row " + rowNumber + ", the currency code format was wrong!");
            return;
        }

        // Create currency
        let currency = this.getCurrency(currencyCode);

        // Create Account
        let account: Account = this.accountMap.get(accountName.toUpperCase());
        if (account == undefined) {
            account = this.createNewAccount(accountName, currency);
        }

        // Transaction Date
        try {
            let dateString = columnList[2].trim();
            let dateItemList = dateString.split("/");
            if(dateItemList.length != 3){
                this.totalRecordRejected += 1;
                this.errorMessageList.push("Row " + rowNumber + ", the date format(dd/MM/yy) was wrong!");
                return;
            }
            let newDate = new Date();
            newDate.setDate(parseInt(dateItemList[0]));
            newDate.setMonth(parseInt(dateItemList[1]) - 1);
            if(dateItemList[2].length == 2){
                let currentYear = newDate.getFullYear() + "";
                let yearFirstValue = currentYear.substring(0,currentYear.length - 2);
                let yearString = yearFirstValue + parseInt(dateItemList[2]);
                newDate.setUTCFullYear(parseInt(yearString));
            }else if(dateItemList[2].length == 4){
                newDate.setUTCFullYear(parseInt(dateItemList[2]));
            }else{
                this.totalRecordRejected += 1;
                this.errorMessageList.push("Row " + rowNumber + ", the date format(dd/MM/yy) was wrong!");
                return;
            }
            transactionDate = newDate;
        
            if (isDate(transactionDate) == false) {
                this.totalRecordRejected += 1;
                this.errorMessageList.push("Row " + rowNumber + ", the date format(dd/MM/yy) was wrong!");
                return;
            }
        } catch (error) {
            console.log(error);
            this.totalRecordRejected += 1;
            this.errorMessageList.push("Row " + rowNumber + ", the date format was wrong!");
            return;
        }

        // Transaction Amount
        let amountString = columnList[5].trim();
        if (amountString == "") {
            amountString = "0";
        }

        let amount = 0.0;
        try {
            amount = parseFloat(amountString);
            if (isNaN(amount) == true) {
                this.totalRecordRejected += 1;
                this.errorMessageList.push("Row " + rowNumber + ", the amount must be integer value!");
                return;
            }
            if (amount == null) {
                this.totalRecordRejected += 1;
                this.errorMessageList.push("Row " + rowNumber + ", the amount must be integer value!");
                return;
            }
        } catch (error) {
            console.log(error);
            this.totalRecordRejected += 1;
            this.errorMessageList.push("Row " + rowNumber + ", the amount must be integer value!");
            return;
        }

        // Transaction Type
        let transactionTypeUpperCased = columnList[3].trim().toUpperCase();
        let transactionType: string = "";

        if (transactionTypeUpperCased == TransactionType.INCOME.toUpperCase()) {
            transactionType = TransactionType.INCOME;
        } else if (transactionTypeUpperCased == TransactionType.EXPENSE.toUpperCase()) {
            transactionType = TransactionType.EXPENSE;
        } else {
            this.totalRecordRejected += 1;
            this.errorMessageList.push("Row " + rowNumber + ", the transaction type must be equal to Income/Expense");
            return;
        }

        // Check the category
        let categoryName = columnList[4].trim();
        if (categoryName == "") {
            this.totalRecordRejected += 1;
            this.errorMessageList.push("Row " + rowNumber + ", the Category can not be empty!");
            return;
        }
        let category: Category = this.getCategory(categoryName, transactionType);


        // Add Transaction
        let transaction = new Transaction();

        transaction.accountId = account.accountId;
        transaction.amount = amount;
        transaction.category = category.name;
        transaction.categoryColor = category.color;
        transaction.createdAt = currentDate.getTime();
        transaction.remark = columnList[6].trim();
        transaction.toAccountId = "";
        transaction.transactionDate = transactionDate.getTime();
        transaction.transactionId = DatabaseUtils.generateId();
        transaction.type = transactionType;
        transaction.updatedAt = transaction.createdAt;
        transaction.createdBy = this.globalData.localData.email;
        transaction.updatedBy = transaction.createdBy;
        transaction.imageJson = "";
       


        this.newTransactionList.push(transaction);
        this.totalRecordImported += 1;

    }

    getCurrency(currencyCode: string): Currency {
        let currency = this.currencyMap.get(currencyCode);
        if (currency == undefined) {
            currency = this.createCurrency(currencyCode);
        }
        return currency;
    }

    getCategory(categoryName: string, transactionType: string): Category {

        let category = this.categoryMap.get(categoryName.toUpperCase());
        if (category == undefined) {
            category = this.createCategory(categoryName, transactionType);
        }

        return category;

    }

    createCategory(categoryName: string, transactionType: string): Category {

        // if not found, create a new Category
        let category = new Category();
        let currenctDate = new Date();

        let categoryTransactionType = TransactionType.EXPENSE;
        if (transactionType.toLowerCase() == TransactionType.INCOME.toLowerCase()) {
            categoryTransactionType = TransactionType.INCOME;
        }

        category.categoryId = DatabaseUtils.generateId();
        category.name = categoryName;
        category.createdAt = currenctDate.getTime();
        category.updatedAt = category.createdAt;
        category.color = ColorName.GREEN;
        category.parentId = "";
        category.transactionType = categoryTransactionType;
        category.sequence = this.getCategoryLastSequence();
        
        this.newCategoryList.push(category);
        this.categoryMap.set(category.name.toUpperCase(), category);
        this.globalData.categoryList.push(category);

        return category;
    }

    createCurrency(currencyCode: string) {
        let currency = new Currency();
        let currentDate = new Date();

        currency.updatedAt = currentDate.getTime();
        currency.isSystem = false;
        currency.regionCode = "";
        currency.decimal = 2;
        currency.currencySymbol = "$";
        currency.currencyCode = currencyCode;
        currency.createdAt = currency.updatedAt;
        currency.countryName = "";
        

        this.newCurrencyList.push(currency);
        this.currencyMap.set(currency.currencyCode.toUpperCase(), currency);
        this.globalData.currencyList.push(currency);
        localStorage.setItem(SaveKeys.currencyList,JSON.stringify(this.globalData.currencyList));

        return currency;
    }

    createNewAccount(accountName: string, currency: Currency): Account {

        let account = new Account();
        let currentDate = new Date();

        account.currencySymbol = currency.currencySymbol;
        account.currencyCountry = currency.countryName;
        account.decimal = currency.decimal;
        account.sequence = this.getAccountLastSequence();
        account.balance = 0;
        account.isAutoSelected = false;
        account.updatedAt = currentDate.getTime();
        account.accountId = DatabaseUtils.generateId();
        account.createdAt = account.updatedAt;
        account.currencyCode = currency.currencyCode;
        account.openingBalance = 0;
        account.isShared = false;
        account.remark = "";
        account.name = accountName;
        
        this.newAccountList.push(account);
        this.accountMap.set(account.name.toUpperCase(), account);
        this.globalData.accountList.push(account);
        this.globalData.initAccountList(this.globalData.accountList);

        return account;
    }

    parseCsvLine(line: string): string[] {
        let columns = line.split(",");
        let columnList: string[] = [];
        for (const key in columns) {
            if (Object.prototype.hasOwnProperty.call(columns, key)) {
                let column = columns[key];
                column = column.replace("\"", "");
                let lastIndex = column.indexOf("\"");
                if (lastIndex >= 0) {
                    column = column.substring(0, lastIndex);
                }
                columnList.push(column);
            }

        }
        if (columnList.length <= 6) {
            columnList.push("");
        }
        return columnList;
    }

    getAccountLastSequence(): number {
        if (this.globalData.accountList.length <= 0) {
            return 0;
        }

        let account = this.globalData.accountList[this.globalData.accountList.length - 1];
        return account.sequence;
    }

    getCategoryLastSequence(): number {
        if (this.globalData.categoryList.length <= 0) {
            return 0;
        }
        let category = this.globalData.categoryList[this.globalData.categoryList.length - 1];
        return category.sequence;
    }

    


    // Button Click callBack
    onImportClicked() {

        if (importComponent.fileList.length <= 0) {
            this.dialogService.open(InfoDialogComponent, {
                context: {
                    title: "Missing file",
                    body: "Please select a file first."
                },
                closeOnBackdropClick: true,
            });
            return;
        }

        this.isLoading = true;
        this.isResultDisplay = false;
        // read the file content
        let reader = new FileReader();
        reader.onload = (e) => {

            //console.log('File Result : ' + e.target.result);
            this.importFile(e);
            this.isLoading = false;
            this.isResultDisplay = true;
        };
        reader.onloadend = (e)=>{
            console.log(e);
            console.log("reader.onloadend");
            this.isLoading = false;
        }
        reader.readAsText(this.fileList[0]);

    }


    onDownloadTemplateClicked() {
        let currentDate = new Date();
        currentDate.setDate(23);
        let dateString = this.dateService.format(currentDate, "dd/MM/yy");   
        
        let fileContent = "";
        let header = "\"Account\",\"Currency Code\",\"Date(dd/MM/yy)\",\"Expense/Income\",\"Category\",\"Amount\",\"Remark\",\"Created By\"\n";
        fileContent += header;
        fileContent += "\"Cash\",\"USD\",\""+ dateString +"\",\"Income\",\"Salary\",\"3000\",\"\"\n";
        fileContent += "\"Cash\",\"USD\",\""+ dateString +"\",\"Expense\",\"Food\",\"1.50\",\"\"";

        let filename = "money_manager_import_template.csv";
        MyFile.downloadFile(filename, fileContent);
    }


}
