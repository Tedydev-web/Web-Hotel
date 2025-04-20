import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ApiService } from '../../../_service/api.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
    selector: 'app-pie-chart',
    templateUrl: './pie-chart.component.html',
    styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {
    chart!: Chart;
    revenueForRoom!: any[];
    totalPrice!: number;
    percentRoomType!: string;
    currentYear!: number;
    loading = false;
    
    constructor(private api: ApiService) { }
  
    ngOnInit(): void {
        this.currentYear = new Date().getFullYear();
        this.fetchData();
    }
  
    fetchData(): void {
        this.loading = true;
        this.api.getRevenueForRoom(this.currentYear)
            .pipe(
                catchError(error => {
                    console.error('Lỗi khi tải dữ liệu biểu đồ tròn:', error);
                    return of([]);
                }),
                finalize(() => this.loading = false)
            )
            .subscribe((res: any) => {
                if (res && res.length > 0) {
                    this.revenueForRoom = res;
                    this.calculateTotalPrice();
                    this.generateChart();
                } else {
                    this.revenueForRoom = [];
                    this.totalPrice = 0;
                    this.generateEmptyChart();
                }
            });
    }
  
    calculateTotalPrice(): void {
        let totalPrice = 0;
        for (let i = 0; i < this.revenueForRoom.length; i++) {
            totalPrice += this.revenueForRoom[i].price;
        }
        this.totalPrice = totalPrice;
    }
    
    randomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    generateChart(): void {
        const chartData = [];
        for (let i = 0; i < this.revenueForRoom.length; i++) {
            const dataItem = {
                name: this.revenueForRoom[i].typeRoomName,
                y: Math.round((this.revenueForRoom[i].price / this.totalPrice) * 100),
                color: this.randomColor(),
            };
            chartData.push(dataItem);
        }
  
        this.chart = new Chart({
            chart: {
                type: 'pie',
                height: 500,
                width: 500
            },
            title: {
                text: 'The best rooms type in year'
            },
            xAxis: {
                categories: this.revenueForRoom.map(item => item.typeRoomName)
            },
            yAxis: {
                title: {
                    text: 'Revenue in %'
                }
            },
            tooltip: {
                valueSuffix: '%'
            },
            series: [
                {
                    type: 'pie',
                    data: chartData
                }
            ],
            credits: {
                enabled: false
            }
        });
    }
    
    generateEmptyChart(): void {
        const defaultData = [
            { name: 'Không có dữ liệu', y: 100, color: '#cccccc' }
        ];
        
        this.chart = new Chart({
            chart: {
                type: 'pie',
                height: 500,
                width: 500
            },
            title: {
                text: 'The best rooms type in year'
            },
            tooltip: {
                valueSuffix: '%'
            },
            series: [
                {
                    type: 'pie',
                    data: defaultData
                }
            ],
            credits: {
                enabled: false
            }
        });
    }
}