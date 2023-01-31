export class Account {
    constructor() {

        this.accountId = "";
        this.balance = 0;
        this.createdAt = 0;
        this.currencyCode = "";
        this.currencyCountry = "";
        this.currencySymbol = "";
        this.decimal = 2;
        this.isAutoSelected = false;
        this.name = "";
        this.remark = "";
        this.sequence = 0;
        this.updatedAt = 0;
        this.openingBalance = 0;
        this.isShared = false;
    }

    public accountId: string;
    public balance: number;
    public createdAt: number;
    public currencyCode: string;
    public currencyCountry: string;
    public currencySymbol: string;
    public decimal: number;
    public isAutoSelected: boolean;
    public name: string;
    public remark: string;
    public sequence: number;
    public updatedAt: number;
    public openingBalance: number;
    public isShared: boolean;


    
}