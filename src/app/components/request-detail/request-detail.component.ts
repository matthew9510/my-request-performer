import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.scss']
})
export class RequestDetailComponent implements OnInit {
  @Input() artist: string;
  @Input() song: string;
  @Input() amount: number;
  @Input() status: string;
  @Output() updatedStatus = new EventEmitter();
  left = 0;

  @ViewChild('parentTag', {static: false})
  parentTag: ElementRef; 

  @ViewChild('target', {static: false})
  target: ElementRef;

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
  }

  changeStatus(status) {
    this.updatedStatus.emit(status);
  }

  rejectRequest() {
    this.changeStatus('rejected');
  }

  acceptRequest() {
    this.changeStatus('accepted');
  }

  move(){
    let left = this.target.nativeElement.scrollWidth - this.parentTag.nativeElement.clientWidth;
    this.renderer.setStyle(this.target.nativeElement, 'margin-left', '-'+left+'px');
  }

  stop(){
    this.renderer.setStyle(this.target.nativeElement, 'margin-left', '0px');
  }


}
