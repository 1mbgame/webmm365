import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepickerModule, NbDialogModule, NbFontIcon, NbIconModule, NbInputModule, NbMenuModule, NbPopoverModule, NbSelectModule, NbSpinnerModule, NbTreeGridModule, NbWindowModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { MM365RoutingModule } from './mm365/mm365-routing.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    MiscellaneousModule,
    NbSelectModule,
    NbCardModule,
    NbTreeGridModule,
    NbIconModule,
    NbInputModule,
    NbButtonModule,
    MM365RoutingModule,
    Ng2SmartTableModule,
    NbDatepickerModule,
    NbCheckboxModule,
    NbSpinnerModule,
    NbDialogModule,
    NbWindowModule,
    NbPopoverModule,
  ],
  declarations: [
    PagesComponent,
  ],
})
export class PagesModule {
}
