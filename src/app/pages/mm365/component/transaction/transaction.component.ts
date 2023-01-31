import { Component, Input, OnInit } from '@angular/core';
import { NbDateService, NbDialogService } from '@nebular/theme';
import { DataAction } from 'app/constant/DataAction';
import { TableName } from 'app/constant/TableName';
import { TransactionType } from 'app/constant/TransactionType';
import { Transaction } from 'app/database/domain/Transaction';
import { DataSyncService } from 'app/database/service/DataSyncService';
import { TransactionService } from 'app/database/service/TransactionService';
import { TransferIds } from 'app/object/TransferIds';
import { DashboardAmountComponent } from 'app/pages/dashboard/dashboard-amount/dashboard-amount.component';
import { DashboardCategoryComponent } from 'app/pages/dashboard/dashboard-category/dashboard-category.component';
import { DashboardDateComponent } from 'app/pages/dashboard/dashboard-date/dashboard-date.component';
import { TransactionDialogComponent } from 'app/pages/dashboard/transaction-dialog/transaction-dialog.component';
import { LocalDataSource } from 'ng2-smart-table';
import { CategoryColumnColorComponent } from '../table-column/category-column-color/category-column-color';
import { ConfirmationDialogComponent } from '../../widget/confirmation-dialog/confirmation-dialog.component';
import { GlobalData } from 'app/model/GlobalData';


var transactionComponent:TransactionComponent;
@Component({
  selector: 'ngx-transaction-table',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

  @Input() transactionList: Transaction[] = [];


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
        filter:false,
        renderComponent:CategoryColumnColorComponent
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
  dateFormat: string = "yyyy-MM-dd HH:mm";


  constructor(
    public dateService: NbDateService<Date>,
    public dialogService: NbDialogService
  ) {
    console.log("TransactionComponent.constructor()");
    GlobalData.getInstance().transactionComponent = this;
    transactionComponent = this;
  }

  ngOnInit(): void {
    console.log("TransactionComponent.ngOnInit()");
    if(this.transactionList != undefined){
      this.source.load(this.transactionList);
    }
  }


  public updateData(transactionList: Transaction[]) {
    this.transactionList = transactionList;
    this.source.load(transactionList);
  }


  filterFuction(cell?: any, search?: string): boolean {
    // console.log(cell);
    // console.log("search=" + search);
    if (cell == "") {
      //console.log("cell empty");
      return false;
    }
    let dateString = transactionComponent.dateService.format(cell, transactionComponent.dateFormat);
    if (dateString.indexOf(search) >= 0) {
      return true;
    }

    return false;

  }



  deleteTransaction(targetTransaction: Transaction) {

    this.deleteAnotherTransaction(targetTransaction);

    // Delete the original Transaction
    TransactionService.delete(targetTransaction.transactionId, null, null);
    
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
}
