import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      Created with ♥ by <b><a href="https://www.moneymanager365.com" target="_blank">Money Manager 365</a></b> 2021
    </span>
    <div class="socials">
      <a href="https://web.facebook.com/Money-Manager-365-107167160979088/" target="_blank" class="ion ion-social-facebook"></a>
    </div>
  `,
})
export class FooterComponent {
}

// <span class="created-by">
//       Created with ♥ by <b><a href="https://www.moneymanager365.com" target="_blank">Money Manager 365</a></b> 2021
//     </span>
//     <div class="socials">
//       <a href="#" target="_blank" class="ion ion-social-github"></a>
//       <a href="#" target="_blank" class="ion ion-social-facebook"></a>
//       <a href="#" target="_blank" class="ion ion-social-twitter"></a>
//       <a href="#" target="_blank" class="ion ion-social-linkedin"></a>
//     </div>
