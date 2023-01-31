
export class MyEncryptionService {

    public static key: number = 18;

    constructor() {
         
    }
    /* 
                hex	    dec
        MAX	    FFFFFE	16,777,214
        MIN	    100001	1048577
        
        maximum characters is 15,728,637
    */

    /**
    // format : RRRRRRHHHHHHJJJJJJJJJJJJJJRRRRRR
    // R : random charaters
    // H : sum of the string (R and J) and convert to Hex
    // J : jSon data encoded with base64
     */
    public static encode(jsonString: string):string {
        let randomString1 = this.randomString(this.key);
        let randomString2 = this.randomString(this.key);

        let base64text = btoa(jsonString);
        let intSumOfText: number = this.sumOfText(randomString1) + this.sumOfText(base64text) + this.sumOfText(randomString2);
        let intHex: number = intSumOfText + 1048577.0;
        let charHex: string = intHex.toString(16);

        return randomString1 + charHex + base64text + randomString2;
    }

    public static decode(encodedText:string) : any{
        let encodedTextLength = encodedText.length;
        let keyLength = this.key*2 + 6;
        if(encodedTextLength < keyLength){
            return null;
        }

        let removeRandomString1:string = encodedText.substr(this.key);
        let removeHexString:string = removeRandomString1.substr(6);
        let totalLength:number = removeHexString.length;
        let base64text:string = removeHexString.substr(0,totalLength - this.key);
        let randomString1 : string = encodedText.substr(0,this.key);
        let randomString2:string = encodedText.substr(encodedText.length- this.key) ;
        let charHex:string = removeRandomString1.substr(0,6);

        let intTotalHexNumber:number = this.hexToDec(charHex) - 1048577.0;

        let intCheckSum = this.sumOfText(randomString1) + this.sumOfText(base64text) + this.sumOfText(randomString2);
        if(intTotalHexNumber != intCheckSum){
            return null;
        }

        return atob(base64text);
    }

    
     /**
     * hexToDec
     */
    public static hexToDec(hexString:string) {
        let num:number = 0;
        for (let index = 0; index < hexString.length; index++) {
            let hexdigit = parseInt(hexString[index],16);
            num = (num << 4) | hexdigit;
        }

        return num;
    }


    /**
     * sumOfText
     */
    public static sumOfText(text: string) {
        let length = text.length;
        let sum: number = 0;
        for (let i = 0; i < length; i++) {
            let num: number = text.charCodeAt(i);
            sum += num;
        }
        return sum;
    }
    /**
     * randomString
     */
    public static randomString(length:number = 18) {

        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;

    }



}