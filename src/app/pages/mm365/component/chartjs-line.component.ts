import { Input } from '@angular/core';
import { Component, OnDestroy } from '@angular/core';
import { NbThemeService, NbColorHelper } from '@nebular/theme';
import { GlobalData } from 'app/model/GlobalData';

@Component({
  selector: 'ngx-chartjs-line',
  template: `
    <chart type="line" [data]="data" [options]="options"></chart>
  `,
})
export class ChartjsLineComponent implements OnDestroy {

  @Input("labels") labels: string[];
  @Input("line1Data") line1Data: number[];
  @Input("line2Data") line2Data: number[];

  data: any;
  options: any;
  themeSubscription: any;
  line1Label:string = "";
  line2Label:string = "";

  config:any;


  constructor(private theme: NbThemeService) {

    GlobalData.getInstance().chartjsLineComponent = this;



    if(this.labels == undefined){
      this.labels = [];
    }

    if(this.line1Data == undefined){
      this.line1Data = [];
    }
    if(this.line2Data == undefined){
      this.line2Data = [];
    }


  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
      console.log("Observer trigger!");
      console.log(config);
      this.config = config;
      const colors: any = config.variables;
      const chartjs: any = config.variables.chartjs;

      this.data = {
        labels: this.labels,
        datasets: [{
          data: this.line1Data,
          label: this.line1Label,
          backgroundColor: NbColorHelper.hexToRgbA(colors.info, 0.3),
          borderColor: colors.info,
        }, {
          data: this.line2Data,
          label: this.line2Label,
          backgroundColor: NbColorHelper.hexToRgbA(colors.danger, 0.3),
          borderColor: colors.danger,
        },
        ],
      };
      console.log(this.data);
      this.options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              gridLines: {
                display: true,
                //color: chartjs.axisLineColor,
                color: colors.separator
              },
              ticks: {
                //fontColor: chartjs.textColor,
                fontColor: colors.fgText,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
                //color: chartjs.axisLineColor,
                color: colors.separator,
              },
              ticks: {
                //fontColor: chartjs.textColor,
                fontColor: colors.fgText,
              },
            },
          ],
        },
        legend: {
          labels: {
            //fontColor: chartjs.textColor,
            fontColor: colors.fgText,
          },
        },
      };
    });
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

  }

  initChart(line1Label,line2Label,monthList, line1AmountList, line2AmountList) {
    console.log("=================Init Chart=================");
    this.line1Label = line1Label;
    this.line2Label = line2Label;
    this.labels = monthList;
    this.line1Data = line1AmountList;
    this.line2Data = line2AmountList;
    
    //this.config.update = (new Date()).getTime();
    this.themeSubscription.next(this.config);
  }

}
