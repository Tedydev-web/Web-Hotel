import { ServiceAttach } from "./serviceAttach.model"

export class Room {
  id!: string
  roomNumber!: string
  name!: string
  isActive!: boolean
  description!: string
  roomPicture!: string
  roomPictures!: string
  starSum!: string
  starAmount!: number
  numberOfSimpleBed!: string
  numberOfDoubleBed!: string
  currentPrice!: number
  discountPrice!: number
  discount!: number // Thêm thuộc tính discount
  roomTypeId!: number
  roomTypeName!: string
  peopleNumber!: string
  serviceAttachs!: ServiceAttach[]
  rooms!: number;
  resultPrice!: number;
}

export interface Roomsearch {
  id: number;
  name: string;
  numOfGuests: number;
  roomType: string;
}
