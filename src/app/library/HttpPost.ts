import { GlobalData } from "app/model/GlobalData";
import { SendDataUtils } from "./SendDataUtils";

export class HttpPost {
    
    private serverUrl = GlobalData.getInstance().serverUrl;
    private apiKey = GlobalData.getInstance().apiKey;


    public request(functionName, dataObject, successCallback, failureCallback, isDataSaveOnFailed: boolean = false) {

        const xmlHttp = new XMLHttpRequest();
        const url = this.serverUrl + functionName;
        const dataString = JSON.stringify(dataObject);

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                //console.log("Success : " + xmlHttp.responseText);
                if (successCallback != null) {
                    successCallback(xmlHttp);
                }
            } else if (xmlHttp.readyState == 4 && xmlHttp.status != 200) {
                //console.log("failure : " + xmlHttp.responseText);
                if (failureCallback != null) {
                    failureCallback(xmlHttp);
                }
                if (isDataSaveOnFailed == true) {
                    SendDataUtils.create(functionName, dataString);
                }
            }
        };

        

        xmlHttp.open("POST", url, true);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.setRequestHeader('api_key', this.apiKey);
        xmlHttp.send(dataString);

        console.log(dataString);


    }

    


    public requestWithDataString(functionName, dataString : string, successCallback, failureCallback, isDataSaveOnFailed: boolean = false) {

        const xmlHttp = new XMLHttpRequest();
        const url = this.serverUrl + functionName;

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                //console.log("Success : " + xmlHttp.responseText);
                if (successCallback != null) {
                    successCallback(xmlHttp);
                }
            } else if (xmlHttp.readyState == 4 && xmlHttp.status != 200) {
                //console.log("failure : " + xmlHttp.responseText);
                if (failureCallback != null) {
                    failureCallback(xmlHttp);
                }
                if (isDataSaveOnFailed == true) {
                    SendDataUtils.create(functionName, dataString);
                }
            }
        };

        

        xmlHttp.open("POST", url, true);
        //xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.setRequestHeader('api_key', this.apiKey);
        xmlHttp.send(dataString);
       
        console.log(dataString);
    }

}