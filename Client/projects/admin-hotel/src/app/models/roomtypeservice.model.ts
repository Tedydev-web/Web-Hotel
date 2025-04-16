import { ServiceAttach } from "./serviceAttach.model"

export class RoomTypeService {
  id!: string
  name!: string
  price!: number
  amount!: number
  picture!: string
  priceDiscount!: number
}
export class RoomAttachService {
  roomTypeId!: number
  serviceAttachId!: number
}

export class addRoom {
  roomNumber!: string
  name!: string
  isActive!: boolean
  description!: string
  roomPicture!: string
  roomPictures!: string
  numberOfSimpleBed!: string
  numberOfDoubleBed!: string
  currentPrice!: number
  roomTypeId!: number
  peopleNumber!: string
}
export class ServiceAttachDetail {
    id!: number
    roomTypeId!: number
    serviceAttachId!: number
}