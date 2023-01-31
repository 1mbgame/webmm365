
import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { DataAction } from 'app/constant/DataAction';
import { FunctionName } from 'app/constant/FunctionName';
import { TableName } from 'app/constant/TableName';
import { Account } from 'app/database/domain/Account';
import { Currency } from 'app/database/domain/Currency';
import { DatabaseUtils } from 'app/database/domain/DatabaseUtils';
import { AccountService } from 'app/database/service/AccountService';
import { DataSyncService } from 'app/database/service/DataSyncService';
import { HttpPost } from 'app/library/HttpPost';
import { MyUtils } from 'app/library/MyUtils';
import { MultiORM } from 'app/library/simpleORM/MultiORM';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { InfoDialogComponent } from '../../widget/info-dialog/info-dialog.component';

var accountViewComponent: AccountViewComponent;

@Component({
    selector: 'ngx-account-view',
    templateUrl: './account-view.component.html',
    styleUrls: ['./account-view.component.scss']
})
export class AccountViewComponent implements OnInit {

    @Input() account: Account;
    @Input() onYesClickedCallback;
    @Input() onNoClickedCallback;

    multiORM: MultiORM = MultiORM.getInstance();
    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;
    isEditMode: boolean = false;
    currencyList: Currency[] = [];
    actionTitle: string = "";

    name: string = "";
    openingBalance: number = 0;
    currencyCode: string = "USD";
    remark: string = "";

    constructor(
        private ref: NbDialogRef<AccountViewComponent>,
        private dialogService: NbDialogService
    ) {

        this.currencyList = GlobalData.getInstance().currencyList;
        accountViewComponent = this;

    }

    ngOnInit(): void {
        this.initData();
        this.initView();
    }

    initData() {
        if (this.account != undefined) {
            this.isEditMode = true;
            this.actionTitle = "Edit Account:";
            this.name = this.account.name;
            this.openingBalance = this.account.openingBalance;
            this.currencyCode = this.account.currencyCode;
            this.remark = this.account.remark;
        } else {
            this.actionTitle = "New Account:";
        }
    }

    initView() {
        let accountNameElement: any = document.getElementById("accountName");
        let openingBalanceElement: any = document.getElementById("openingBalance");
        let remarkElement: any = document.getElementById("remark");

        accountNameElement.value = this.name;
        if (this.openingBalance == 0) {
            openingBalanceElement.value = "";
        } else {
            openingBalanceElement.value = this.openingBalance;
        }

        remarkElement.value = this.remark;

    }

    validateData(): boolean {

        let accountNameElement: any = document.getElementById("accountName");
        let openingBalanceElement: any = document.getElementById("openingBalance");
        let remarkElement: any = document.getElementById("remark");
        let errorMessageElement = document.getElementById("errorMessage");


        this.name = accountNameElement.value;
        let openingBalance = openingBalanceElement.value;
        let remark = remarkElement.value;

        errorMessageElement.innerHTML = "";

        this.name = this.name.trim();
        if (this.name == "") {
            errorMessageElement.innerHTML = "The account name can not be empty!";
            accountNameElement.value = "";
            accountNameElement.focus();
            return false;
        }

        try {
            this.openingBalance = parseFloat(openingBalance);
            if (isNaN(this.openingBalance)) {
                this.openingBalance = 0;
            }
        } catch (error) {
            console.log(error);
        }



        this.remark = remark;

        return true;
    }

    saveAccount() {
        if (this.isEditMode == true) {
            this.updateAccount()
        } else {
            this.createAccount();
        }

        // Update account balance
        const targetAccountId = this.account.accountId;
        AccountService.reCalculateBalance(targetAccountId);
    }

    createAccount() {
        let currency: Currency = this.getCurrencyByCode(this.currencyCode);
        let currentDate: Date = new Date();
        let account: Account = new Account();


        account.sequence = this.getLastSequence();
        account.name = this.name;
        account.openingBalance = this.openingBalance;
        account.currencyCode = this.currencyCode;
        account.remark = this.remark;

        account.accountId = DatabaseUtils.generateId();
        account.balance = this.openingBalance;
        account.createdAt = currentDate.getTime();
        account.updatedAt = account.createdAt;
        account.currencyCountry = currency.countryName;
        account.currencySymbol = currency.currencySymbol;
        account.decimal = currency.decimal;
        account.isAutoSelected = false;
        account.isShared = false;

        this.account = account;

        AccountService.create(account);

        // Add Account into the list
        this.globalData.accountList.push(account);
        this.globalData.initAccountList(this.globalData.accountList);

    }

    updateAccount() {
        let currentDate = new Date();
        let account = this.account;
        let currencyCode = this.currencyCode;
        let currency: Currency;
        for (const key in this.currencyList) {
            if (Object.prototype.hasOwnProperty.call(this.currencyList, key)) {
                let item = this.currencyList[key];
                if (item.currencyCode == currencyCode) {
                    currency = item;
                    break;
                }
            }
        }
        account.currencyCode = currency.currencyCode;
        account.currencyCountry = currency.countryName;
        account.currencySymbol = currency.currencySymbol;
        account.decimal = currency.decimal;
        account.name = this.name;
        account.openingBalance = this.openingBalance;
        account.remark = this.remark;
        account.updatedAt = currentDate.getTime();


        AccountService.update(account);


    }

    getCurrencyByCode(currencyCode): Currency {
        for (const key in this.currencyList) {
            if (Object.prototype.hasOwnProperty.call(this.currencyList, key)) {
                const currency = this.currencyList[key];
                if (currency.currencyCode == currencyCode) {
                    return currency;
                }
            }
        }
        return null;
    }

    getLastSequence(): number {
        let accountList = this.globalData.accountList;
        if (accountList.length > 0) {
            let total = accountList.length;
            let account = accountList[total - 1];
            return (account.sequence + 1);
        }

        return 0;
    }


    // Button callback
    onYesClicked() {

        if (this.validateData() == true) {
            this.saveAccount();
            if (this.onYesClickedCallback != undefined) {
                this.onYesClickedCallback(this.account);
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

    onCurrencyChanged(currencyCode) {
        console.log(currencyCode);
        this.currencyCode = currencyCode;
    }

}
