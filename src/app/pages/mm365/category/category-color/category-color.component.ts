import { Input, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MyUtils } from 'app/library/MyUtils';

@Component({
    selector: 'ngx-category-color',
    templateUrl: './category-color.component.html',
    styleUrls: ['./category-color.component.scss']
})
export class CategoryColorComponent implements OnInit {

    @ViewChild("colorBox") colorBox: ElementRef;

    @Input() value: string;
    @Input() rowData: any;

    displayValue: String = "";

    
    
    constructor() {
        console.log("CategoryColorComponent.constructor()");
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        this.colorBox.nativeElement.style.backgroundColor = this.value;
        
    }


}
