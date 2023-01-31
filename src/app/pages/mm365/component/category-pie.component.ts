import { Input } from '@angular/core';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { NbJSThemeOptions, CORPORATE_THEME as baseTheme } from '@nebular/theme';
import { TransactionType } from 'app/constant/TransactionType';
import { GlobalData } from 'app/model/GlobalData';
import { ChartRowData } from 'app/object/ChartRowData';


@Component({
  selector: 'ngx-category-pie',
  template: `
    <div  echarts [options]="options" class="echart" (chartInit)="onChartInit($event)"></div>
  `,
})
export class CategoryPieComponent implements AfterViewInit, OnDestroy {
 
  @Input() colorList: string[];
  @Input() nameList:string[];
  @Input() dataList:ChartRowData[];


  echartsInstance:any;
  options: any = {};
  themeSubscription: any;

  

  constructor(private theme: NbThemeService) {
    GlobalData.getInstance().categoryPieComponent = this;
  }

  onChartInit(ec){
    console.log(ec);
    this.echartsInstance = ec;
    this.initChartReload();
  }

  ngAfterViewInit() {

    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      console.log(config);
      const colors = config.variables;
      const echarts: any = config.variables;

      this.options = {
        backgroundColor: echarts.bg,
        color: [
          //colors.warningLight, colors.infoLight, colors.dangerLight, colors.successLight, colors.primaryLight
        ],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: [
            //'USA', 'Germany', 'France', 'Canada', 'Russia'
          ],
          textStyle: {
            color: echarts.fgText,
          },
        },
        series: [
          {
            name: 'Categories',
            type: 'pie',
            radius: '80%',
            center: ['50%', '50%'],
            data: [
              // { value: 335, name: 'Germany' },
              // { value: 310, name: 'France' },
              // { value: 234, name: 'Canada' },
              // { value: 135, name: 'Russia' },
              // { value: 1548, name: 'USA' },
            ],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: echarts.itemHoverShadowColor,
              },
            },
            label: {
              normal: {
                textStyle: {
                  color: echarts.fgText,
                },
              },
            },
            labelLine: {
              normal: {
                lineStyle: {
                  color: echarts.axisLineColor,
                },
              },
            },
          },
        ],
      };

      
    });
  }

  initChartReload(){
    console.log("initChartReload()");
    if(this.colorList == undefined){
      return;
    }
    if(this.colorList.length <= 0){
      return;
    }
    
    this.options.color = this.colorList;
    this.options.legend.data = this.nameList;
    this.options.series[0].data = this.dataList;
    this.echartsInstance.setOption(this.options);
    console.log(this.options);
  }

  ngOnDestroy(): void {
    console.log("CategoryPieComponent.ngOnDestroy()");
    this.themeSubscription.unsubscribe();
  }

  public updateData(colorList,nameList,dataList){
    
    this.options.color = colorList;
    this.options.legend.data = nameList;
    this.options.series[0].data = dataList;
    this.echartsInstance.setOption(this.options);
  }
}
