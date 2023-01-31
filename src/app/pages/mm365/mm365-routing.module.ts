import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { ExportComponent } from './export/export.component';

import { MM365Component } from './mm365.component';
import { DashboardDateComponent } from '../dashboard/dashboard-date/dashboard-date.component';
import { DashboardCategoryComponent } from '../dashboard/dashboard-category/dashboard-category.component';
import { DashboardAmountComponent } from '../dashboard/dashboard-amount/dashboard-amount.component';
import { AccountComponent } from './account/account.component';
import { AccountCurrencyComponent } from './account/account-currency/account-currency.component';
import { ConfirmationDialogComponent } from './widget/confirmation-dialog/confirmation-dialog.component';
import { InfoDialogComponent } from './widget/info-dialog/info-dialog.component';
import { AccountViewComponent } from './account/account-view/account-view.component';
import { CategoryComponent } from './category/category.component';
import { CategoryColorComponent } from './category/category-color/category-color.component';
import { CategoryViewComponent } from './category/category-view/category-view.component';
import { BudgetComponent } from './budget/budget.component';
import { BudgetViewComponent } from './budget/budget-view/budget-view.component';
import { BudgetDateComponent } from './budget/budget-date/budget-date.component';
import { BudgetAccountComponent } from './budget/budget-account/budget-account.component';
import { BudgetAccountFilterComponent } from './budget/budget-account-filter/budget-account-filter.component';
import { CategoryPieComponent } from './component/category-pie.component';
import { CategoryChartComponent } from './chart/category-chart/category-chart.component';
import { TransactionComponent } from './component/transaction/transaction.component';
import { CategoryColumnColorComponent } from './component/table-column/category-column-color/category-column-color';
import { ChartTableComponent } from './component/chart-table/chart-table.component';
import { EchartsLineComponent } from './component/echarts-line.component';
import { EchartsBarComponent } from './component/echarts-bar.component';
import { BudgetChartComponent } from './chart/budget-chart/budget-chart.component';
import { ImportComponent } from './import/import.component';
import { ChartCompareComponent } from './chart/chart-compare/chart-compare.component';
import { ChartjsLineComponent } from './component/chartjs-line.component';
import { VipComponent } from './vip/vip.component';
import { PaypalComponent } from './vip/paypal/paypal.component';
import { MobileLoginComponent } from './auth/mobile-login/mobile-login.component';
import { VipDialogComponent } from './component/vip-dialog/vip-dialog.component';
import { BackupComponent } from './backup_restore/backup/backup.component';

const routes: Routes = [{
  path: '',
  component: MM365Component,
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'account',
      component: AccountComponent,
    },
    {
      path: 'budget',
      component: BudgetComponent,
    },
    {
      path: 'category',
      component: CategoryComponent,
    },
    {
      path: 'category-chart',
      component: CategoryChartComponent,
    },
    {
      path: 'compare-chart',
      component: ChartCompareComponent,
    },
    {
      path: 'budget-chart',
      component: BudgetChartComponent,
    },
    {
      path: 'export',
      component: ExportComponent,
    },
    {
      path: 'import',
      component: ImportComponent,
    },
    {
      path: 'vip',
      component: VipComponent,
    },
    {
      path: 'backup',
      component: BackupComponent,
    },
    {
      path: 'restore',
      component: VipComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule],
})
export class MM365RoutingModule { }

export const routedComponents = [
  MM365Component,
  DashboardComponent,
  ExportComponent,
  DashboardDateComponent,
  DashboardCategoryComponent,
  DashboardAmountComponent,
  AccountComponent,
  AccountCurrencyComponent,
  ConfirmationDialogComponent,
  InfoDialogComponent,
  AccountViewComponent,
  CategoryComponent,
  CategoryColorComponent,
  CategoryViewComponent,
  BudgetComponent,
  BudgetViewComponent,
  BudgetDateComponent,
  BudgetAccountComponent,
  BudgetAccountFilterComponent,
  CategoryColumnColorComponent,
  CategoryPieComponent,
  CategoryChartComponent,
  ChartTableComponent,
  TransactionComponent,
  EchartsLineComponent,
  EchartsBarComponent,
  BudgetChartComponent,
  ImportComponent,
  ChartCompareComponent,
  ChartjsLineComponent,
  VipComponent,
  PaypalComponent,
  VipDialogComponent,
  BackupComponent
];
