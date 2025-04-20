import { Component, OnInit } from '@angular/core';
import { ViewChild } from "@angular/core";
import { Chart } from 'angular-highcharts';
import { ApiService } from '../../_service/api.service';
import { RevenueYear } from '../../models/revenue.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit{
    chart!: any
    loading = false;
    constructor(private api: ApiService){}
    revenueYear!: any[]
    currentYear!: number;
    
   
    ngOnInit(): void {
        this.loading = true;
        this.currentYear = new Date().getFullYear();
        this.api.getRevenueByYear(this.currentYear)
        .pipe(
            catchError(error => {
                console.error('Lỗi khi tải dữ liệu cho biểu đồ:', error);
                return of([]);
            }),
            finalize(() => this.loading = false)
        )
        .subscribe((res) => {
            if (res && res.length > 0) {
                this.revenueYear = res;
                this.generateChart();
            } else {
                // Xử lý trường hợp không có dữ liệu
                this.revenueYear = [];
                this.generateEmptyChart();
            }
        });
    }

    generateChart(): void {
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
              {
                name: 'Revenue',
                type: 'line',
                color: '#3986DD',
                data: this.revenueYear.map(item => item.revenue)
              },
            ],
            credits: {
              enabled: false
            }
        });
    }

    generateEmptyChart(): void {
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
                categories: monthNames
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
              {
                name: 'Revenue',
                type: 'line',
                color: '#3986DD',
                data: Array(12).fill(0)
              },
            ],
            credits: {
              enabled: false
            }
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