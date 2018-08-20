import { Pipe, PipeTransform } from '@angular/core';
import { ISelection } from './selection.interface';

// Filter given data by specified field and value.
// In our case it filters existing highlights by active color.
@Pipe({ name: 'filterSelections', pure: false })
export class FilterSelectionsPipe implements PipeTransform {
  transform(arr: ISelection[], field: string, value: string): ISelection[] {
    if (arr && value) {
      return arr.filter(item => item[field] === value);
    } else if (arr && !value) {
      return arr;
    }
    return [];
  }
}
