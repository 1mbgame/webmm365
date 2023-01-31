export class Budget {
    constructor() {

        this.accountIdList = "";
        this.amount = 0;
        this.budgetId = "";
        this.categoryIdList = "";
        this.createdAt = 0;
        this.dateIndex = 0;
        this.endDate = 0;
        this.isReminded = false;
        this.name = "";
        this.remark = "";
        this.startDate = 0;
        this.updatedAt = 0;
        this.exceedPercentage = 0;
        this.isRemindEnabled = false;
        this.lastDisburseAt = 0;
        this.repeatType = "";
    }

    accountIdList: string;
    amount: number;
    budgetId: string;
    categoryIdList: string;
    createdAt: number;
    dateIndex: number;
    endDate: number;
    isReminded: boolean;
    name: string;
    remark: string;
    startDate: number;
    updatedAt: number;
    exceedPercentage: number;
    isRemindEnabled: boolean;
    lastDisburseAt: number;
    repeatType: string;
}