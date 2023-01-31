/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { SendDataUtils } from './library/SendDataUtils';
import { MultiORM } from './library/simpleORM/MultiORM';
import { DashboardSetting } from './model/DashboardSetting';
import { GlobalData } from './model/GlobalData';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(private analytics: AnalyticsService, private seoService: SeoService) {
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
    GlobalData.getInstance().initLocalData();
    GlobalData.getInstance().dashboardSetting = new DashboardSetting();
    SendDataUtils.loadData();
    MultiORM.getInstance().setParameterize(false);
  }
}
