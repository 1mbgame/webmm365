import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-info-dialog',
  templateUrl: 'info-dialog.component.html',
  styleUrls: ['info-dialog.component.scss'],
})
export class InfoDialogComponent {

  @Input() title: string;
  @Input() body: string;

  

  constructor(protected ref: NbDialogRef<InfoDialogComponent>) { }

  dismiss() {
    //this.ref.close();
  }

  onOkClicked() {
    
    this.ref.close();
  }


}
