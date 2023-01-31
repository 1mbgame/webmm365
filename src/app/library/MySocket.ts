import { GlobalData } from "app/model/GlobalData";

export class MySocket {

    private static _instance: MySocket = new MySocket();

    public static getInstance(): MySocket {
        return MySocket._instance;
    }


    WebSocketTest() {

        // if ("WebSocket" in window) {
        //     console.log("WebSocket is supported by your Browser!");

        //     // Let us open a web socket
        //     var ws = new WebSocket("ws://" + GlobalData.getInstance().socketUrl);

        //     ws.onopen = function () {

        //         // Web Socket is connected, send data using send()
        //         ws.send("Message to send");
        //         alert("Message is sent...");
        //     };

        //     ws.onmessage = function (evt) {
        //         var received_msg = evt.data;
        //         alert("Message is received...");
        //     };

        //     ws.onerror = function (event:Event) {
        //         console.log(event);
        //     }

        //     ws.onclose = function () {

        //         // websocket is closed.
        //         alert("Connection is closed...");
        //     };
        // } else {

        //     // The browser doesn't support WebSocket
        //     alert("WebSocket NOT supported by your Browser!");
        // }

    }

}