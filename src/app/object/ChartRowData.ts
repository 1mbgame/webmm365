import { Transaction } from "app/database/domain/Transaction";

export class ChartRowData {
    name: string;
    value: number;
    color: string;
    totalTransaction:number;
    transactionList:Transaction[];
}