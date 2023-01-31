import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FunctionName } from 'app/constant/FunctionName';
import { HttpPost } from 'app/library/HttpPost';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';

var mobileLoginComponent:MobileLoginComponent = null;

@Component({
    selector: 'ngx-mobile-login',
    templateUrl: './mobile-login.component.html',
    styleUrls: ['./mobile-login.component.scss']
})
export class MobileLoginComponent implements OnInit {

    isShow: boolean = false;
    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;
    passcodeTimer: any = null;


    constructor(public router: Router) {
        mobileLoginComponent = this;
     }

    ngOnInit(): void {
        this.hideLoadingSpinner();
        this.globalData.localData.isSignInSuccess = false;
        this.initPasscodeCheckTimer();

    }

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        this.passwordFocus();
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this.destroyTimer();
    }





    checkPasscodeRequirement() {
        let httpPost: HttpPost = new HttpPost();
        httpPost.request(FunctionName.IS_PASSCODE_REQUIRED, "",
            (xmlHttp: XMLHttpRequest) => {
                let result = xmlHttp.responseText;
                let data = JSON.parse(result);
                if (data["isPasscodeRequired"] == "0") {
                    this.localData.isPasscodeRequired = false;
                    this.localData.passcode = "";
                    this.globalData.saveLocalData();
                    this.router.navigate(["/pages/dashboard"]);
                } else {
                    this.localData.isPasscodeRequired = true;
                    if (this.localData.passcode == data["passcode"]) {
                        this.globalData.saveLocalData();
                        this.router.navigate(["/pages/dashboard"]);
                    } else {
                        this.localData.passcode = "";
                        this.globalData.saveLocalData();
                    }
                }
            }, (xmlHttp: XMLHttpRequest) => {
                console.log(xmlHttp.responseText);
            });
    }

    initPasscodeCheckTimer() {
        if (this.passcodeTimer == null) {
            this.passcodeTimer = setInterval(this.onTimeOut, 3000);
        }
    }

    onTimeOut() {
        console.log("MobileLoginComponent.onTimeOut()");
        
        const httpPost: HttpPost = new HttpPost();
        httpPost.requestWithDataString(FunctionName.PASSCODE_CHECK, GlobalData.getInstance().localData.passcode,
            (xmlHttp: XMLHttpRequest) => {
                let result = xmlHttp.responseText;
                let globalData = GlobalData.getInstance();
                if(result == "1"){
                    globalData.localData.passcode = "";
                    globalData.localData.isPasscodeRequired = false;
                    globalData.saveLocalData();
                    mobileLoginComponent.router.navigate(["/pages/dashboard"]);
                }

                console.log("Passcode Result : " + result);
            },
            (xmlHttp: XMLHttpRequest) => {
                console.log(xmlHttp.responseText);
            });


    }

    destroyTimer() {
        if (this.passcodeTimer != null) {
            clearInterval(this.passcodeTimer);
            this.passcodeTimer = null;
        }
    }




    private passwordFocus() {
        let passwordElement: any = document.getElementById("password");
        setTimeout(() => {
            passwordElement.focus();
            let start = passwordElement.selectionStart;
            let end = passwordElement.selectionEnd;
            passwordElement.setSelectionRange(start, end);
        }, 1);
    }

    hideLoadingSpinner() {
        const el = document.getElementById('nb-global-spinner');
        if (el) {
            el.style['display'] = 'none';
        }
    }



    // Button Callback
    onShowClicked() {
        this.isShow = !this.isShow;
        this.passwordFocus();
    }


    onSignInSubmitClicked() {
        console.log("onSignInSubmitClicked()");
        let passwordElement: any = document.getElementById("password");
        let errorMessageElement = document.getElementById("errorMessage");
        errorMessageElement.style.color = "#EE3333";

        let password: string = passwordElement.value;
        password = password.trim();

        errorMessageElement.innerHTML = "";

        if (password == "") {
            errorMessageElement.innerHTML = "The Passcode can not be empty!"
            this.passwordFocus();
            return;
        }

        this.signInUser(password);

    }

    signInUser(password) {
        let errorMessageElement = document.getElementById("errorMessage");
        let buttonSubmit: any = document.getElementById("buttonSubmit");

        errorMessageElement.innerHTML = "Signing in...";
        errorMessageElement.style.color = "#333333";
        buttonSubmit.disabled = true;



        let httpPost: HttpPost = new HttpPost();
        httpPost.requestWithDataString(FunctionName.SIGN_IN, password,
            (xmlHttp: XMLHttpRequest) => {

                buttonSubmit.disabled = false;
                let result = xmlHttp.responseText;
                if (result == "1") {
                    this.localData.isSignInSuccess = true;
                    this.localData.passcode = password;
                    this.globalData.saveLocalData();
                    this.router.navigate(["/pages/dashboard"]);
                } else {
                    errorMessageElement.innerHTML = "The passcode not correct!";
                    errorMessageElement.style.color = "#EE3333";
                }
            }, (xmlHttp: XMLHttpRequest) => {
                buttonSubmit.disabled = false;
                console.log(xmlHttp.responseText);
                errorMessageElement.innerHTML = "Connection failed, please check the IP address or Port number, and make sure your device is turn on."
            });

    }
}
