import { LocalDataSource } from 'ng2-smart-table';


import { Component } from '@angular/core';
import { MultiORM } from 'app/library/simpleORM/MultiORM';
import { DashboardSetting } from 'app/model/DashboardSetting';
import { GlobalData } from 'app/model/GlobalData';
import { MyUtils } from 'app/library/MyUtils';
import { LocalData } from 'app/model/LocalData';
import { Account } from 'app/database/domain/Account';
import { NbDateService, NbDialogService } from '@nebular/theme';
import { TransactionDialogComponent } from './transaction-dialog/transaction-dialog.component';
import { AccountService } from 'app/database/service/AccountService';
import { TransactionService } from 'app/database/service/TransactionService';
import { Transaction } from 'app/database/domain/Transaction';
import { TableName } from 'app/constant/TableName';
import { DataAction } from 'app/constant/DataAction';
import { DataSyncService } from 'app/database/service/DataSyncService';
import { TransferIds } from 'app/object/TransferIds';
import { TransactionType } from 'app/constant/TransactionType';
import { DashboardDateComponent } from './dashboard-date/dashboard-date.component';
import { DashboardCategoryComponent } from './dashboard-category/dashboard-category.component';
import { DashboardAmountComponent } from './dashboard-amount/dashboard-amount.component';
import { ConfirmationDialogComponent } from '../mm365/widget/confirmation-dialog/confirmation-dialog.component';
import { Category } from 'app/database/domain/Category';
import { ChartRowData } from 'app/object/ChartRowData';
import { CategoryColumnColorComponent } from '../mm365/component/table-column/category-column-color/category-column-color';
import { InfoDialogComponent } from '../mm365/widget/info-dialog/info-dialog.component';
import { MySocket } from 'app/library/MySocket';
import { HttpPost } from 'app/library/HttpPost';
import { FunctionName } from 'app/constant/FunctionName';


var dashboardComponent:DashboardComponent;

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  multiORM: MultiORM = MultiORM.getInstance();
  globalData: GlobalData = GlobalData.getInstance();
  localData: LocalData = GlobalData.getInstance().localData;

  // Date Picker
  currentDate: Date;
  minDate: Date;
  maxDate: Date;


  settings = {
    mode: "external",
    actions: {
      delete: true,
      add: false,
      edit: true,
      position: 'right'
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
      categoryColor: {
        title: 'Color',
        type: 'custom',
        width: '30px',
        filter: false,
        renderComponent: CategoryColumnColorComponent
      },
      transactionDate: {
        title: 'Date',
        type: 'custom',
        filterFunction: this.filterFuction,
        renderComponent: DashboardDateComponent,
      },
      category: {
        title: 'Category',
        type: 'custom',
        renderComponent: DashboardCategoryComponent
      },
      amount: {
        title: 'Amount',
        type: 'custom',
        renderComponent: DashboardAmountComponent
      },
      remark: {
        title: 'Remark',
        type: 'string',
      }
    },
  };

  source: LocalDataSource = new LocalDataSource();
  transactionList: Transaction[] = [];
  accountList: Account[] = [];
  currentAccountId: string = "";
  totalExpense: number = 0;
  totalIncome: number = 0;
  isLoading: boolean = false;
  dateFormat: string = "yyyy-MM-dd HH:mm";


  constructor(
    public dateService: NbDateService<Date>,
    public dialogService: NbDialogService
  ) {
    console.log("DashboardComponent.constructor()");

    dashboardComponent = this;
    this.currentDate = new Date();
    this.minDate = MyUtils.getMonthStart(this.currentDate);
    this.maxDate = MyUtils.getMonthEnd(this.currentDate);
    this.globalData.dashboardComponent = this;
  }

  ngOnInit(): void {
    console.log("DashboardComponent.ngOnInit()");
    this.downloadData();

  }

  ngAfterViewInit() {

    console.log("DashboardComponent.ngAfterViewInit()");
    this.updateDateRange();
  }

  // =============== Table Event Start ==================
  confirmEdit(data) {
    console.log("==confirmEdit==");
    console.log(data);
  }



  // =============== Table Event Ended ==================

  onAccountChanged(accountId) {
    this.currentAccountId = accountId;
    this.globalData.localData.selectedAccountId = accountId;
    this.globalData.saveLocalData();
  }

  updateDateRange() {
    let datePickerRange: any = document.getElementById("datePickerRange");
    let rangeStart = this.dateService.format(this.minDate, "MMM d, yyyy");
    let rangeEnd = this.dateService.format(this.maxDate, "MMM d, yyyy");
    datePickerRange.value = rangeStart + " - " + rangeEnd;
  }

  downloadData() {

    // let setting: DashboardSetting = this.globalData.dashboardSetting;

    // if (setting.transactionList.length > 0) {
    //   this.transactionList = setting.transactionList;
    //   this.source.load(setting.transactionList);
    //   this.currentAccountId = this.localData.selectedAccountId;
    //   this.minDate = setting.dateStart;
    //   this.maxDate = setting.dateEnd;
    //   this.accountList = this.globalData.accountList;
    //   return;
    // }

    this.downloadAccount();

  }

  downloadAccount() {

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
        this.accountList = accounts;
        this.currentAccountId = "";
        this.globalData.initAccountList(accounts);
        if (accounts.length > 0) {
          let selectedAccountId = this.localData.selectedAccountId;
          let selectedAccount = this.globalData.accountMap.get(selectedAccountId);

          if (selectedAccount == undefined) {
            selectedAccount = accounts[0];
            selectedAccountId = selectedAccount.accountId;
            this.localData.selectedAccountId = selectedAccountId;
            this.currentAccountId = selectedAccountId;
          }
          this.currentAccountId = selectedAccountId;
          
        } else {
          // No Account
          
        }
        this.downloadTransactionList();
      }, (xmlHttp: XMLHttpRequest) => {
        this.isLoading = false;
        console.log(xmlHttp.responseText);
      });


  }

  downloadTransactionList() {

    this.isLoading = true;

    TransactionService.downloadTransactionList(this.localData, (xmlHttp: XMLHttpRequest) => {
      this.isLoading = false;
      let resultString = xmlHttp.responseText;
      if (resultString == null) {
        return;
      }
      let data = JSON.parse(resultString);
      if (data["transactionList"] == null) {
        data["transactionList"] = [];
      }
      this.transactionList = data["transactionList"];
      this.source.load(this.transactionList);
      this.globalData.dashboardSetting.transactionList = this.transactionList;
      this.totalExpense = 0;
      this.totalIncome = 0;
      for (const key in this.transactionList) {
        if (Object.prototype.hasOwnProperty.call(this.transactionList, key)) {
          const transaction = this.transactionList[key];
          if (transaction.type == "Expense") {
            this.totalExpense += transaction["amount"];
          } else {
            this.totalIncome += transaction["amount"];
          }
        }
      }
      let account: Account;
      let decimal: number = 2;
      if (this.transactionList.length > 0) {
        account = this.globalData.accountMap.get(this.transactionList[0].accountId);
        decimal = account.decimal;
      }
      this.globalData.decimalPlaces = decimal;
      let totalIncomeElement = document.getElementById("totalIncome");
      let totalExpenseElement = document.getElementById("totalExpense");

      totalIncomeElement.innerHTML = parseFloat(this.totalIncome + "").toFixed(decimal);
      if (this.totalExpense == 0) {
        totalExpenseElement.innerHTML = parseFloat("0").toFixed(decimal);
      } else {
        totalExpenseElement.innerHTML = "-" + parseFloat(this.totalExpense + "").toFixed(decimal);
      }

    }, (xmlHttp) => {
      this.isLoading = false;
      console.log(xmlHttp.responseText);
    });

  }


  
  filterFuction(cell?: any, search?: string): boolean {
    // console.log(cell);
    // console.log("search=" + search);
    if (cell == "") {
      //console.log("cell empty");
      return false;
    }
    let dateString = dashboardComponent.dateService.format(cell, dashboardComponent.dateFormat);
    if (dateString.indexOf(search) >= 0) {
      return true;
    }

    return false;

  }

  deleteTransaction(targetTransaction: Transaction) {

    this.deleteAnotherTransaction(targetTransaction);
    const accountId = targetTransaction.accountId;

    // Delete the original Transaction
    TransactionService.delete(targetTransaction.transactionId,
      (xmlHttp: XMLHttpRequest) => {

        AccountService.reCalculateBalance(accountId);

      }, null);




    // Delete transaction from array list
    this.deleteTransactionFromArrayList(targetTransaction);
  }

  deleteAnotherTransaction(transaction: Transaction) {
    if (transaction.toAccountId == "") {
      return;
    }
    try {
      let transferIds: TransferIds = JSON.parse(transaction.toAccountId);
      let targetTransactionId: string = "";
      if (transaction.type == TransactionType.EXPENSE) {
        targetTransactionId = transferIds.transactionIdTo;
      } else {
        targetTransactionId = transferIds.transactionIdFrom;
      }

      TransactionService.delete(targetTransactionId,
        (xmlHttp: XMLHttpRequest) => {
          console.log(xmlHttp.responseText);
        }, (xmlHttp: XMLHttpRequest) => {
          console.log(xmlHttp.responseText);
        });

    } catch (error) {
      console.log(error);
    }
  }

  deleteTransactionFromArrayList(targetTransaction: Transaction) {
    let i = 0;
    let found = false;
    for (const key in this.transactionList) {
      if (Object.prototype.hasOwnProperty.call(this.transactionList, key)) {
        const transaction: Transaction = this.transactionList[key];
        if (targetTransaction.transactionId == transaction.transactionId) {
          found = true;
          break;
        }
      }
      i += 1;
    }
    if (found == true) {
      this.transactionList.splice(i, 1);
      this.source.load(this.transactionList);
    }
  }



  // Button callback

  onSearchClicked() {

    try {
      let dateElement: any = document.getElementById("datePickerRange");
      let datePickerRange: string = dateElement.value;
      let datePickerRanges = datePickerRange.split("-");
      let minDateString = datePickerRanges[0].trim();
      let maxDateString = datePickerRanges[1].trim();
      let minDate = this.dateService.parse(minDateString, "MMM d, yyyy");
      let maxDate = this.dateService.parse(maxDateString, "MMM d, yyyy");
      let setting: DashboardSetting = this.globalData.dashboardSetting;
      setting.dateStart = MyUtils.getDayStart(minDate);
      setting.dateEnd = MyUtils.getDayEnd(maxDate);
    } catch (error) {
      console.log(error);
      let newDate = new Date();
      let minDate = MyUtils.getMonthStart(newDate);
      let maxDate = MyUtils.getMonthEnd(newDate);
      let setting: DashboardSetting = this.globalData.dashboardSetting;
      setting.dateStart = minDate;
      setting.dateEnd = maxDate;
      this.updateDateRange();
    }


    this.downloadTransactionList();
  }

  onDeleteClicked(event): void {
    const transaction = event.data;
    this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Delete',
        body: "Are you sure you want to delete this transaction?",
        onYesClickedCallback: () => {
          this.deleteTransaction(transaction);
        }
      },
    });

  }

  onAddClicked() {

    if (this.currentAccountId == "") {
      this.dialogService.open(InfoDialogComponent, {
        context: {
          title: "Account",
          body: "Please create an account first!"
        },
        closeOnBackdropClick: true,
      });
      return;
    }

    console.log("onAddClicked");
    this.dialogService.open(TransactionDialogComponent, {
      context: {
        onYesClickedCallback: () => {
          console.log("Yes");
          console.log(this.transactionList);
          this.source.load(this.transactionList);
        }
      },
      closeOnBackdropClick: false,
    });
  }

  onEditClicked(event: any) {
    console.log("onEditClicked");
    this.dialogService.open(TransactionDialogComponent, {
      context: {
        transaction: event["data"],
        onYesClickedCallback: (transaction) => {
          console.log("Yes");
          //this.source.load(this.transactionList);
          this.source.update(transaction, transaction);
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
