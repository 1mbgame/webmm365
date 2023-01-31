import { Component, Input } from "@angular/core";
import { OnInit } from "@angular/core";
import { NbDateService } from "@nebular/theme";
import { MyUtils } from "app/library/MyUtils";

@Component({
    selector: 'ngx-dashboard-date',
    templateUrl: 'dashboard-date.component.html',
    styleUrls: [],
  })
  export class DashboardDateComponent implements OnInit {


    renderValue: string;

    @Input() value: string;
    @Input() rowData: any;

    //dateFormat : string = "MMM,d yyyy hh:mm a";
    dateFormat : string = "yyyy-MM-dd HH:mm";
    displayDate : String = "";

    constructor(
      private dateService: NbDateService<Date>,
    ){

    }
  
    ngOnInit(): void {
        //console.log("DashboardDateComponent.ngOnInit()");
        
        let localDate = new Date(this.value);
        this.displayDate = this.dateService.format(localDate, this.dateFormat);
    }

    ngAfterViewInit() {

    }
    

  }