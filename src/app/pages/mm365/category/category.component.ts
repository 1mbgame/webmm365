import { Component, OnInit } from '@angular/core';
import { NbDateService, NbDialogService } from '@nebular/theme';
import { CategoryService } from 'app/database/service/CategoryService';
import { Category } from 'app/database/domain/Category';
import { MultiORM } from "app/library/simpleORM/MultiORM";
import { GlobalData } from "app/model/GlobalData";
import { LocalData } from "app/model/LocalData";
import { LocalDataSource } from 'ng2-smart-table';
import { CategoryColorComponent } from './category-color/category-color.component';
import { CategoryViewComponent } from './category-view/category-view.component';
import { ConfirmationDialogComponent } from '../widget/confirmation-dialog/confirmation-dialog.component';


@Component({
    selector: 'ngx-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

    multiORM: MultiORM = MultiORM.getInstance();
    globalData: GlobalData = GlobalData.getInstance();
    localData: LocalData = GlobalData.getInstance().localData;

    settings = {
        pager:{
            perPage : 100,
        },
        mode: "external",
        actions: {
            delete: true,
            add: false,
            edit: true,
            position: 'right',
        },
        add: {
            addButtonContent: '<i class="nb-plus"></i>',
            createButtonContent: '<i class="nb-checkmark"></i>',
            cancelButtonContent: '<i class="nb-close"></i>',
            confirmCreate: true
        },
        edit: {
            editButtonContent: '<i class="nb-edit"></i>',
            saveButtonContent: '<i class="nb-checkmark"></i>',
            cancelButtonContent: '<i class="nb-close"></i>',
            confirmSave: true
        },
        delete: {
            deleteButtonContent: '<i class="nb-trash"></i>',
            confirmDelete: true,
        },
        columns: {
            name: {
                title: 'Name',
                type: 'string'
            },
            transactionType: {
                title: 'Type',
                type: 'string'
            },
            color: {
                title: 'Color',
                type: 'custom',
                renderComponent: CategoryColorComponent
            }
        },
    };

    source: LocalDataSource = new LocalDataSource();
    categoryList: Category[] = [];
    isLoading: boolean = false;


    constructor(
        protected dateService: NbDateService<Date>,
        private dialogService: NbDialogService
    ) {
        this.categoryList = this.globalData.categoryList;
        this.initData();
    }

    ngOnInit(): void {


    }

    initData() {
        this.categoryList = this.globalData.categoryList;
        if (this.categoryList.length > 0) {
            this.source.load(this.categoryList);
            return;
        }

        this.downloadCategory();
    }

    downloadCategory() {
        this.isLoading = true;
        CategoryService.all((xmlHttp: XMLHttpRequest) => {
            this.isLoading = false;
            let data = JSON.parse(xmlHttp.responseText);
            let categoryList = data["all"];
            if (categoryList == null) {
                return;
            }
            this.globalData.categoryList = categoryList;
            this.categoryList = categoryList;
            this.source.load(categoryList);
        }, (xmlHttp: XMLHttpRequest) => {
            this.isLoading = false;
            console.log(xmlHttp.responseText);
        });
    }

    removeCategoryFromList(categoryId){
        let categoryList = this.globalData.categoryList;
        let i = 0;
        for (const key in categoryList) {
            if (Object.prototype.hasOwnProperty.call(categoryList, key)) {
                const item = categoryList[key];
                if (item.categoryId == categoryId) {
                    categoryList.splice(i, 1);
                    break;
                }
            }
            i += 1;
        }
    }










    // Button Callback
    onRefreshClicked() {
        this.downloadCategory();
    }

    onAddClicked() {
        this.dialogService.open(CategoryViewComponent, {
            context: {
                onYesClickedCallback: (category) => {
                    console.log("Yes");
                    this.source.load(this.categoryList);
                }
            },
            closeOnBackdropClick: false,
        });
    }

    onCreateConfirm(event) {
        console.log(event);
    }

    onEditConfirm(event) {
        console.log(event);
    }

    onDeleteConfirmClicked(event) {
        console.log(event);
    }

    onDeleteClicked(event) {
        console.log(event);
        const category: Category = event.data;
        this.dialogService.open(ConfirmationDialogComponent, {
            context: {
                title: 'Delete',
                body: "Are you sure you want to delete this category? ",
                onYesClickedCallback: () => {
                    console.log("Yes");
                    this.removeCategoryFromList(category.categoryId);
                    CategoryService.delete(category);
                    //this.source.load(this.categoryList);
                    this.source.remove(category);
                }
            },
        });

    }

    onEditClicked(event) {
        console.log(event);
        this.dialogService.open(CategoryViewComponent, {
            context: {
                category : event["data"],
                onYesClickedCallback: (category) => {
                    console.log("Yes");
                    this.source.update(category, category);
                }
            },
            closeOnBackdropClick: false,
        });
    }

}
