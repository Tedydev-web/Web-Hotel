import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], searchTerm: string, fieldValue?: any): any[] {
        if (!items) {
          return [];
        }
        
        if (!searchTerm) {
          return items;
        }
    
        // Nếu có tham số thứ 3, lọc theo trường và giá trị cụ thể
        if (fieldValue !== undefined) {
          return items.filter(item => {
            return item[searchTerm] === fieldValue;
          });
        }

        // Nếu chỉ có searchTerm, thực hiện tìm kiếm thông thường
        searchTerm = searchTerm.toLowerCase();
    
        return items.filter((item) => {
          // Thực hiện các điều kiện lọc tùy thuộc vào cấu trúc của dữ liệu phòng
          return (item.name && item.name.toLowerCase().includes(searchTerm)) ||
          (item.roomTypeName && item.roomTypeName.toLowerCase().includes(searchTerm)) ||
          (item.roomNumber && item.roomNumber.toLowerCase().includes(searchTerm)) 
        //   item.discountCode.toLowerCase().includes(searchTerm) 
        });
      }
}
