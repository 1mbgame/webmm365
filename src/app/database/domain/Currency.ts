export class Currency {
    constructor() {
        this.countryName = "";
        this.currencyCode = "";
        this.currencySymbol = "";
        this.decimal = 0;
        this.regionCode = "";
        this.createdAt = 0;
        this.updatedAt = 0;
        this.isSystem = false;
    }

    countryName: string;
    currencyCode: string;
    currencySymbol: string;
    decimal: number;
    regionCode: string;
    createdAt: number;
    updatedAt: number;
    isSystem: boolean;
}