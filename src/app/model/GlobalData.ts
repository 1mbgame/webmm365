import { Platform } from "app/constant/Platform";
import { SaveKeys } from "app/constant/SaveKeys";
import { MyUtils } from "app/library/MyUtils";
import { Account } from "app/database/domain/Account";
import { DashboardComponent } from "app/pages/dashboard/dashboard.component";
import { DashboardSetting } from "./DashboardSetting";
import { LocalData } from "./LocalData";
import { Budget } from "app/database/domain/Budget";
import { CategoryPieComponent } from "app/pages/mm365/component/category-pie.component";
import { ChartTableComponent } from "app/pages/mm365/component/chart-table/chart-table.component";
import { TransactionComponent } from "app/pages/mm365/component/transaction/transaction.component";
import { CategoryChartComponent } from "app/pages/mm365/chart/category-chart/category-chart.component";
import { Category } from "app/database/domain/Category";
import { Currency } from "app/database/domain/Currency";
import { ChartjsLineComponent } from "app/pages/mm365/component/chartjs-line.component";
import { VipComponent } from "app/pages/mm365/vip/vip.component";
import { SendData } from "app/object/SendData";
import { HeaderComponent } from "app/@theme/components";

export class GlobalData {
    private static _instance: GlobalData = new GlobalData();
    //public static instance : GlobalData = GlobalData._instance;
    public static getInstance(): GlobalData {
        return GlobalData._instance;
    }

    serverUrl : string = window.location.origin;
    //serverUrl : string = "http://192.168.8.159:6863";
    //serverUrl : string = "http://127.0.0.1:6863";


    

    apiKey : string = "4F72109D-1B16-460F-B0B9-62AB9D1DB9DE";
    platform:string = Platform.ANDROID;



    localData: LocalData;
    
    accountList  : Account[]  = [];
    categoryList : Category[] = [];
    currencyList : Currency[] = [];
    budgetList   : Budget[]   = [];
    accountMap   : Map<string,Account> = new Map();
    sendDataList : SendData[] = [];
    
    decimalPlaces : number = 2;
    vipCode : number = 0;
    

    // Components
    dashboardSetting     : DashboardSetting;
    dashboardComponent   : DashboardComponent;
    categoryPieComponent : CategoryPieComponent;
    chartTableComponent  : ChartTableComponent;
    transactionComponent : TransactionComponent;
    chartjsLineComponent : ChartjsLineComponent;
    vipComponent         : VipComponent;
    headerComponent      : HeaderComponent;
    

    public initLocalData() {
        let localDataString = localStorage.getItem(SaveKeys.localData);
        let globalData : GlobalData = GlobalData.getInstance();
        if (localDataString == undefined || localDataString == null) {
            globalData.localData = new LocalData();
            globalData.initValue(globalData.localData);
            localStorage.setItem(SaveKeys.localData, JSON.stringify(globalData.localData));
        } else {
            try {
                globalData.localData = JSON.parse(localDataString);
                globalData.initValue(globalData.localData);
            } catch (error) {
                console.log(error);
                globalData.localData = new LocalData();
                globalData.initValue(globalData.localData);
                localStorage.setItem(SaveKeys.localData, JSON.stringify(globalData.localData));
            }
        }
    }

    public saveLocalData(){
        let localDataString = JSON.stringify(GlobalData.getInstance().localData);
        localStorage.setItem(SaveKeys.localData,localDataString);
    }

    public initAccountList(accounts:Account[]){
        this.accountList = accounts;
        this.accountMap.clear();
        for (const key in accounts) {
            if (Object.prototype.hasOwnProperty.call(accounts, key)) {
                const account : Account = accounts[key];
                this.accountMap.set(account.accountId,account);
            }
        }
    }

    public initValue(localData : LocalData){
        if(localData.email == undefined || localData.email == null){
            localData.email = "";
        }
    
        if(localData.token == undefined || localData.token == null){
            localData.token = "";
        }
    
        if(localData.userId == undefined || localData.userId == null){
            localData.userId = "";
        }
    
        if(localData.themeName == undefined || localData.themeName == null){
            localData.themeName = "dark";
        }

        if(localData.selectedAccountId == undefined || localData.selectedAccountId == null){
            localData.selectedAccountId = "dark";
        }



        if(localData.isDefaultFormat == undefined || localData.isDefaultFormat == null){
            localData.isDefaultFormat = false;
        }
        if(localData.exportFormat == undefined || localData.exportFormat == null){
            localData.exportFormat = "dd/MM/yy h:mm a";
        }

        if(localData.isPasscodeRequired == undefined || localData.isPasscodeRequired == null){
            localData.isPasscodeRequired = false;
        }

        if(localData.passcode == undefined || localData.passcode == null){
            localData.passcode = "";
        }

        if(localData.isSignInSuccess == undefined || localData.isSignInSuccess == null){
            localData.isSignInSuccess = false;
        }

        if(localData.signInDate == undefined || localData.signInDate == null){
            localData.signInDate = 0;
        }
       
        
        
        
    }
}