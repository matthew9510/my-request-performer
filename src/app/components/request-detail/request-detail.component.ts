import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-request-detail',
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.scss']
})
export class RequestDetailComponent implements OnInit {
  @Input() requests: any;

  constructor() { }

  ngOnInit() {
    this.showRequest()
  }


  showRequest() {
    console.log(this.requests)
  }
}
