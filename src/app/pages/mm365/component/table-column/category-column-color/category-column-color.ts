import { ElementRef, Input, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { GlobalData } from 'app/model/GlobalData';

@Component({
    selector: 'ngx-category-column-color',
    templateUrl: './category-column-color.component.html',
    styleUrls: ['./category-column-color.component.scss']
})
export class CategoryColumnColorComponent implements OnInit {

    @ViewChild("viewDot")viewDot : ElementRef;


    @Input() value: string;
    @Input() rowData: any;

    globalData: GlobalData = GlobalData.getInstance();
    displayValue: string = "";


    constructor() { }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.viewDot.nativeElement.style["background-color"] = this.value;
    }
}
