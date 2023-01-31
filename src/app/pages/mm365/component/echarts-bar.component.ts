import { Input } from '@angular/core';
import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';

@Component({
  selector: 'ngx-echarts-bar',
  template: `
    <div echarts [options]="options" class="echart"></div>
  `,
})
export class EchartsBarComponent implements AfterViewInit, OnDestroy {
  
  @Input() xAxisDataList = [];
  @Input() yAxisDataList = [];

  echartsInstance:any;
  options: any = {};
  themeSubscription: any;

  constructor(private theme: NbThemeService) {
  }

  onChartInit(ec){
    console.log(ec);
    this.echartsInstance = ec;
  }


  ngAfterViewInit() {
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      
      console.log(config);

      const colors: any = config.variables;
      const echarts: any = config.variables;
      echarts.textColor = echarts.fgText;
      echarts.axisLineColor = echarts.fgText;
      echarts.splitLineColor = echarts.separator;

      this.options = {
        backgroundColor: echarts.bg,
        color: [colors.primaryLight],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: this.xAxisDataList,
            axisTick: {
              alignWithLabel: true,
            },
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            axisLabel: {
              textStyle: {
                color: echarts.textColor,
              },
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: echarts.axisLineColor,
              },
            },
            splitLine: {
              lineStyle: {
                color: echarts.splitLineColor,
              },
            },
            axisLabel: {
              textStyle: {
                color: echarts.textColor,
              },
            },
          },
        ],
        series: [
          {
            name: 'Amount',
            type: 'bar',
            barWidth: '60%',
            data: this.yAxisDataList,
          },
        ],
      };
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  public updateData(colorList,nameList,dataList){
    
    console.log(this.options);
    this.options.color = colorList;
    this.options.legend.data = nameList;
    this.options.series[0].data = dataList;
    console.log(this.options);
    this.echartsInstance.setOption(this.options);
  }
}
