import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EventdetailsComponent } from './components/event-detail/event-detail.component';
import { ManageEventsComponent } from './components/manage-events/manage-events.component';
import { RequestsComponent } from './components/requests/requests.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PayoutComponent } from './components/dashboard/payout/payout.component';
import { HistoryComponent } from './components/dashboard/history/history.component';
import { ProfileComponent } from './components/dashboard/profile/profile.component';
import { HttpClientModule } from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { TranslocoRootModule } from './transloco-root.module';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import {
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatFormFieldModule,
  MatSelectModule,
  MatCheckboxModule,
  MatChipsModule,
  MatCardModule,
  MatGridListModule,
  MatTabsModule,
  MatListModule,
  MatDialogModule, MatInputModule,
} from '@angular/material';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { FilterPipe } from './pipes/filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    PayoutComponent,
    HistoryComponent,
    ProfileComponent,
    EventdetailsComponent,
    ManageEventsComponent,
    RequestsComponent,
    RequestDetailComponent,
    ConfirmDialogComponent,
    BottomNavComponent,
    FilterPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoRootModule,
    MatButtonModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatGridListModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    HttpClientModule,
    TranslocoRootModule,
    ScrollingModule,
    FormsModule,
  ],
  providers: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
