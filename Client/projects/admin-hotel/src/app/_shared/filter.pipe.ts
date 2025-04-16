import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], searchTerm: string): any[] {
        if (!items || !searchTerm) {
          return items;
        }
    
        searchTerm = searchTerm.toLowerCase();
    
        return items.filter((item) => {
          // Thực hiện các điều kiện lọc tùy thuộc vào cấu trúc của dữ liệu phòng
          return item.name.toLowerCase().includes(searchTerm) ||
          item.roomTypeName.toLowerCase().includes(searchTerm) ||
          item.roomNumber.toLowerCase().includes(searchTerm) 
        //   item.discountCode.toLowerCase().includes(searchTerm) 
                 
        });
      }

}
