import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../_service/api.service';
import { Chart } from 'angular-highcharts';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
    chart!: any
    constructor(private api: ApiService){}
    revenueYear!: any[]
    currentYear!: number;
    currentMonth!: number;
    
   
      ngOnInit(): void {
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth() + 1;
        this.api.getRevenueByMonth(this.currentMonth, this.currentYear).subscribe((res)=>{
           this.revenueYear = res            
           const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
           this.chart = new Chart({
            chart: {
              type: 'line',
              height: 325
            },
            title: {
              text: 'Beyond Hotel Statics Month'
            },
            xAxis: {
              
                categories: this.revenueYear.map(item => item.day )
            },
            yAxis: {
              title: {
                text: 'VND'
              }
            },
            tooltip: {
                valueSuffix: ' VND'
              },
            series: [
              
            //   {
            //     name: 'Revenue',
            //     type: 'line',
            //     color: '#727cf5',
            //     data: [

            //     ]
            //   },
              {
                name: 'Revenue',
                type: 'line',
                color: '#ed9e20',
                data: 
                   this.revenueYear.map(item => item.revenue)
                
              },
            //   {
            //     name: 'Ser234vice',
            //     type: 'line',
            //     color: '#ed9e20',
            //     data: [
            //         // 200030, 30303, 10303, 40303, 12303, 23030, 503030, 60303, 50303, 230300, 420300, 520300
            //     ]
            //   },
            ],
            credits: {
              enabled: false
            }
          })
        
          });
      }
    
    }
