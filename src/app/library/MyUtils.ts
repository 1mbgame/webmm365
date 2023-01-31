
export class MyUtils {

    constructor(

    ) { }

    /**
     * mysqlDatetimeToJavascriptDateObject
     */
    public static mysqlDatetimeToJavascriptDateObject(mySQLDatetime: string): Date {
        //let mySQLDate: string = '2015-04-29 10:29:08';

        //return new Date(Date.parse(mySQLDatetime.replace('-', '/')));

        // Split timestamp into [ Y, M, D, h, m, s ]
        var t: string[] = mySQLDatetime.split(/[- :]/);

        // Apply each element to the Date function
        var d = new Date(Date.UTC(
            parseInt(t[0]),
            parseInt(t[1]) - 1,
            parseInt(t[2]),
            parseInt(t[3]),
            parseInt(t[4]),
            parseInt(t[5]),
            1));
        return d;

    }

    public static dateToMysqlDatetime(date) :string{
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }

    public static sortMapObject(dataMap, targetKey, isAscOrder):any{
        if(isAscOrder == false){
            const mapSort1 = new Map([...dataMap.entries()].sort((a, b) => b[targetKey] - a[targetKey]));
            return mapSort1;
        }else{
            const mapSort1 = new Map([...dataMap.entries()].sort((a, b) => b[targetKey] - a[targetKey]));
            return mapSort1;
        }
        return dataMap;
    }

    public static sortObjectList(datas, targetKey, isAscOrder) {
        //var byDate = datas.slice(0);
        // datas.sort(function (a, b) {
        //     if (isAscOrder == true) {
        //         return b[targetKey] - a[targetKey];
        //     } else {
        //         return a[targetKey] - b[targetKey];
        //     }

        // });
        if (isAscOrder) {
            datas.sort((a, b) => (a[targetKey] > b[targetKey]) ? 1 : -1);
        } else {
            datas.sort((a, b) => (a[targetKey] > b[targetKey]) ? -1 : 1);
        }

    }

    public static hexToRgb(hex) {
        try {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        } catch (error) {
            console.log(error);
        }
        return null;
    }


    /**
     * hexToDec
     */
    public static hexToDec(hexString: string): number {
        let num: number = 0;
        for (let index = 0; index < hexString.length; index++) {
            let hexdigit = parseInt(hexString[index], 16);
            num = (num << 4) | hexdigit;
        }

        return num;
    }


    public static formatTimeSecond(second: number) {
        let sec_num = second; // don't forget the second param
        let hours = Math.floor(sec_num / 3600);
        let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds = sec_num - (hours * 3600) - (minutes * 60);

        let sHours = "00";
        let sMinutes = "00";
        let sSeconds = "00";

        if (hours < 10) { sHours = "0" + hours; } else {
            sHours = hours + "";
        }
        if (minutes < 10) { sMinutes = "0" + minutes; } else {
            sMinutes = minutes + "";
        }
        if (seconds < 10) { sSeconds = "0" + seconds; } else {
            sSeconds = seconds + "";
        }
        return sMinutes + ':' + sSeconds;
    }


    /**
     * randomString
     */
    public static randomString(length: number = 18) {

        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;

    }


    public static maxStringLength(text: string, length: number) {
        length = Number(length);
        if (text.length > length) {
            let subText = text.substr(0, length) + "...";
            return subText;
        }

        return text;
    }

    getIpAddress() {

        const xmlHttp = new XMLHttpRequest();
        const url = "https://freegeoip.net/json/";

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                console.log("Success : " + xmlHttp.responseText);
            } else if (xmlHttp.readyState == 4 && xmlHttp.status != 200) {
                console.log("failure : " + xmlHttp.responseText);
            }
        };
        xmlHttp.open("GET", url, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send();

    }

    public static randomInt(min: number, max: number): number {
        return Math.floor((Math.random() * max) + min);
    }



    public static randomInteger(min, max) {
        let number = min + Math.floor(Math.random() * (max - min + 1));
        return number;
    }

    public static generateUniqueDeviceId() {
        let deviceId = "D" + (new Date().getTime()) + this.generateRandomString(10);
        return deviceId;
    }

    public static generateUniqueHostPeerId(hostDeviceId) {
        let deviceId = hostDeviceId + "H" + (new Date().getTime()) + this.generateRandomString(10);
        return deviceId;
    }

    public static generateRandomString(total) {
        let text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let maxIndex = text.length - 1;
        let result = "";
        for (let i = 0; i < total; i++) {
            let char = text[this.randomInteger(0, maxIndex)];
            result += char;
        }
        return result;
    }

    public static getDayStart(currentDate : Date) {
        currentDate.setHours(0);
        currentDate.setMinutes(0);
        currentDate.setSeconds(1);
        return currentDate;
    }

    public static getDayEnd(currentDate) {
        currentDate.setHours(23);
        currentDate.setMinutes(59);
        currentDate.setSeconds(59);
        return currentDate;
    }



    public static getMonthStart(currentDate) {
        let monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return monthStart;
    }

    public static getMonthEnd(currentDate) {
        let monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        return monthEnd;
    }

    public static getYearStart(currentDate:Date) {
        let monthStart = new Date(currentDate.getFullYear(), 0, 1);
        return monthStart;
    }

    public static getYearEnd(currentDate) {
        let monthEnd = new Date(currentDate.getFullYear(), 12, 0, 23, 59, 59, 999);
        return monthEnd;
    }

    public static roundNumber(value:number,decimalPlaces:number):number{
        let numberString = value.toFixed(decimalPlaces);
        let number = parseFloat(numberString);
        return number;
    }
}