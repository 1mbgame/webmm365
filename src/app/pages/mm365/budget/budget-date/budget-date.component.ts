import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NbDateService } from '@nebular/theme';
import { Budget } from 'app/database/domain/Budget';
import { MyUtils } from 'app/library/MyUtils';

@Component({
    selector: 'ngx-budget-date',
    templateUrl: './budget-date.component.html',
    styleUrls: ['./budget-date.component.scss']
})
export class BudgetDateComponent implements OnInit {

    @Input() value: string;
    @Input() rowData: Budget;

    dateFormat: string = "MMM d, yyyy";
    startDate: Date;
    endDate: Date;
    displayValue: String = "";

    constructor(
        protected dateService: NbDateService<Date>
    ) { }

    ngOnInit(): void { 
        
        this.startDate = new Date(this.rowData.startDate);
        this.endDate = new Date(this.rowData.endDate);
        this.updateDateRange();
    }

    ngAfterViewInit(): void {
        //console.log(this.rowData);
        
    }

    updateDateRange() {
        let rangeStart = this.dateService.format(this.startDate, this.dateFormat);
        let rangeEnd = this.dateService.format(this.endDate, this.dateFormat);
        this.displayValue = rangeStart + " - " + rangeEnd;
    }
}
