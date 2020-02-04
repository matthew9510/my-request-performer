import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatCardModule } from '@angular/material';
import 'hammerjs';
import { PayoutComponent } from './components/dashboard/payout/payout.component';
import { HistoryComponent } from './components/dashboard/history/history.component';
import { ProfileComponent } from './components/dashboard/profile/profile.component';
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PayoutComponent,
    HistoryComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatCardModule,
    HttpClientModule,
    TranslocoRootModule
  ],
  providers: [
    HttpClientModule,
    TranslocoRootModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
