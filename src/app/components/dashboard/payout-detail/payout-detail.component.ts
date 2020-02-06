import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-payout-detail',
  templateUrl: './payout-detail.component.html',
  styleUrls: ['./payout-detail.component.scss']
})
export class PayoutDetailComponent implements OnInit {
  @Input() artist: string;
  @Input() song: string;
  @Input() amount: number;

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
  }

}
