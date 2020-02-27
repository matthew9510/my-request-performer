import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestsComponent } from './components/requests/requests.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PayoutComponent } from './components/dashboard/payout/payout.component';
import { HistoryComponent } from './components/dashboard/history/history.component';
import { ProfileComponent } from './components/dashboard/profile/profile.component';
import { ManageEventsComponent } from './components/manage-events/manage-events.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { LoginComponent} from './components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'payout', component: PayoutComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'requests', component: RequestsComponent },
  { path: 'events', component: ManageEventsComponent },
  { path: 'create-event', component: CreateEventComponent },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
