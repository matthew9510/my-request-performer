import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatCardModule } from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  constructor(
    public matTabsModule: MatTabsModule,
    public matCardModule: MatCardModule
  ) { }

  ngOnInit() {
  }

}
