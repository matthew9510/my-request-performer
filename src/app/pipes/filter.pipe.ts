import { Pipe, PipeTransform } from '@angular/core';
import {Events} from '../services/event.service';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: Events[], searchText: string) : any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter( it => {
      return it.title.toLowerCase().includes(searchText) || it.venue.toLowerCase().includes(searchText);
    });
  };
}
