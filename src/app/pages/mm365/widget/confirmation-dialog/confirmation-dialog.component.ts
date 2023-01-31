import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-confirmation-dialog',
  templateUrl: 'confirmation-dialog.component.html',
  styleUrls: ['confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {

  @Input() title: string;
  @Input() body: string;

  @Input() buttonYesTitle: string = "Yes";
  @Input() buttonNoTitle: string = "No";
  @Input() buttonMiddleTitle: string = "Middle";

  @Input() onYesClickedCallback;
  @Input() onNoClickedCallback;
  @Input() onMiddleClickedCallabck;

  @Input() isButtonMiddleShow : boolean = false;

  constructor(protected ref: NbDialogRef<ConfirmationDialogComponent>) { }

  dismiss() {
    this.ref.close();
  }

  onYesClicked() {
    if (this.onYesClickedCallback != undefined) {
      this.onYesClickedCallback();
    }
    this.ref.close();
  }

  onMiddleClicked(){
    if(this.onMiddleClickedCallabck != undefined){
      this.onMiddleClickedCallabck();
    }
    this.ref.close();
  }

  onNoClicked() {
    if (this.onNoClickedCallback != undefined) {
      this.onNoClickedCallback();
    }
    this.ref.close();
  }

}
