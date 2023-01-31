import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NbButtonModule, NbCardModule, NbCheckboxModule, NbDatepicker, NbDatepickerModule, NbDialogModule, NbIconModule, NbInputModule, NbOptionModule, NbPopoverModule, NbProgressBarModule, NbRadioModule, NbSelectModule, NbSpinnerModule, NbTreeGridModule, NbWindowModule } from '@nebular/theme';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartModule } from 'angular2-chartjs';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NgxEchartsModule } from 'ngx-echarts';


import { ThemeModule } from '../../@theme/theme.module';
import { MM365RoutingModule, routedComponents } from './mm365-routing.module';

@NgModule({
  imports: [
    ThemeModule,
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
    NbOptionModule,
    NbRadioModule,
    NgxEchartsModule,
    NbProgressBarModule,
    NgxChartsModule,
    ChartModule,
  ],
  declarations: [
    ...routedComponents,
    //FsIconComponent,
  ],
})
export class MM365Module { }
