import { OnChanges, SimpleChanges } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { DefaultFilter } from 'ng2-smart-table';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'ngx-budget-account-filter',
    templateUrl: './budget-account-filter.component.html',
    styleUrls: ['./budget-account-filter.component.scss']
})
export class BudgetAccountFilterComponent extends DefaultFilter implements OnInit, OnChanges {

    inputControl = new FormControl();

    constructor() {
        super();
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.query) {
            this.query = changes.query.currentValue;
            this.inputControl.setValue(this.query);
        }
    }

    ngOnInit(): void {

        this.inputControl.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(this.delay),
            )
            .subscribe((value: number) => {
                console.log(value);
                this.query = value !== null ? this.inputControl.value.toString() : '';
                this.setFilter();
            });
    }
}
