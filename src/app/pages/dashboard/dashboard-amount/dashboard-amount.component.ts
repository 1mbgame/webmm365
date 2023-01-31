import { Component, Input } from "@angular/core";
import { OnInit } from "@angular/core";
import { TransactionType } from "app/constant/TransactionType";
import { MyUtils } from "app/library/MyUtils";
import { GlobalData } from "app/model/GlobalData";

@Component({
    selector: 'ngx-dashboard-amount',
    templateUrl: 'dashboard-amount.component.html',
    styleUrls: ['dashboard-amount.component.css'],
  })
  export class DashboardAmountComponent implements OnInit {


    renderValue: string;

    @Input() value: number;
    @Input() rowData: any;

    displayValue : String = "";
  
    ngOnInit(): void {
        //console.log("DashboardCategoryComponent.ngOnInit()");
        if(this.rowData.type == TransactionType.EXPENSE && this.value > 0){
          this.displayValue = "-" + this.value.toFixed(GlobalData.getInstance().decimalPlaces);
        }else{
          this.displayValue = this.value.toFixed(GlobalData.getInstance().decimalPlaces);
        }
        
    }

    

  }