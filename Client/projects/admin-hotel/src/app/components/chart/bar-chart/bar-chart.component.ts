import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../_service/api.service';
import { Chart } from 'angular-highcharts';
import { catchError, finalize, of } from 'rxjs';

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
    chart!: any
    loading = false;
    constructor(private api: ApiService){}
    revenueYear!: any[]
    currentYear!: number;
    currentMonth!: number;
    
    ngOnInit(): void {
        this.loading = true;
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth() + 1;
        this.api.getRevenueByMonth(this.currentMonth, this.currentYear)
        .pipe(
            catchError(error => {
                console.error('Lỗi khi tải dữ liệu cho biểu đồ hàng tháng:', error);
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
              text: 'Beyond Hotel Statics Month'
            },
            xAxis: {
                categories: this.revenueYear.map(item => item.day)
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
                color: '#ed9e20',
                data: this.revenueYear.map(item => item.revenue)
              },
            ],
            credits: {
              enabled: false
            }
        });
    }

    generateEmptyChart(): void {
        // Tạo mảng các ngày trong tháng hiện tại
        const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
        const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);
        
        this.chart = new Chart({
            chart: {
              type: 'line',
              height: 325
            },
            title: {
              text: 'Beyond Hotel Statics Month'
            },
            xAxis: {
                categories: daysArray.map(String)
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
                color: '#ed9e20',
                data: Array(daysInMonth).fill(0)
              },
            ],
            credits: {
              enabled: false
            }
        });
    }
}
