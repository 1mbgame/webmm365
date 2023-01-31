import { ElementRef, Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ColorName } from 'app/constant/ColorName';
import { DataAction } from 'app/constant/DataAction';
import { TableName } from 'app/constant/TableName';
import { TransactionType } from 'app/constant/TransactionType';
import { Category } from 'app/database/domain/Category';
import { DatabaseUtils } from 'app/database/domain/DatabaseUtils';
import { CategoryService } from 'app/database/service/CategoryService';
import { DataSyncService } from 'app/database/service/DataSyncService';
import { MyUtils } from 'app/library/MyUtils';
import { MultiORM } from 'app/library/simpleORM/MultiORM';
import { GlobalData } from 'app/model/GlobalData';
import { LocalData } from 'app/model/LocalData';



@Component({
    selector: 'ngx-category-view',
    templateUrl: './category-view.component.html',
    styleUrls: ['./category-view.component.scss']
})
export class CategoryViewComponent implements OnInit {

    @ViewChild("inputName") inputName: ElementRef;
    @ViewChild("errorMessageView") errorMessageView: ElementRef;

    @Input() category: Category;
    @Input() onYesClickedCallback;
    @Input() onNoClickedCallback;

    multiORM: MultiORM = MultiORM.getInstance();
    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;
    isEditMode: boolean = false;
    actionTitle: string = "";
    colorList: string[] = [];

    name: string = "";
    type: string = TransactionType.EXPENSE;
    color: string = ColorName.BLUE;

    constructor(
        private ref: NbDialogRef<CategoryViewComponent>
    ) {

    }

    ngOnInit(): void {
        this.initData();

    }

    ngAfterViewInit(): void {

        this.initView();
    }

    initData() {
        console.log(this.category);
        if (this.category != undefined) {
            this.isEditMode = true;
            this.actionTitle = "Edit Category:";
            this.name = this.category.name;
            this.type = this.category.transactionType;
            this.color = this.category.color;
        } else {
            this.actionTitle = "New Category:";
        }

        this.colorList.push(ColorName.BLUE);
        this.colorList.push(ColorName.BROWN);
        this.colorList.push(ColorName.CYAN);
        this.colorList.push(ColorName.DEEP_PURPLE);
        this.colorList.push(ColorName.GREEN);
        this.colorList.push(ColorName.INDIGO);
        this.colorList.push(ColorName.LIGHT_BLUE);
        this.colorList.push(ColorName.LIGHT_GREEN);
        this.colorList.push(ColorName.LIME);
        this.colorList.push(ColorName.ORANGE);
        this.colorList.push(ColorName.PINK);
        this.colorList.push(ColorName.PURPLE);
        this.colorList.push(ColorName.RED);
        this.colorList.push(ColorName.TEAL);
        this.colorList.push(ColorName.WHITE);
        this.colorList.push(ColorName.YELLOW);
    }

    initView() {
        this.inputName.nativeElement.value = this.name;
    }

    validateData(): boolean {
        this.name = this.inputName.nativeElement.value;

        this.name = this.name.trim();
        if (this.name == "") {
            this.errorMessageView.nativeElement.innerHTML = "The name can not be empty";
            this.inputName.nativeElement.focus();
            return false;
        }

        // Check whether the name has been taken or not
        let categoryId: string = "";
        if (this.category != undefined) {
            categoryId = this.category.categoryId;
        }
        if (this.isCategoryNameExist(this.name, categoryId) == true) {
            this.errorMessageView.nativeElement.innerHTML = "The name has been taken.";
            this.inputName.nativeElement.focus();
            return false;
        }

        return true;
    }

    isCategoryNameExist(categoryName : string, categoryId : string) {
        let categoryList: Category[] = this.globalData.categoryList;
        let targetCategoryName = categoryName.toUpperCase();
        for (const key in categoryList) {
            if (Object.prototype.hasOwnProperty.call(categoryList, key)) {
                const category = categoryList[key];
                if (categoryId != "" && category.categoryId == categoryId) {
                    continue;
                }
                if (category.name.toUpperCase() == targetCategoryName) {
                    return true;
                }
            }
        }

        return false;
    }

    save(){
        if(this.isEditMode == true){
            this.updateCategory()
        }else{
            this.createCategory();
        }
    }

    updateCategory(){
        let currentDate = new Date();
        let oldCategoryName = this.category.name;
        let oldCategoryColor = this.category.color;
        
        this.category.name = this.name;
        this.category.transactionType = this.type;
        this.category.color = this.color;
        this.category.updatedAt = currentDate.getTime();
        
        CategoryService.update(oldCategoryName,oldCategoryColor ,this.category);

    }

    createCategory(){
        let currentDate = new Date();
        let category = new Category();
        
        category.categoryId = DatabaseUtils.generateId();
        category.color = this.color;
        category.createdAt = currentDate.getTime();
        category.name = this.name;
        category.parentId = "";
        category.sequence = this.getLastSequenceNumber();
        category.transactionType = this.type;
        category.updatedAt = category.createdAt;
        
        this.category = category;
        this.globalData.categoryList.push(category);

        CategoryService.create(category);

    }

    

    getLastSequenceNumber(){
        let categoryList = this.globalData.categoryList;
        if(categoryList.length > 0){
            let lastCategory : Category = categoryList[categoryList.length-1];
            let lastNumber = lastCategory.sequence + 1;
            return lastNumber;
        }
        return 0;
    }


    // Button Callback
    onYesClicked() {
        if (this.validateData() == true) {
            this.save();
            if (this.onYesClickedCallback != undefined) {
                this.onYesClickedCallback(this.category);
            }
            this.ref.close();
        }
    }

    onNoClicked() {
        if (this.onNoClickedCallback != undefined) {
            this.onNoClickedCallback();
        }
        this.ref.close();
    }

    onTypeIncomeClicked(type) {
        console.log(type);
        this.type = type;
    }

    onTypeExpenseClicked(type) {
        console.log(type);
        this.type = type;
    }

    onColorChanged(color) {
        console.log(color);
        this.color = color;
    }
}
