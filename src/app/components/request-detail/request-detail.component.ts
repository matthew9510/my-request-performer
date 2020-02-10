import { Component, OnInit, Input } from '@angular/core';

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
  @Input() createdOn: string;


  constructor() { }

  ngOnInit() {
  }


}