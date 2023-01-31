
import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { NbDateService, NbDialogService } from '@nebular/theme';
import { Budget } from 'app/database/domain/Budget';
import { BudgetService } from 'app/database/service/BudgetService';
import { ConfirmationDialogComponent } from '../widget/confirmation-dialog/confirmation-dialog.component';
import { BudgetViewComponent } from './budget-view/budget-view.component';
import { Account } from 'app/database/domain/Account';
import { Category } from 'app/database/domain/Category';
import { BudgetDateComponent } from './budget-date/budget-date.component';
import { BudgetAccountComponent } from './budget-account/budget-account.component';
import { MyUtils } from 'app/library/MyUtils';
import { VipDialogComponent } from '../component/vip-dialog/vip-dialog.component';
import { Router } from '@angular/router';

@Component({
    selector: 'ngx-budget',
    templateUrl: './budget.component.html',
    styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {

    multiORM: MultiORM = MultiORM.getInstance();
    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;

    settings = {
        // pager:{
        //     perPage : 100,
        // },
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
            date: {
                title: 'Date',
                type: 'custom',
                width: '230px',
                renderComponent: BudgetDateComponent
            },
            name: {
                title: 'Name',
                type: 'string'
            },
            accountIdList: {
                title: 'Accounts',
                type: 'custom',
                filterFunction:this.filterFuction,
                renderComponent: BudgetAccountComponent
            },
            amount: {
                title: 'Amount',
                type: 'number'
            },

            // color: {
            //     title: 'Color',
            //     type: 'custom',
            //     renderComponent: CategoryColorComponent
            // }
        },
    };

    source: LocalDataSource = new LocalDataSource();
    accountList: Account[] = [];
    categoryList: Category[] = [];
    budgetList: Budget[] = [];
    isLoading: boolean = false;


    constructor(
        public dateService: NbDateService<Date>,
        public dialogService: NbDialogService,
        public router: Router
    ) {

        this.initData();
    }

    ngOnInit(): void {


    }

    initData() {
        this.budgetList = this.globalData.budgetList;
        if (this.budgetList.length > 0) {
            this.source.load(this.budgetList);
            return;
        }
        this.downloadBudget();
    }

    downloadBudget() {
        this.isLoading = true;
        BudgetService.all((xmlHttp: XMLHttpRequest) => {
            this.isLoading = false;
            let data = JSON.parse(xmlHttp.responseText);

            let budgetList = data["budget"];
            if (budgetList != null) {
                this.budgetList = budgetList;
            } else {
                this.budgetList = [];
            }
            this.globalData.budgetList = this.budgetList;

            let accountList = data["account"];
            if (accountList != undefined && accountList != null) {
                this.accountList = accountList;
                this.globalData.accountList = accountList;
                this.globalData.initAccountList(accountList);
            }

            let categoryList = data["category"];
            if (categoryList != undefined && categoryList != null) {
                this.categoryList = categoryList;
                this.globalData.categoryList = categoryList;
            }

            this.source.load(budgetList);

        }, (xmlHttp: XMLHttpRequest) => {
            this.isLoading = false;
            console.log(xmlHttp.responseText);
        });
    }

    removeBudgetFromList(budgetId) {
        let budgetList = this.globalData.budgetList;
        let i = 0;
        for (const key in budgetList) {
            if (Object.prototype.hasOwnProperty.call(budgetList, key)) {
                const item = budgetList[key];
                if (item.budgetId == budgetId) {
                    budgetList.splice(i, 1);
                    break;
                }
            }
            i += 1;
        }
    }

    filterFuction(cell?: any, search?: string):boolean{
        //console.log(cell);
        //console.log("search="+search);
        if(cell == ""){
            //console.log("cell empty");
            return false;
        }
        let accountIds = cell.split(",");
        for (const key in accountIds) {
            let accountId = accountIds[key];
            let account = GlobalData.getInstance().accountMap.get(accountId);
            if(account != undefined){
                let isFound = account.name.toLowerCase().indexOf(search.toLowerCase());
                if(isFound >= 0){
                    //console.log("Found,accountName="+account.name+",search="+search);
                    return true;
                }
            }
        }
        //console.log("Not found anything");
        return false;
    }



    // Button Callback
    onRefreshClicked() {
        this.downloadBudget();
    }

    onAddClicked() {
        if (this.budgetList.length >= 3  && this.globalData.vipCode <= 0) {
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
        this.dialogService.open(BudgetViewComponent, {
            context: {
                onYesClickedCallback: (budget) => {
                    console.log("Yes");
                    this.source.load(this.budgetList);
                }
            },
            closeOnBackdropClick: false,
        });
    }



    onDeleteClicked(event) {
        console.log(event);
        const budget: Budget = event.data;
        this.dialogService.open(ConfirmationDialogComponent, {
            context: {
                title: 'Delete',
                body: "Are you sure you want to delete this budget? [Note : Delete budget would not delete the transaction]",
                onYesClickedCallback: () => {
                    console.log("Yes");
                    this.removeBudgetFromList(budget.budgetId);
                    BudgetService.delete(budget);
                    this.source.load(this.budgetList);
                }
            },
        });

    }

    onEditClicked(event) {
        console.log(event);
        this.dialogService.open(BudgetViewComponent, {
            context: {
                budget: event["data"],
                onYesClickedCallback: (budget) => {
                    console.log("Yes");
                    this.source.update(budget, budget);
                    
                }
            },
            closeOnBackdropClick: false,
        });
    }

}









