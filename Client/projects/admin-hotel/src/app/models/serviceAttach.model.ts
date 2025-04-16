export class ServiceAttach {
  id!: number
  name!: string
  icon!: string
  description!: string
  priceDiscount!: number
}
export class OrderService {
  amount!: number
  serviceRoomId!: string
  reservationId!: string
}
export class OrderServiceAdmin {
    id!: number;
    serviceName!: string
    price!: number
    amount!: number
    creatorEmail!: string
    reservationId!: string
}
