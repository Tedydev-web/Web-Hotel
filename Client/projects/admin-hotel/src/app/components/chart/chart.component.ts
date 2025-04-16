import { Component, OnInit } from '@angular/core';
import { ViewChild } from "@angular/core";
import { Chart } from 'angular-highcharts';
import { ApiService } from '../../_service/api.service';
import { RevenueYear } from '../../models/revenue.model';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit{
    chart!: any
    constructor(private api: ApiService){}
    revenueYear!: any[]
    currentYear!: number;
    
   
      ngOnInit(): void {
        this.currentYear = new Date().getFullYear();
        this.api.getRevenueByYear(this.currentYear).subscribe((res)=>{
           this.revenueYear = res
            console.log(res);
            
           const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
           this.chart = new Chart({
            chart: {
              type: 'line',
              height: 325
            },
            title: {
              text: 'Beyond Hotel Statics Year'
            },
            xAxis: {
              
                categories: this.revenueYear.map(item => monthNames[item.month - 1])
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
                color: '#3986DD',
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
    
    // 'Jan',
    // 'Feb',
    // 'Mar',
    // 'Apr',
    // 'May',
    // 'Jun',
    // 'Jul',
    // 'Aug',
    // 'Sep',
    // 'Oct',
    // 'Nov',
    // 'Dec'