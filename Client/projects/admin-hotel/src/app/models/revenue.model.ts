export interface Revenue {
  year: number;
  result: RevenueComponent[]
}
export interface RevenueComponent {
    sumCustomer: number;
    sumReservation: number;
    sumRevenue: number;
}
export interface RevenueYear {
    month: number;
    revenue: number;
}