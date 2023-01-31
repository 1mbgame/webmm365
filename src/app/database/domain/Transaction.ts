export class Transaction {
    constructor() {
        this.accountId = "";
        this.amount = 0;
        this.category = "";
        this.categoryColor = "";
        this.createdAt = 0;
        this.remark = "";
        this.toAccountId = "";
        this.transactionDate = 0;
        this.transactionId="";
        this.type="";
        this.updatedAt = 0;
        this.createdBy="";
        this.updatedBy="";
        this.imageJson="";
    }

    public localId : number;
    public  accountId : string;
    public  amount: number;
    public  category :string;
    public  categoryColor : string;
    public  createdAt : number;
    public  remark : string;
    public  toAccountId : string;
    public  transactionDate : number;
    public  transactionId : string;
    public  type : string;
    public  updatedAt : number;
    public  createdBy : string;
    public  updatedBy : string;
    public  imageJson : string;

}