import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  constructor(
    public matTabsModule: MatTabsModule,
    public matCardModule: MatCardModule,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.testQueue().subscribe((data) => { console.log(data); });
    this.authService.testImage().subscribe((data) => { console.log(data); });
    this.authService.testEvent().subscribe((data) => { console.log(data); });
    this.authService.testRequestsEvent().subscribe((data) => { console.log(data); });
  }

}
