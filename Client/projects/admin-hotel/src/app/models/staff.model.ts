export class Staff {
   id!: string
   userName!: string
   email!: string
   lockoutEnd!: string
   name!: string
   address!: string
   cmnd!: number
   image!: string
   phoneNumber!: number
   createdAt!: Date
   emailConfirmed!: string
   lockoutEnabled!: string
   accessFailedCount!: string
   
   // Thêm các thuộc tính mở rộng cho component Employee
   department?: string        // Phòng ban
   position?: string          // Chức vụ
   salary?: number            // Lương
}
