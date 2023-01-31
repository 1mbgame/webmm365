import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { SaveKeys } from 'app/constant/SaveKeys';
import { MyUtils } from 'app/library/MyUtils';
import { MultiORM } from 'app/library/simpleORM/MultiORM';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { Account } from 'app/database/domain/Account';
import { HttpPost } from '../../../../library/HttpPost';
import { TableName } from 'app/constant/TableName';



var loginComponent: LoginComponent;

@Component({
  selector: 'ngx-export',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //@ViewChild("password") passwordElem: ElementRef;

  constructor(public router: Router) { }


  multiORM: MultiORM = MultiORM.getInstance();
  isShow: boolean = false;
  isSignIn: boolean = true;

  ngOnInit(): void {
    console.log("LoginComponent.ngOnInit()");
    this.hideLoadingSpinner()
    loginComponent = this;

  }

  ngAfterViewInit() {
    console.log("LoginComponent.ngAfterViewInit()");
    this.initEmail();
  }

  hideLoadingSpinner() {
    const el = document.getElementById('nb-global-spinner');
    if (el) {
      el.style['display'] = 'none';
    }
  }

  initEmail() {
    setTimeout(() => {
      let email = GlobalData.getInstance().localData.email;
      if (email == "") {
        this.emailFocus();
      } else {
        this.passwordFocus();
      }
      let emailElement: any = document.getElementById("email");
      emailElement.value = email;
    }, 5);
  }

  onShowClicked() {
    this.isShow = !this.isShow;
    this.passwordFocus();
  }

  onSignUpClicked() {
    this.isSignIn = false;
    this.initEmail();
  }

  onSignInClicked() {
    this.isSignIn = true;
    this.initEmail();
  }

  onSignInSubmitClicked() {

    let emailElement: any = document.getElementById("email");
    let errorMessageElement = document.getElementById("errorMessage");
    errorMessageElement.style.color = "#EE3333";

    let email = emailElement.value;
    if (email == "") {
      console.log("email is empty");
      errorMessageElement.innerHTML = "The email can not be empty"
      this.emailFocus();
      return;
    }

    GlobalData.getInstance().localData.email = email;
    GlobalData.getInstance().saveLocalData();


    let passwordElement: any = document.getElementById("password");
    let password = passwordElement.value;
    if (password == "") {
      errorMessageElement.innerHTML = "The password can not be empty"
      this.passwordFocus();
      return;
    }

    errorMessageElement.innerHTML = "";


    this.signInUser(email, password);

  }

  onSignUpSubmitClicked() {

    let emailElement: any = document.getElementById("email");
    let errorMessageElement = document.getElementById("errorMessage");
    errorMessageElement.style.color = "#EE3333";

    let email = emailElement.value;
    if (email == "") {
      console.log("email is empty");
      errorMessageElement.innerHTML = "The email can not be empty"
      this.emailFocus();
      return;
    }

    GlobalData.getInstance().localData.email = email;
    GlobalData.getInstance().saveLocalData();


    let passwordElement: any = document.getElementById("password");
    let password = passwordElement.value;
    if (password == "") {
      errorMessageElement.innerHTML = "The password can not be empty"
      this.passwordFocus();
      return;
    }

    errorMessageElement.innerHTML = "";


    this.signUpUser(email, password);

  }

  public signInUser(email, password) {

    let errorMessageElement = document.getElementById("errorMessage");
    let buttonSubmit :any = document.getElementById("buttonSubmit");
    
    errorMessageElement.innerHTML = "Signing in...";
    errorMessageElement.style.color = "#333333";
    buttonSubmit.disabled = true;

    let httpLogin = {
      "email": email,
      "password": password
    }

    let httpPost: HttpPost = new HttpPost();
    httpPost.request("/web/login", httpLogin, (result) => {
      buttonSubmit.disabled = false;
      console.log(result);
      if (result == "") {
        errorMessageElement.innerHTML = "The email or password not correct";
        return;
      }

      let data = JSON.parse(result);

      let token = data["token"];
      let userId = data["userId"];
      let vip = data["vip"];
      let vipExpiryDate = data["vipExpiryDate"];
      let isDefaultFormat = data["isDefaultFormat"];
      let exportFormat = data["exportFormat"];

      let localData: LocalData = GlobalData.getInstance().localData;
      localData.email = email;
      localData.token = token;
      localData.userId = userId;
      localData.isDefaultFormat = isDefaultFormat;
      localData.exportFormat = exportFormat;

      GlobalData.getInstance().saveLocalData();

      loginComponent.router.navigate(["/pages/dashboard"]);

    }, (error) => {
      buttonSubmit.disabled = false;
      console.log(error);
    });

  }

  public signUpUser(email, password) {

    let errorMessageElement = document.getElementById("errorMessage");
    let buttonSubmit :any = document.getElementById("buttonSubmit");

    errorMessageElement.innerHTML = "Signing up...";
    errorMessageElement.style.color = "#333333";
    buttonSubmit.disabled = true;
    
    let httpRegistration: any = {
      "deviceId": "",
      "user": {
        "email": email,
        "password": password
      },
      "platform": "WEB",
      "deviceToken": ""
    };

    let httpPost: HttpPost = new HttpPost();
    httpPost.request("/web/register-user", httpRegistration,
      (result) => {
        
        let data = JSON.parse(result);

        let status = data["status"];
        let token = data["token"];
        let userId = data["userId"];
        let vip = data["vip"];
        let vipExpiryDate = data["vipExpiryDate"];

        if (status < 0) {
          errorMessageElement.innerHTML = "The email has been taken.";
          return;
        }
        let localData: LocalData = GlobalData.getInstance().localData;
        localData.email = email;
        localData.token = token;
        localData.userId = userId;
        localData.isDefaultFormat = true;
        localData.exportFormat = "dd/MM/yy";
        GlobalData.getInstance().saveLocalData();

        console.log(result);
        
        loginComponent.createDefaultAccount();

      }, (error) => {
        buttonSubmit.disabled = false;
        console.log(error);
        errorMessageElement.innerHTML = "Connection failure, please try later";
      });

  }

  private createDefaultAccount(){

    let globalData : GlobalData = GlobalData.getInstance();
    let localData : LocalData = GlobalData.getInstance().localData;
    let account : Account = new Account();
    account.createdAt = (new Date()).getTime();
    account.updatedAt = account.createdAt;
    account.currencyCode = "USD";
    account.currencyCountry = "";
    account.currencySymbol = "";
    account.decimal = 2;
    account.isAutoSelected = true;
    account.isShared = false;
    account.name = "Cash";
    account.accountId = "Cash";

    this.multiORM.newQuery("insert")
    .table(TableName.Account)
    .insert(account);

    globalData.localData.selectedAccountId = account.accountId;
    let buttonSubmit :any = document.getElementById("buttonSubmit");

    this.multiORM.callWebAPI(()=>{
      buttonSubmit.disabled = false;
      loginComponent.router.navigate(["/pages/dashboard"]);
    }, (xmlHttp:XMLHttpRequest)=>{
      buttonSubmit.disabled = false;
      console.log(xmlHttp.responseText);
    })
  }

  private emailFocus() {
    let emailElement: any = document.getElementById("email");
    setTimeout(() => {
      emailElement.setAttribute("type", "text");
      emailElement.focus();
      let start = emailElement.selectionStart;
      let end = emailElement.selectionEnd;
      emailElement.setSelectionRange(start, end);
      emailElement.setAttribute("type", "email");
    }, 1);
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

}
