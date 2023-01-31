import { Component, Input, OnInit } from '@angular/core';
import { NbDateService, NbDialogRef } from '@nebular/theme';
import { MyUtils } from 'app/library/MyUtils';
import { MultiORM } from 'app/library/simpleORM/MultiORM';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { Category } from 'app/database/domain/Category';
import { DatabaseUtils } from 'app/database/domain/DatabaseUtils';
import { TransactionService } from 'app/database/service/TransactionService';
import { TransferIds } from 'app/object/TransferIds';
import { ConfirmationDialogComponent } from 'app/pages/mm365/widget/confirmation-dialog/confirmation-dialog.component';
import { DataSyncService } from 'app/database/service/DataSyncService';
import { DataAction } from 'app/constant/DataAction';
import { Transaction } from 'app/database/domain/Transaction';
import { Account } from 'app/database/domain/Account';
import { ColorName } from 'app/constant/ColorName';
import { TransactionType } from 'app/constant/TransactionType';
import { TableName } from 'app/constant/TableName';
import { HttpPost } from 'app/library/HttpPost';
import { FunctionName } from 'app/constant/FunctionName';
import { AccountService } from 'app/database/service/AccountService';

var transactionDialogComponent : TransactionDialogComponent;

@Component({
  selector: 'ngx-transaction-dialog',
  templateUrl: 'transaction-dialog.component.html',
  styleUrls: ['transaction-dialog.component.scss'],
})
export class TransactionDialogComponent implements OnInit {

  @Input() transaction: Transaction;
  @Input() onYesClickedCallback;
  @Input() onNoClickedCallback;

  multiORM: MultiORM = MultiORM.getInstance();
  globalData: GlobalData = GlobalData.getInstance();
  localData: LocalData = GlobalData.getInstance().localData;
  accountList: Account[] = [];
  categoryList: Category[] = [];
  transferIds: TransferIds;
  dateFormat: string = "MMM d, yyyy "

  transactionTypeDisplay: string = "Expense";

  transactionType: string = "Expense";
  transactionDate: Date;
  accountIdFrom: string = "";
  accountIdTo: string = "";
  currentAccount: Account;
  currentAccountId: string = "";
  currentCategoryId: string = "";
  amount: number = 0;
  remark: string = "";
  isEditMode: boolean = false;


  constructor(
    private ref: NbDialogRef<ConfirmationDialogComponent>,
    private dateService: NbDateService<Date>,
  ) {
    this.accountList = GlobalData.getInstance().accountList;
    transactionDialogComponent = this;
  }


  ngOnInit(): void {
    this.initData();
  }

  dismiss() {
    this.ref.close();
  }

  initData() {


    if (this.transaction == undefined) {
      this.isEditMode = false;
      this.transactionDate = new Date();
      this.categoryList = this.getCategoryListByTransactionType(this.transactionType);
      this.currentAccountId = this.localData.selectedAccountId;
      this.currentAccount = this.globalData.accountMap.get(this.currentAccountId);
      if (this.categoryList.length > 0) {
        this.currentCategoryId = this.categoryList[0].categoryId;
      }
    } else {
      this.isEditMode = true
      if (this.transaction.toAccountId != "") {
        this.transactionType = "Transfer";
        this.transactionTypeDisplay = this.transaction.category.replace("->", "\u2794");
        try {
          this.transferIds = JSON.parse(this.transaction.toAccountId);
          this.accountIdFrom = this.transferIds.accountIdFrom;
          this.accountIdTo = this.transferIds.accountIdTo;
        } catch (error) {
          console.log(error);
          this.transferIds = new TransferIds();
        }
      } else {
        this.transactionType = this.transaction.type;
        this.transactionTypeDisplay = this.transactionType;
      }
      this.categoryList = this.getCategoryListByTransactionType(this.transactionType);
      this.transactionDate = new Date(this.transaction.transactionDate);
      this.currentAccountId = this.transaction.accountId;
      this.currentAccount = this.globalData.accountMap.get(this.currentAccountId);
      this.selectCategoryId();
      this.amount = this.transaction.amount;
      this.remark = this.transaction.remark;
    }
  }

  initView() {
    this.initTransactionTypeView();

    let transactionDateElement: any = document.getElementById("transactionDate");
    let transactionTimeElement: any = document.getElementById("transactionTime");
    let remarkElement: any = document.getElementById("remark");

    transactionDateElement.value = this.dateService.format(this.transactionDate, this.dateFormat); 
    transactionTimeElement.value = this.dateService.format(this.transactionDate, "HH:mm:ss")

    let amountElement: any = document.getElementById("amount");
    if (this.amount != 0) {
      amountElement.value = this.amount;
    }
    amountElement.focus();
    
    remarkElement.value = this.remark;

    if (this.transactionType == TransactionType.TRANSFER && this.isEditMode == true) {
      let accountNameFromElement : any = document.getElementById("accountNameFrom");
      let accountNameToElement :any = document.getElementById("accountNameTo");
      

      let accountFrom = this.globalData.accountMap.get(this.accountIdFrom)
      let accountTo = this.globalData.accountMap.get(this.accountIdTo);
      if(accountFrom != undefined){
        accountNameFromElement.value = accountFrom.name;
      }else{
        accountNameFromElement.value = this.transferIds.accountNameFrom;
      }


      if(accountTo != undefined){
        accountNameToElement.value = accountTo.name;
      }else{
        accountNameToElement.value = this.transferIds.accountNameTo;
      }
      
    }else if(this.transactionType != TransactionType.TRANSFER && this.isEditMode == true){
      let accountNameElement : any = document.getElementById("accountName");
      accountNameElement.value = this.currentAccount.name;
    }

  }

  ngAfterViewInit() {
    this.initView();
  }

  initTransactionTypeView() {
    let AccountViewElement = document.getElementById("accountView");
    let categoryViewElement = document.getElementById("categoryView");
    let fromAccountViewElement = document.getElementById("fromAccountView");
    let toAccountViewElement = document.getElementById("toAccountView");

    if (this.transactionType == "Transfer") {
      AccountViewElement.style.visibility = "collapse";
      categoryViewElement.style.visibility = "collapse";
      fromAccountViewElement.style.visibility = "visible";
      toAccountViewElement.style.visibility = "visible";
    } else {
      AccountViewElement.style.visibility = "visible";
      categoryViewElement.style.visibility = "visible";
      fromAccountViewElement.style.visibility = "collapse";
      toAccountViewElement.style.visibility = "collapse";
    }

  }

  getCategoryIdByName(categoryName: string) {
    for (const key in this.categoryList) {
      if (Object.prototype.hasOwnProperty.call(this.categoryList, key)) {
        const category: Category = this.categoryList[key];
        if (categoryName.toUpperCase() == category.name.toUpperCase()) {
          return category.categoryId;
        }
      }
    }
    return "";
  }

  saveTransaction() {

    if (this.transactionType == "Transfer") {
      if (this.transaction == undefined) {
        this.createTransfer();
      } else {
        this.updateTransfer();
      }
    } else {
      if (this.transaction == undefined) {
        this.createTransaction();
      } else {
        this.updateTransaction();
      }
    }

    // Update account balance
    // setTimeout(() => {
    //   AccountService.reCalculateBalance(transactionDialogComponent.currentAccountId);
    // }, 300);
  }

  createTransfer() {

    let accountFrom: Account = this.globalData.accountMap.get(this.accountIdFrom);
    let accountTo: Account = this.globalData.accountMap.get(this.accountIdTo);

    this.amount = parseFloat(this.amount.toFixed(accountFrom.decimal));
    let currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + 1);

    // ===================== Create Transfer From =====================
    let transactionFrom: Transaction = new Transaction();
    transactionFrom.accountId = accountFrom.accountId;
    transactionFrom.amount = this.amount;
    transactionFrom.category = accountFrom.name + " -> " + accountTo.name;
    transactionFrom.categoryColor = ColorName.LIGHT_BLUE;
    transactionFrom.createdAt = currentDate.getTime();
    transactionFrom.createdBy = this.localData.email;
    transactionFrom.remark = this.remark;
    transactionFrom.toAccountId = "";
    transactionFrom.transactionDate = this.transactionDate.getTime();
    transactionFrom.transactionId = DatabaseUtils.generateId();
    transactionFrom.type = TransactionType.EXPENSE;
    transactionFrom.updatedAt = transactionFrom.createdAt;
    transactionFrom.updatedBy = this.localData.email;
    transactionFrom.imageJson = "";
    

  

    // ===================== Transaction To =====================
    let transactionTo: Transaction = new Transaction();
    transactionTo.accountId = accountTo.accountId;
    transactionTo.amount = this.amount;
    transactionTo.category = accountFrom.name + " -> " + accountTo.name;
    transactionTo.categoryColor = ColorName.LIGHT_BLUE;
    transactionTo.createdAt = currentDate.getTime();
    transactionTo.createdBy = this.localData.email;
    transactionTo.remark = this.remark;
    transactionTo.toAccountId = "";
    transactionTo.transactionDate = this.transactionDate.getTime();
    transactionTo.transactionId = DatabaseUtils.generateId();
    transactionTo.type = TransactionType.INCOME;
    transactionTo.updatedAt = transactionFrom.createdAt;
    transactionTo.updatedBy = this.localData.email;
    transactionTo.imageJson = "";
    
    
    // ===================== Create Transfer Details =====================
    let transferIds: TransferIds = new TransferIds();
    transferIds.accountIdFrom = accountFrom.accountId;
    transferIds.accountIdTo = accountTo.accountId;
    transferIds.accountNameFrom = accountFrom.name;
    transferIds.accountNameTo = accountTo.name;
    transferIds.transactionIdFrom = transactionFrom.transactionId;
    transferIds.transactionIdTo = transactionTo.transactionId;

    let result: string = JSON.stringify(transferIds);
    transactionFrom.toAccountId = result;
    transactionTo.toAccountId = result;


    // Add to the local transaction list
    this.globalData.dashboardSetting.transactionList.splice(0, 0, transactionFrom);

    TransactionService.create(transactionFrom);
    TransactionService.create(transactionTo);

  }

  updateTransfer() {

    let transactionFrom: Transaction = null;
    let transactionTo: Transaction = null;
    let transferIds: TransferIds = JSON.parse(this.transaction.toAccountId);
    if (this.transaction.type == TransactionType.EXPENSE) {
      transactionFrom = this.transaction;
      this.updateTransferForTransactionFrom(transferIds, transactionFrom);
      TransactionService.findTransaction(transferIds.transactionIdTo, (xmlHttp: XMLHttpRequest) => {
        let resultString = xmlHttp.responseText;
        if (resultString == null) {
          return;
        }
        try {
          let results: any = JSON.parse(resultString);
          if (results["findTransaction"].length > 0) {
            transactionTo = results["findTransaction"][0];
          }
          this.onUpdateTransfer(transferIds, transactionFrom, transactionTo);
        } catch (error) {
          console.log(error);
        }

      }, (xmlHttp: XMLHttpRequest) => {
        console.log(xmlHttp.responseText);
      });

    } else {
      transactionTo = this.transaction;
      this.updateTransferForTransactionTo(transferIds, transactionTo);
      TransactionService.findTransaction(transferIds.transactionIdFrom, (xmlHttp: XMLHttpRequest) => {
        let resultString = xmlHttp.responseText;
        if (resultString == null) {
          return;
        }
        try {
          let results: any = JSON.parse(resultString);
          if (results["findTransaction"].length > 0) {
            transactionFrom = results["findTransaction"][0];
          }
          this.onUpdateTransfer(transferIds, transactionFrom, transactionTo);
        } catch (error) {
          console.log(error);
        }
      }, (xmlHttp: XMLHttpRequest) => {
        console.log(xmlHttp.responseText);
      });
    }
  }


  onUpdateTransfer(transferIds: TransferIds, transactionFrom: Transaction, transactionTo: Transaction) {

    let accountFrom: Account = this.globalData.accountMap.get(this.accountIdFrom);
    let accountTo: Account = this.globalData.accountMap.get(this.accountIdTo);


    let currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + 1);

    // ===================== Update Transfer from transaction =====================
    if (transactionFrom != null) {
      // transactionFrom already updated before API call
    } else {
      if (accountFrom != null) {
        transactionFrom = this.updateTransferCreateTransactionFrom(accountFrom, accountTo);
      }
    }
    // ============================================================================


    // ===================== Update Transfer To transaction =====================
    if (transactionTo != null) {
      // transactionTo already updated before API call
    } else {
      if (accountTo != null) {
        this.updateTransferCreateTransactionTo(accountFrom, accountTo);
      }
    }
    // ============================================================================


    // Update transaction for another account
    if (this.transaction.type == TransactionType.EXPENSE) {
      this.updateTransferForTransactionTo(transferIds, transactionTo);
    } else {
      this.updateTransferForTransactionFrom(transferIds, transactionFrom);
    }
    // ============================================================================


    // Update transferIds
    if (accountFrom != null) {
      transferIds.accountIdFrom = accountFrom.accountId;
      transferIds.accountNameFrom = accountFrom.name;
    }

    if (accountTo != null) {
      transferIds.accountIdTo = accountTo.accountId;
      transferIds.accountNameTo = accountTo.name;
    }

    if (transactionFrom != null) {
      transferIds.transactionIdFrom = transactionFrom.transactionId;
    }

    if (transactionTo != null) {
      transferIds.transactionIdTo = transactionTo.transactionId;
    }

    let transferIdsString: string = JSON.stringify(transferIds);

    if (transactionFrom != null) {
      transactionFrom.toAccountId = transferIdsString;
    }

    if (transactionTo != null) {
      transactionTo.toAccountId = transferIdsString;
    }

    // Save the entity
    if (transactionFrom != null) {
      TransactionService.update(transactionFrom);
    }
    if (transactionTo != null) {
      TransactionService.update(transactionTo);
    }

  }

  updateTransferForTransactionFrom(transferIds: TransferIds, transactionFrom: Transaction) {

    let accountFrom: Account = this.globalData.accountMap.get(this.accountIdFrom);
    let accountTo: Account = this.globalData.accountMap.get(this.accountIdTo);

    this.amount = parseFloat(this.amount.toFixed(accountFrom.decimal));
    let currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + 1);

    let accountNameTo = "";
    if (accountTo == undefined) {
      accountNameTo = transferIds.accountNameTo;
    } else {
      accountNameTo = accountTo.name;
    }

    transactionFrom.updatedAt = currentDate.getTime();
    transactionFrom.updatedBy = this.localData.email;
    transactionFrom.accountId = this.accountIdFrom;
    transactionFrom.category = accountFrom.name + " -> " + accountNameTo;
    transactionFrom.remark = this.remark;
    transactionFrom.amount = this.amount;
    transactionFrom.type = TransactionType.EXPENSE;
    transactionFrom.categoryColor = ColorName.LIGHT_BLUE;
    transactionFrom.transactionDate = this.transactionDate.getTime();
    //transactionFrom.image_json // not for web version

    
  }

  updateTransferForTransactionTo(transferIds: TransferIds, transactionTo: Transaction) {
    let accountFrom: Account = this.globalData.accountMap.get(this.accountIdFrom);
    let accountTo: Account = this.globalData.accountMap.get(this.accountIdTo);

    this.amount = parseFloat(this.amount.toFixed(accountFrom.decimal));
    let currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + 1);


    let accountNameFrom: string = "";
    if (accountFrom == null) {
      accountNameFrom = transferIds.accountNameFrom;
    } else {
      accountNameFrom = accountFrom.name;
    }

    transactionTo.updatedAt = currentDate.getTime();
    transactionTo.updatedBy = this.localData.email;
    transactionTo.accountId = this.accountIdTo;
    transactionTo.category = accountNameFrom + " -> " + accountTo.name;
    transactionTo.remark = this.remark;
    transactionTo.amount = this.amount;
    transactionTo.type = TransactionType.INCOME;
    transactionTo.categoryColor = ColorName.LIGHT_BLUE;
    transactionTo.transactionDate = this.transactionDate.getTime();
    
    
  }

  createTransaction() {
    let account = GlobalData.getInstance().accountMap.get(this.currentAccountId);
    let category = this.getCategoryById(this.currentCategoryId);
    if (category == null) {
      category = new Category();
    }
    this.amount = parseFloat(this.amount.toFixed(account.decimal));
    let currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + 1);

    this.transaction = new Transaction();
    this.transaction.accountId = account.accountId;
    this.transaction.amount = this.amount;
    this.transaction.category = category.name;
    this.transaction.categoryColor = category.color;
    this.transaction.createdAt = currentDate.getTime();
    this.transaction.createdBy = this.localData.email;
    this.transaction.remark = this.remark;
    this.transaction.toAccountId = "";
    this.transaction.transactionDate = this.transactionDate.getTime();
    this.transaction.transactionId = DatabaseUtils.generateId();
    this.transaction.type = this.transactionType;
    this.transaction.updatedAt = this.transaction.createdAt;
    this.transaction.updatedBy = this.localData.email;
    this.transaction.imageJson = "";
    
    this.globalData.dashboardSetting.transactionList.splice(0, 0, this.transaction);

    TransactionService.create(this.transaction);
    
  }

  updateTransaction() {



    let account = GlobalData.getInstance().accountMap.get(this.currentAccountId);
    let category = this.getCategoryById(this.currentCategoryId);
    if (category == null) {
      category = new Category();
    }
    this.amount = parseFloat(this.amount.toFixed(account.decimal));
    let currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + 1);

    this.transaction.accountId = account.accountId;
    this.transaction.amount = this.amount;
    this.transaction.category = category.name;
    this.transaction.categoryColor = category.color;
    this.transaction.remark = this.remark;
    this.transaction.toAccountId = "";
    this.transaction.transactionDate = this.transactionDate.getTime();
    this.transaction.transactionId = DatabaseUtils.generateId();
    this.transaction.type = this.transactionType;
    this.transaction.updatedAt = currentDate.getTime();
    this.transaction.updatedBy = this.localData.email;
    //this.transaction.imageJson = "";
    
    TransactionService.update(this.transaction);
    
  }

  updateTransferCreateTransactionFrom(accountFrom: Account, accountTo: Account): Transaction {
    let currentDate: Date = new Date();


    // ===================== Create Transfer from transaction =====================
    let transactionFrom = new Transaction();

    transactionFrom.transactionId = DatabaseUtils.generateId();
    transactionFrom.updatedAt = currentDate.getTime();
    transactionFrom.createdAt = transactionFrom.updatedAt;
    transactionFrom.toAccountId = "";
    transactionFrom.createdBy = this.localData.email;
    transactionFrom.updatedBy = this.localData.email;
    transactionFrom.accountId = this.accountIdFrom;
    transactionFrom.category = accountFrom.name + " -> " + accountTo.name;
    transactionFrom.remark = this.remark;
    transactionFrom.amount = this.amount;
    transactionFrom.type = TransactionType.EXPENSE;
    transactionFrom.categoryColor = ColorName.LIGHT_BLUE;
    transactionFrom.transactionDate = this.transactionDate.getTime();
    transactionFrom.imageJson = "";


    
    // Save the entity
    TransactionService.create(transactionFrom);

    return transactionFrom;
  }

  updateTransferCreateTransactionTo(accountFrom: Account, accountTo: Account): Transaction {
    let currentDate: Date = new Date();


    // ===================== Create Transfer from transaction =====================
    let transactionTo = new Transaction();

    transactionTo.transactionId = DatabaseUtils.generateId();
    transactionTo.updatedAt = currentDate.getTime();
    transactionTo.createdAt = transactionTo.updatedAt;
    transactionTo.toAccountId = "";
    transactionTo.createdBy = this.localData.email;
    transactionTo.updatedBy = this.localData.email;
    transactionTo.accountId = this.accountIdTo;
    transactionTo.category = accountFrom.name + " -> " + accountTo.name;
    transactionTo.remark = this.remark;
    transactionTo.amount = this.amount;
    transactionTo.type = TransactionType.INCOME;
    transactionTo.categoryColor = ColorName.LIGHT_BLUE;
    transactionTo.transactionDate = this.transactionDate.getTime();
    transactionTo.imageJson = "";


    
    // Save the entity
    TransactionService.create(transactionTo);

    return transactionTo;
  }



  getCategoryById(categoryId): Category {
    for (const key in this.globalData.categoryList) {
      if (Object.prototype.hasOwnProperty.call(this.globalData.categoryList, key)) {
        const category: Category = this.globalData.categoryList[key];
        if (category.categoryId == categoryId) {
          return category;
        }
      }
    }
    return null;
  }

  validateData(): boolean {
    // velidate the input
    let amountElement: any = document.getElementById("amount");
    let remarkElement: any = document.getElementById("remark");
    let transactionDateElement: any = document.getElementById("transactionDate");
    let transactionTimeElement: any = document.getElementById("transactionTime");
    let errorMessageElement = document.getElementById("errorMessage");

    errorMessageElement.innerHTML = "";

    try {
      let dateString : string = transactionDateElement.value;
      let timeString : string = transactionTimeElement.value;
      console.log(timeString);

      let tempDate = this.dateService.parse(dateString, this.dateFormat);
      let tempTimes = timeString.split(":");
      console.log(tempTimes);
      tempDate.setHours(
        parseInt(tempTimes[0]),
        parseInt(tempTimes[1]),
        parseInt(tempTimes[2]),
        0
      );
      console.log(tempDate.toISOString());
      this.transactionDate = tempDate;
    } catch (error) {
      console.log(error);
      errorMessageElement.innerHTML = "Date format was wrong!";
      return false;
    }

    try {
      if(amountElement.value == ""){
        this.amount = 0;
      }else{
        this.amount = parseFloat(amountElement.value);
      }
      if (isNaN(this.amount) == true) {
        errorMessageElement.innerHTML = "The amount must be numeric value!";
        this.amount = 0.0;
        return;
      }
    } catch (error) {
      console.log(error);
      this.amount = 0;
    }

    this.remark = remarkElement.value;

    if (this.transactionType == "Transfer") {
      if (this.accountIdFrom == this.accountIdTo) {
        errorMessageElement.innerHTML = "Can not transfer to the same account";
        return false;
      }
    }

    return true;
  }

  getCategoryListByTransactionType(transactionType): Category[] {
    let categoryList: Category[] = this.globalData.categoryList;
    let categoryFilterList: Category[] = [];
    for (const key in categoryList) {
      if (Object.prototype.hasOwnProperty.call(categoryList, key)) {
        const category = categoryList[key];
        if (category.transactionType == transactionType) {
          categoryFilterList.push(category);
        }
      }
    }
    return categoryFilterList;
  }

  selectCategoryId() {
    if (this.transaction == undefined) {
      if (this.categoryList.length > 0) {
        let category = this.categoryList[0];
        this.currentCategoryId = category.categoryId;
      }
    } else {
      let categoryId = this.getCategoryIdByName(this.transaction.category);
      if (categoryId == "") {
        if (this.categoryList.length > 0) {
          categoryId = this.categoryList[0].categoryId;
        }
      }
      this.currentCategoryId = categoryId;
    }
  }

  // Button Callback

  onYesClicked() {

    if (this.validateData() == true) {
      this.saveTransaction();
      if (this.onYesClickedCallback != undefined) {
        this.onYesClickedCallback(this.transaction);
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

  changeAccount(selectedAccountId) {
    console.log("selectedAccountId=" + selectedAccountId);
    this.currentAccountId = selectedAccountId;
  }

  fromAccount(selectedAccountId) {
    this.accountIdFrom = selectedAccountId;
  }

  toAccount(selectedAccountId) {
    this.accountIdTo = selectedAccountId;
  }

  changeCategory(selectedCategoryId) {
    console.log("selectedCategoryId=" + selectedCategoryId);
    this.currentCategoryId = selectedCategoryId;
  }

  onTypeIncomeClicked(type) {
    console.log(type);
    this.transactionType = type;
    this.categoryList = this.getCategoryListByTransactionType(this.transactionType);
    setTimeout(() => {
      this.selectCategoryId();
    }, 5);

    this.initTransactionTypeView();
  }
  onTypeExpenseClicked(type) {
    console.log(type);
    this.transactionType = type;
    this.categoryList = this.getCategoryListByTransactionType(this.transactionType);
    setTimeout(() => {
      this.selectCategoryId();
    }, 5);

    this.initTransactionTypeView();
  }
  onTypeTransferClicked(type) {
    console.log(type);
    this.transactionType = type;


    if (this.accountIdFrom == "") {
      if (this.accountList.length > 0) {
        let account = this.accountList[0];
        this.accountIdFrom = account.accountId;
        this.setElementValue("accountIdFrom", this.accountIdFrom);
      }
    }

    if (this.accountIdTo == "") {
      if (this.accountList.length > 0) {
        let account = this.accountList[0];
        this.accountIdTo = account.accountId;
        this.setElementValue("accountIdTo", this.accountIdTo);
      }
    }

    this.initTransactionTypeView();
  }

  setElementValue(id, value) {
    let element: any = document.getElementById(id);
    element.value = value;
    console.log(element);
  }
}
