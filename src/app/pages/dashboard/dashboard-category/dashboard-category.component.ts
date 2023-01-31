import { Component, Input } from "@angular/core";
import { OnInit } from "@angular/core";
import { MyUtils } from "app/library/MyUtils";

@Component({
    selector: 'ngx-dashboard-category',
    templateUrl: 'dashboard-category.component.html',
    styleUrls: [],
  })
  export class DashboardCategoryComponent implements OnInit {


    renderValue: string;

    @Input() value: string;
    @Input() rowData: any;

    displayCategory : String = "";
  
    ngOnInit(): void {
        //console.log("DashboardCategoryComponent.ngOnInit()");
        if(this.value.indexOf("->") > 0){
          this.displayCategory = this.value.replace("->","\u2794");
        }else{
          this.displayCategory = this.value;
        }
    }

    

  }