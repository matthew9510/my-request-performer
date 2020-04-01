import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items, searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();
    return items.filter(it => {
      return it.title.toLowerCase().includes(searchText)
      // until the venue issues are resolved, this needs to be commented out or it will break the filter
      //  || it.venue.toLowerCase().includes(searchText);
    });
  };
}
