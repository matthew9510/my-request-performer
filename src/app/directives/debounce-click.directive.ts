import {
  Directive,
  HostListener,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Subject, pipe, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Directive({
  selector: "[appDebounceClick]",
})
export class DebounceClickDirective implements OnInit, OnDestroy {
  @Output() debounceClick = new EventEmitter();
  private clicks = new Subject();
  $subjectObservable = this.clicks.asObservable();
  private subscription: Subscription;

  constructor() {}

  ngOnInit() {
    this.subscription = this.$subjectObservable
      .pipe(debounceTime(500))
      .subscribe((e) => {
        this.debounceClick.emit(e);
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener("click", ["$event"])
  clickEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }
}
