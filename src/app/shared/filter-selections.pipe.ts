import { Pipe, PipeTransform } from '@angular/core';
import { ISelection } from './selection.interface';

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
