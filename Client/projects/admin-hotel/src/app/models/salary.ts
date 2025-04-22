export class Salary {
   id!: string
   basicSalary!: number
   bonusSalary?: number
   workDays!: number
   workTime!: Date
   employeeId!: string
   employeeName!: string
   position!: string
   // Keeping the legacy field for backward compatibility
   numberOfDays?: number
   allowance?: number
}
