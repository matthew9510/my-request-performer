import { Pipe, PipeTransform } from "@angular/core";
import { ValueTransformer } from "@angular/compiler/src/util";

@Pipe({
  name: "filterOriginalRequests",
})
export class FilterOriginalRequestsPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value !== undefined && value !== null) {
      return value.filter((req) => req.originalRequestId === req.id);
    } else {
      return null;
    }
  }
}
