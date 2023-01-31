import { ElementRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NbDateService,NbDialogService } from '@nebular/theme';
import { DataAction } from 'app/constant/DataAction';
import { TableName } from 'app/constant/TableName';
import { TransactionType } from 'app/constant/TransactionType';
import { Account } from 'app/database/domain/Account';
import { Transaction } from 'app/database/domain/Transaction';
import { AccountService } from 'app/database/service/AccountService';
import { DataSyncService } from 'app/database/service/DataSyncService';
import { TransactionService } from 'app/database/service/TransactionService';
import { UserService } from 'app/database/service/UserService';
import { MyFile } from 'app/library/MyFile';
import { MyUtils } from 'app/library/MyUtils';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { VipDialogComponent } from '../component/vip-dialog/vip-dialog.component';

@Component({
  selector: 'ngx-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {

  @ViewChild("viewStartDate") viewStartDate: ElementRef;
  @ViewChild("viewEndDate") viewEndDate: ElementRef;
  @ViewChild("inputDateFormat") inputDateFormat: ElementRef;

  globalData: GlobalData = GlobalData.getInstance();
  localData: LocalData = GlobalData.getInstance().localData;

  dateFormat: string = "MMM d, yyyy";
  accountList: Account[] = [];
  selectedAccountIdList: string[] = [];
  isLoading: boolean = false;
  startDate: Date;
  endDate: Date;
  transactionType: string = "All";
  isExportDateFormatView: boolean = false;
  dateFormatPreview; string = "";

  constructor(
    protected dateService: NbDateService<Date>,
    private dialogService: NbDialogService,
        public router: Router
  ) {
    this.accountList = GlobalData.getInstance().accountList;
    this.downloadData();
    this.initData();
  }

  ngOnInit(): void {


  }

  ngAfterViewInit(): void {
    this.updateDateRange();
  }

  downloadData() {

    if (this.accountList.length > 0) {
      for (const key in this.accountList) {
        if (Object.prototype.hasOwnProperty.call(this.accountList, key)) {
          const account = this.accountList[key];
          this.selectedAccountIdList.push(account.accountId);
        }
      }
      return;
    }
    this.isLoading = true;
    AccountService.downloadAccountList((xmlHttp: XMLHttpRequest) => {
      this.isLoading = false;
      let data = JSON.parse(xmlHttp.responseText);
      let accountList = data["accountList"];
      if (accountList == null) {
        this.accountList = [];
        this.selectedAccountIdList = [];
        this.globalData.initAccountList(this.accountList);
        return;
      }
      this.accountList = accountList;
      this.globalData.initAccountList(this.accountList);
      for (const key in this.accountList) {
        if (Object.prototype.hasOwnProperty.call(this.accountList, key)) {
          const account = this.accountList[key];
          this.selectedAccountIdList.push(account.accountId);
        }
      }
    }, (xmlHttp: XMLHttpRequest) => {
      this.isLoading = false;
      console.log(xmlHttp.responseText);
    });


  }


  initData() {
    let currentDate = new Date();
    this.startDate = MyUtils.getMonthStart(currentDate);
    this.endDate = MyUtils.getMonthEnd(currentDate);
  }

  updateDateRange() {
    this.viewStartDate.nativeElement.value = this.dateService.format(this.startDate, this.dateFormat);
    this.viewEndDate.nativeElement.value = this.dateService.format(this.endDate, this.dateFormat);
  }


  validateData(): boolean {
    try {
      let startDateString = this.viewStartDate.nativeElement.value;
      let endDateString = this.viewEndDate.nativeElement.value;

      let startDate = this.dateService.parse(startDateString, this.dateFormat);
      let endDate = this.dateService.parse(endDateString, this.dateFormat);

      console.log(startDate);
      this.startDate = startDate;
      this.endDate = endDate;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  downloadExportData() {
    this.isLoading = true;
    TransactionService.exportData(
      this.selectedAccountIdList,
      this.transactionType,
      this.startDate, this.
      endDate, (xmlHttp: XMLHttpRequest) => {
        this.isLoading = false;
        let data = JSON.parse(xmlHttp.responseText);
        let transactionList = data["exportData"];
        if (transactionList == null) {
          return;
        }
        
        
        this.exportData(transactionList);
      }, (xmlHttp: XMLHttpRequest) => {
        this.isLoading = false;
        console.log(xmlHttp.responseText);
      });
  }

  exportData(transactionList: Transaction[]) {
    let fileContent = "";
    let exportFormat = "";
    if (this.localData.isDefaultFormat) {
      exportFormat = "dd/MM/yy"
    } else {
      exportFormat = this.localData.exportFormat;
    }
    let header = "\"Account\",\"Currency Code\",\"Date(" + exportFormat + ")\",\"Expense/Income\",\"Category\",\"Amount\",\"Remark\",\"Created By\"\n";

    fileContent += header;
    let totalRecord = 0;
    for (const key in transactionList) {
      if (Object.prototype.hasOwnProperty.call(transactionList, key)) {
        const transaction = transactionList[key];
        let account = this.globalData.accountMap.get(transaction.accountId);
        if (account == undefined) {
          continue;
        }
        let transactionDate : Date = new Date(transaction.transactionDate);
        fileContent += "\"" + account.name + "\",";
        fileContent += "\"" + account.currencyCode + "\",";
        fileContent += "\"" + this.dateService.format(transactionDate, exportFormat) + "\",";
        fileContent += "\"" + transaction.type + "\",";
        fileContent += "\"" + transaction.category + "\",";
        fileContent += "\"" + transaction.amount + "\",";
        fileContent += "\"" + transaction.remark + "\",";
        fileContent += "\"" + transaction.createdBy + "\",";
        fileContent += "\n";

        totalRecord += 1;
      }
    }

    let fileDateFormat = "yyyy_MM_dd";
    let filename = "money_manager_export_" + this.dateService.format(new Date(), fileDateFormat) + ".csv";
    MyFile.downloadFile(filename, fileContent);

  }




  // Button Callback
  onExportDateFormatClicked() {

  //   if (this.globalData.vipCode <= 0) {
  //     this.dialogService.open(VipDialogComponent, {
  //         context: {
  //             onYesClickedCallback: () => {
  //                 this.router.navigate(["/pages/mm365/vip"]);
  //             }
  //         },
  //         closeOnBackdropClick: false,
  //     });    
  //     return;
  // }




    // store the start date and end date
    let startDateString = this.viewStartDate.nativeElement.value;
    let endDateString = this.viewEndDate.nativeElement.value;

    let startDate = this.dateService.parse(startDateString, this.dateFormat);
    let endDate = this.dateService.parse(endDateString, this.dateFormat);

    console.log(startDate);
    this.startDate = startDate;
    this.endDate = endDate;

    // Display the date format change
    this.isExportDateFormatView = !this.isExportDateFormatView;
    if (this.isExportDateFormatView == true) {
      setTimeout(() => {
        this.inputDateFormat.nativeElement.value = this.localData.exportFormat;
        this.dateFormatPreview = this.dateService.format(new Date(), this.localData.exportFormat);
      }, 10);

    }
  }

  onInputDateFormatChanged(e) {
    console.log(e.target.value);
    let dateFormat = e.target.value;
    this.dateFormatPreview = this.dateService.format(new Date(), dateFormat);
  }

  onExportClicked() {
    if (this.validateData() == true) {
      this.downloadExportData();
    }
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

  onTypeIncomeClicked(type) {
    console.log(type);
    this.transactionType = type;

  }

  onTypeExpenseClicked(type) {
    console.log(type);
    this.transactionType = type;

  }

  onTypeAllClicked(type) {
    console.log(type);
    this.transactionType = type;
  }

  onExportDateFormatSaveClicked() {
    this.isExportDateFormatView = !this.isExportDateFormatView;
    setTimeout(() => {
      this.updateDateRange();
    }, 10);

    let inputDateFormat = this.inputDateFormat.nativeElement.value;
    this.localData.exportFormat = inputDateFormat;
    this.localData.isDefaultFormat = false;

    this.globalData.saveLocalData();

    UserService.updateExportDateFormat(this.localData.isDefaultFormat, this.localData.exportFormat);

  }

  onDefaultClicked(){

    let dateFormat = "dd/MM/yyyy";
    
    // Update the Label
    this.inputDateFormat.nativeElement.value = dateFormat;
    this.dateFormatPreview = this.dateService.format(new Date(), dateFormat);

    // Update the local data
    this.localData.exportFormat = dateFormat
    this.localData.isDefaultFormat = false;
    this.globalData.saveLocalData();

    // Update the mobile data
    UserService.updateExportDateFormat(this.localData.isDefaultFormat, this.localData.exportFormat);

  }

  onExportDateFormatCancelClicked() {
    this.isExportDateFormatView = !this.isExportDateFormatView;
    setTimeout(() => {
      this.updateDateRange();
    }, 10);
  }

  onButtonTakeClicked(dateFormat:string){
    console.log(dateFormat);
    this.inputDateFormat.nativeElement.value = dateFormat;
    this.dateFormatPreview = this.dateService.format(new Date(), dateFormat);
  }


}





