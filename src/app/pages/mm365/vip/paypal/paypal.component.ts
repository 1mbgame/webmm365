import { Component, Input, OnInit } from '@angular/core';
import { FunctionName } from 'app/constant/FunctionName';
import { HttpPost } from 'app/library/HttpPost';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';

declare const paypal: any;

var paypalComponent: PaypalComponent;

@Component({
    selector: 'ngx-paypal',
    templateUrl: './paypal.component.html',
    styleUrls: ['./paypal.component.scss']
})
export class PaypalComponent implements OnInit {

    @Input("amount") amount: number;
    @Input("vipCode") vipCode: number;

    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;



    constructor() { }

    ngOnInit(): void {
        paypalComponent = this;
    }

    ngAfterViewInit(): void {

        //let viewAmountShow = document.getElementById("amountShow");
        //viewAmountShow.innerHTML = "$ " + this.amount;

        this.initPaypal();

    }

    initPaypal() {
        paypal.Buttons({
            createOrder: function (data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            currency_code: 'USD',
                            value: paypalComponent.amount
                        },
                        application_context: {
                            shipping_preference: 'NO_SHIPPING'
                        },
                        shipping_type: 'PICKUP',
                        category:'DIGITAL_GOODS'
                    }]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (details) {
                    console.log("======= Detail ==========");
                    console.log(details);
                    console.log("===========================");
                    console.log(details.payer);
                    paypalComponent.purchaseVip();
                    //alert('Transaction completed by ' + details.payer.name.given_name);
                    //AndroidAPI.onApprove(JSON.stringify(details));

                });
            }
        }).render('#paypal-button-container'); // Display payment options on your web page
    }


    purchaseVip() {
        GlobalData.getInstance().vipCode = paypalComponent.vipCode;
        const httpPost: HttpPost = new HttpPost();
        httpPost.requestWithDataString(FunctionName.PURCHASE_VIP, paypalComponent.vipCode + "",
            (xmlHttp: XMLHttpRequest) => {
                
            }, (xmlHttp: XMLHttpRequest) => {
                console.log(xmlHttp.responseText);
            }, true);
    }



    // Button Callback
    onBackClicked() {
        this.globalData.vipComponent.isPaypalShow = false;
    }
}
