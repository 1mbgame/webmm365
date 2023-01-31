import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ConfirmationDialogComponent } from '../../widget/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'ngx-vip-dialog',
    templateUrl: './vip-dialog.component.html',
    styleUrls: ['./vip-dialog.component.scss']
})
export class VipDialogComponent implements OnInit {

    @Input() onYesClickedCallback;

    constructor(protected ref: NbDialogRef<ConfirmationDialogComponent>) {

    }

    dismiss() {
        this.ref.close();
    }


    ngOnInit(): void { }


    onGoClicked() {
        if (this.onYesClickedCallback != undefined) {
            this.onYesClickedCallback();
        }
        this.ref.close();
    }


    onCancelClicked() {
        this.ref.close();
    }
}
