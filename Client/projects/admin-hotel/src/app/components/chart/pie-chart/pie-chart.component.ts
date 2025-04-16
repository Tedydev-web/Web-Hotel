import { Component, OnInit } from '@angular/core';
import { Chart } from 'angular-highcharts';
import { ApiService } from '../../../_service/api.service';
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
    constructor(private api: ApiService) { }
  
    ngOnInit(): void {
        this.currentYear = new Date().getFullYear();
      this.fetchData();
    }
  
    fetchData(): void {
      this.api.getRevenueForRoom(this.currentYear)
        .subscribe((res: any) => {
          this.revenueForRoom = res;
          this.calculateTotalPrice();
          this.generateChart();
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
  }