import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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

  constructor() { }

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


}
