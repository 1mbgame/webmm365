import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SaveKeys } from 'app/constant/SaveKeys';
import { HttpPost } from 'app/library/HttpPost';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';

import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    console.log("PagesComponent.constructor()");
  }

  ngOnInit(): void {
    console.log("PagesComponent.ngOnInit()");
    this.checkAuth();
  }

  menu = MENU_ITEMS;




  checkAuth() {

    let globalData: GlobalData = GlobalData.getInstance();
    let localData : LocalData = globalData.localData;
    if(localData.isPasscodeRequired == true){
      if(localData.isSignInSuccess == false){
        console.log("Jump to Login Page");
        this.router.navigate(["/sign-in"]);
      }else{
        let timeElapsed = ((new Date()).getTime()) - localData.signInDate;
        if(timeElapsed > 3600000){
          console.log("Sign In expire : Jump to Login Page");
          localData.signInDate = 0;
          globalData.saveLocalData();
          this.router.navigate(["/sign-in"]);
        }
      }
    }else{
      console.log("User already login");
      //this.router.navigate(["/pages/dashboard"]);
    }
  }
}
