import { SaveKeys } from "app/constant/SaveKeys";
import { GlobalData } from "app/model/GlobalData";
import { SendData } from "app/object/SendData";
import { MyUtils } from "./MyUtils";

export class SendDataUtils {

    public static create(functionName: string, dataString: string) {
        let sendData: SendData = new SendData();

        sendData.id = MyUtils.generateUniqueDeviceId();
        sendData.functionName = functionName;
        sendData.method = "POST";
        sendData.dataString = dataString;

        GlobalData.getInstance().sendDataList.push(sendData);
        GlobalData.getInstance().headerComponent.updateTotalSendData();

        this.save();
    }

    public static deleteSendData(id: string) {

        let sendDataList = GlobalData.getInstance().sendDataList;
        if (sendDataList.length <= 0) {
            return;
        }

        let i = 0;
        for (const key in sendDataList) {
            if (Object.prototype.hasOwnProperty.call(sendDataList, key)) {
                const sendData = sendDataList[key];
                if (sendData.id == id) {
                    break;
                }
            }
            i += 1;
        }

        sendDataList.splice(i, 1);
        GlobalData.getInstance().headerComponent.updateTotalSendData();

        SendDataUtils.save();
    }

    public static save() {
        localStorage.setItem(SaveKeys.sendDataList, JSON.stringify(
            GlobalData.getInstance().sendDataList
        ));
    }

    public static loadData() {
        try {
            let sendDataListString: string = localStorage.getItem(SaveKeys.sendDataList);
            let sendDataList: SendData[] = [];
            if (sendDataListString == undefined) {
                sendDataList = [];
                localStorage.setItem(SaveKeys.sendDataList, JSON.stringify(sendDataList));
            } else {
                sendDataList = JSON.parse(sendDataListString);
            }
            GlobalData.getInstance().sendDataList = sendDataList;
        } catch (error) {
            console.log(error);
            localStorage.setItem(SaveKeys.sendDataList, JSON.stringify([]));
            GlobalData.getInstance().sendDataList = [];
        }

    }

    public static resend() {

        let globalData = GlobalData.getInstance();

        if (globalData.sendDataList.length <= 0) {
            console.log("No Data to sync");
            return;
        }

        console.log("Total Data to sync :"+globalData.sendDataList.length);

        
       
        for (const key in globalData.sendDataList) {
            if (Object.prototype.hasOwnProperty.call(globalData.sendDataList, key)) {
                
                
                const sendData: SendData = globalData.sendDataList[key];
                const url = globalData.serverUrl + sendData.functionName;

                const xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                        console.log("Success : " + xmlHttp.responseText);
                        //SendDataUtils.deleteSendData(sendData.id);
                        globalData.headerComponent.updateTotalSendData();
                    } else if (xmlHttp.readyState == 4 && xmlHttp.status != 200) {
                        console.log("failure : " + xmlHttp.responseText);
                        globalData.sendDataList.push(sendData);
                        globalData.headerComponent.updateTotalSendData();
                        SendDataUtils.save();
                    }
                };
                xmlHttp.open(sendData.method, url, true);
                xmlHttp.setRequestHeader("Content-Type", "application/json")
                xmlHttp.setRequestHeader('api_key', globalData.apiKey);
                xmlHttp.send(sendData.dataString);

               
            }
        }

        globalData.sendDataList = [];
        globalData.headerComponent.updateStatusToSyncing();

        SendDataUtils.save();
    }



}