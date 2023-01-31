import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogService, NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from 'app/pages/mm365/widget/confirmation-dialog/confirmation-dialog.component';
import { SendDataUtils } from 'app/library/SendDataUtils';
import { HttpPost } from 'app/library/HttpPost';
import { FunctionName } from 'app/constant/FunctionName';
import { HttpClient } from '@angular/common/http';
import { MySocket } from 'app/library/MySocket';

var headerComponent: HeaderComponent;

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  email: string = "";
  passcodeTimer: any = null;
  currentTheme = 'default';
  userMenu = [{ title: 'Profile' }, { title: 'Log out' }];
  totalSendData: number = 0;
  syncStatusTitle: string = "Sync Pending";
  isPasscodeRequired:boolean = false;
  globalData = GlobalData.getInstance();
  


  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
    // {
    //   value: 'material-light',
    //   name: 'Material Light',
    // },
    // {
    //   value: 'material-dark',
    //   name: 'Material Dark',
    // },

  ];

  


  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private layoutService: LayoutService,
    private breakpointService: NbMediaBreakpointsService,
    public router: Router,
    private dialogService: NbDialogService,
    public http: HttpClient
    ) {
  }

  ngOnInit() {
    console.log("HeaderComponent.ngOnInit()");
    headerComponent = this;
    this.currentTheme = this.themeService.currentTheme;
    GlobalData.getInstance().headerComponent = this;
    this.updateTotalSendData();
    this.getVip();
    this.initPasscodeCheckTimer();
    this.isPasscodeRequired = GlobalData.getInstance().localData.isPasscodeRequired;

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
    this.email = GlobalData.getInstance().localData.email;
    this.changeTheme(GlobalData.getInstance().localData.themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyTimer();
    GlobalData.getInstance().localData.signInDate = (new Date()).getTime();
    GlobalData.getInstance().saveLocalData();
  }



  initPasscodeCheckTimer() {
    if (this.passcodeTimer == null) {
      this.passcodeTimer = setInterval(this.onTimeOut, 3000);
    }
  }

  onTimeOut() {
    console.log("headerComponent.onTimeOut()");
    // if(GlobalData.getInstance().localData.isPasscodeRequired == true){
    //   GlobalData.getInstance().localData.signInDate = (new Date()).getTime();
    // }
    const httpPost: HttpPost = new HttpPost();
    httpPost.requestWithDataString(FunctionName.PASSCODE_CHECK, GlobalData.getInstance().localData.passcode,
      (xmlHttp: XMLHttpRequest) => {
        let result = xmlHttp.responseText;
        if (result == "0") {
          let globalData: GlobalData = GlobalData.getInstance();
          globalData.localData.isPasscodeRequired = true;
          globalData.localData.passcode = "";
          globalData.saveLocalData();
          headerComponent.router.navigate(["/sign-in"]);
        }
        if(GlobalData.getInstance().localData.passcode == "" && result == "1"){
          GlobalData.getInstance().localData.isPasscodeRequired = false;
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

  changeTheme(themeName: string) {
    GlobalData.getInstance().localData.themeName = themeName;
    GlobalData.getInstance().saveLocalData();
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    // this.menuService.navigateHome();
    return false;
  }

  updateTotalSendData() {
    this.totalSendData = GlobalData.getInstance().sendDataList.length;
    if (this.totalSendData > 0) {
      this.syncStatusTitle = "Sync Pending";
    }
  }

  updateStatusToSyncing() {
    this.syncStatusTitle = "Syncing...";
  }
  updateStatusToPending() {
    this.syncStatusTitle = "Sync Pending";
  }


  // On Button Callback
  onLogoutClick() {
    console.log("Logout");

    this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Sign Out',
        body: "Are you sure you want to sign out?",
        onYesClickedCallback: () => {
          console.log("Yes");
          this.logout();
        }
      },
    });
  }

  getVip(){
    let httpPost: HttpPost = new HttpPost();
    httpPost.requestWithDataString(FunctionName.GET_VIP, "",
      (xmlHttp: XMLHttpRequest) => {
        let result = xmlHttp.responseText;
        let vipCode = parseInt(result);
        GlobalData.getInstance().vipCode = vipCode;
      },
      (xmlHttp: XMLHttpRequest) => {
        console.log(xmlHttp.responseText);
      });
  }

  logout() {
    let globalData: GlobalData = GlobalData.getInstance();
    let localData: LocalData = globalData.localData;
    localData.signInDate = 0;
    localData.isSignInSuccess = false;
    localData.token = "";
    localData.passcode = "";
    globalData.saveLocalData();
    globalData.vipCode = 0;
    headerComponent.router.navigate(["/sign-in"]);
  }

  onSyncClicked() {
    this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Data Sync Pending (' + this.totalSendData + ")",
        body: "You have data pending for sync, please make sure your device is turn on and connectable!",
        onYesClickedCallback: () => {
          console.log("Yes");
          SendDataUtils.resend();
        },
        onMiddleClickedCallabck: () => {
          console.log("Middle");
          this.onButtonClearClicked();
        },
        buttonYesTitle: "Sync",
        buttonNoTitle: "Cancel",
        buttonMiddleTitle: "Clear",

        isButtonMiddleShow: true,
      },
    });

  }

  onButtonClearClicked() {
    this.dialogService.open(ConfirmationDialogComponent, {
      context: {
        title: 'Clear all Pending Data',
        body: "Are you sure you want to clear all the Pending Data without sync?",
        onYesClickedCallback: () => {
          console.log("Yes");
          GlobalData.getInstance().sendDataList = [];
          SendDataUtils.save();
          this.updateTotalSendData();
        }
      },
      closeOnBackdropClick: false,
    });
  }


}
