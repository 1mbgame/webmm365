import { Component, OnInit } from '@angular/core';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';


@Component({
    selector: 'ngx-vip',
    templateUrl: './vip.component.html',
    styleUrls: ['./vip.component.scss']
})
export class VipComponent implements OnInit {

    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;

    isPaypalShow : boolean = false;
    amount : number = 1;
    vipCode : number = 0;

    constructor() { 
        
    }

    ngOnInit(): void {
        this.globalData.vipComponent = this;
     }










    // Button Callback
    onVipClicked(vipCode){
        if(vipCode == "1"){
            this.amount = 1;
        }else if(vipCode == "2"){
            this.amount = 4.8;
        }else if(vipCode == "3"){
            this.amount = 6;
        }else if(vipCode == "4"){
            this.amount = 18;
        }
        this.isPaypalShow = true;
        this.vipCode = vipCode;
    }
    
}

