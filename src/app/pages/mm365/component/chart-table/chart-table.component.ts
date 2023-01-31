import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { GlobalData } from 'app/model/GlobalData';
import { ChartRowData } from 'app/object/ChartRowData';
import { DashboardAmountComponent } from 'app/pages/dashboard/dashboard-amount/dashboard-amount.component';
import { LocalDataSource } from 'ng2-smart-table';
import { CategoryColumnColorComponent } from '../table-column/category-column-color/category-column-color';

@Component({
    selector: 'ngx-chart-table',
    templateUrl: './chart-table.component.html',
    styleUrls: ['./chart-table.component.scss']
})
export class ChartTableComponent implements OnInit {

    @Input() chartRowDataList:ChartRowData[];

    settings = {
        pager: {
            perPage: 100,
        },
        mode: "external",
        //actions: false,
        actions: {
            delete: false,
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
            color: {
                title: 'Color',
                type: 'custom',
                width: '30px',
                filter: false,
                renderComponent: CategoryColumnColorComponent
            },
            name: {
                title: 'Name',
                type: 'string'
            },
            value: {
                title: 'Amount',
                type: 'custom',
                renderComponent: DashboardAmountComponent
            },
            totalTransaction: {
                title: 'Trans.',
                type: 'number'
            }
        },
    };

    onEditClickedCallback: any;
    source: LocalDataSource = new LocalDataSource();


    constructor() {
        console.log("ChartTableComponent.constructor()");
        GlobalData.getInstance().chartTableComponent = this;
    }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        if(this.chartRowDataList != undefined){
            this.source.load(this.chartRowDataList);
        }

       
    }



    public updateData(chartRowDataList: ChartRowData[]) {
        this.chartRowDataList = chartRowDataList;
        this.source.load(chartRowDataList);
    }




    // Button Callback
    onDeleteClicked(event) {
        console.log(event);
        //const budget: Budget = event.data;
        // this.dialogService.open(ConfirmationDialogComponent, {
        //     context: {
        //         title: 'Delete',
        //         body: "Are you sure you want to delete this budget? [Note : Delete budget would not delete the transaction]",
        //         onYesClickedCallback: () => {
        //             console.log("Yes");
        //             this.removeBudgetFromList(budget.budget_id);
        //             BudgetService.delete(budget);
        //             this.source.load(this.budgetList);
        //         }
        //     },
        // });

    }

    onEditClicked(event) {
        console.log(event);
        if (this.onEditClickedCallback != undefined) {
            this.onEditClickedCallback(event);
        }
    }


}
