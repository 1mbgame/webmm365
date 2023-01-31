import { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { NbDateService, NbDialogService } from "@nebular/theme";
import { SaveKeys } from "app/constant/SaveKeys";
import { Account } from "app/database/domain/Account";
import { Currency } from "app/database/domain/Currency";
import { AccountService } from "app/database/service/AccountService";
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { ConfirmationDialogComponent } from "app/pages/mm365/widget/confirmation-dialog/confirmation-dialog.component";
import { LocalDataSource } from "ng2-smart-table";
import { VipDialogComponent } from "../component/vip-dialog/vip-dialog.component";
import { AccountCurrencyComponent } from "./account-currency/account-currency.component";
import { AccountViewComponent } from "./account-view/account-view.component";


@Component({
    selector: 'ngx-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {


    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;

    settings = {
        mode: "external",
        actions: {
            delete: true,
            add: false,
            edit: true,
            position: 'right',
        },
        add: {
            addButtonContent: '<i class="nb-plus"></i>',
            createButtonContent: '<i class="nb-checkmark"></i>',
            cancelButtonContent: '<i class="nb-close"></i>',
            confirmCreate: true
        },
        edit: {
            editButtonContent: '<i class="nb-edit"></i>',
            saveButtonContent: '<i class="nb-checkmark"></i>',
            cancelButtonContent: '<i class="nb-close"></i>',
            confirmSave: true
        },
        delete: {
            deleteButtonContent: '<i class="nb-trash"></i>',
            confirmDelete: true,
        },
        columns: {
            name: {
                title: 'Name',
                type: 'string'
            },
            openingBalance: {
                title: 'Opening Balance',
                type: 'number'
            },
            currencyCode: {
                title: 'Currency',
                type: 'html',
                editor: {
                    type: 'custom',
                    component: AccountCurrencyComponent,
                },
            },
            remark: {
                title: 'note',
                type: 'string',
            }
        },
    };

    source: LocalDataSource = new LocalDataSource();
    accountList: Account[] = [];
    currencyList: Currency[] = [];
    isLoading: boolean = false;

    constructor(
        protected dateService: NbDateService<Date>,
        private dialogService: NbDialogService,
        public router: Router
    ) {
        console.log("AccountComponent.constructor()");
        this.accountList = GlobalData.getInstance().accountList;
        this.currencyList = GlobalData.getInstance().currencyList;

    }


    ngOnInit(): void {
        console.log("AccountComponent.ngOnInit()");
        this.downloadData();
    }


    downloadData() {

        try {
            if (this.accountList.length > 0) {
                this.accountList = this.globalData.accountList;
            }
            if (this.globalData.currencyList.length <= 0) {
                let currencyString = localStorage.getItem(SaveKeys.currencyList);
                if (currencyString != undefined) {
                    this.currencyList = JSON.parse(currencyString);
                    this.globalData.currencyList = this.currencyList;
                }
            }

        } catch (error) {
            console.log(error);
        }

        if (this.currencyList.length > 0) {
            if (this.accountList.length <= 0) {
                this.downloadAccount();
            } else {
                this.source.load(this.accountList);
            }
        } else {
            this.onRefreshClicked();
        }

    }

    downloadAccount() {

        this.isLoading = true;

        AccountService.downloadAccountList(
            (xmlHttp: XMLHttpRequest) => {
                this.isLoading = false;
                let resultString = xmlHttp.responseText;
                console.log(resultString);
                let data = JSON.parse(resultString);

                // Account
                let accounts: Account[] = data["accountList"];
                if (accounts == null) {
                    accounts = [];
                }
                this.accountList = accounts;
                this.globalData.initAccountList(accounts);
                if (accounts.length > 0) {
                    this.source.load(this.accountList);
                } else {
                    // No Account
                    this.accountList = [];
                }
            }, (xmlHttp: XMLHttpRequest) => {
                this.isLoading = false;
                console.log(xmlHttp.responseText);
            });


    }

    onRefreshSuccess(xmlHttp: XMLHttpRequest) {

        let resultString = xmlHttp.responseText;
        if (resultString == "") {
            return;
        }
        let data = JSON.parse(resultString);

        // Currency
        this.currencyList = data["currencyList"];
        if (this.currencyList != null) {
            localStorage.setItem(SaveKeys.currencyList, JSON.stringify(this.currencyList));
            this.globalData.currencyList = this.currencyList;
        } else {
            this.currencyList = [];
        }

        // Account
        this.accountList = data["accountList"];
        console.log(this.accountList);
        if (this.accountList != null) {
            this.globalData.accountList = this.accountList;
            this.globalData.initAccountList(this.accountList);
        } else {
            this.accountList = [];
        }

        this.source.load(this.accountList);

    }

    removeAccountFromList(accountId: string) {
        let accountList = this.globalData.accountList;
        let i = 0;
        for (const key in accountList) {
            if (Object.prototype.hasOwnProperty.call(accountList, key)) {
                const item = accountList[key];
                if (item.accountId == accountId) {
                    accountList.splice(i, 1);
                    break;
                }
            }
            i += 1;
        }
    }




    // Button  Callback
    onRefreshClicked() {


        this.isLoading = true;
        AccountService.downloadAccountCurrency(
            (xmlHttp: XMLHttpRequest) => {
                this.isLoading = false;
                this.onRefreshSuccess(xmlHttp);
            }, (xmlHttp: XMLHttpRequest) => {
                this.isLoading = false;
                console.log(xmlHttp.responseText);
            }
        );
    }



    onDeleteClicked(event): void {
        console.log(event);
        const account: Account = event.data;
        this.dialogService.open(ConfirmationDialogComponent, {
            context: {
                title: 'Delete',
                body: "Are you sure you want to delete this account? All transactions belong to this account will be deleted.",
                onYesClickedCallback: () => {
                    console.log("Yes");
                    this.removeAccountFromList(account.accountId);
                    AccountService.delete(account);
                    this.source.load(this.accountList);
                    this.globalData.initAccountList(this.globalData.accountList);
                }
            },
        });
    }

    onDeleteConfirmClicked(event) {
        console.log(event);

    }

    onAddClicked() {
        
        if (this.accountList.length >= 3 && this.globalData.vipCode <= 0) {
            this.dialogService.open(VipDialogComponent, {
                context: {
                    onYesClickedCallback: () => {
                        this.router.navigate(["/pages/mm365/vip"]);
                    }
                },
                closeOnBackdropClick: false,
            });    
            return;
        }

        console.log("onAddClicked");
        this.dialogService.open(AccountViewComponent, {
            context: {
                onYesClickedCallback: () => {
                    console.log("Yes");
                    this.source.load(this.accountList);
                }
            },
            closeOnBackdropClick: false,
        });
    }

    onEditClicked(event: any) {
        console.log("onEditClicked");
        console.log(event);

        console.log("onAddClicked");
        this.dialogService.open(AccountViewComponent, {
            context: {
                account: event["data"],
                onYesClickedCallback: (account) => {
                    console.log("Yes");
                    this.source.load(this.accountList);
                    this.source.update(account, account);
                }
            },
            closeOnBackdropClick: false,
        });
    }

    onCreateConfirm(event) {
        console.log("onCreateConfirm");
        console.log(event);


    }

    onEditConfirm(event) {
        console.log("onEditConfirm");
        console.log(event);


    }


}