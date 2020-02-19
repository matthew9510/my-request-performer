import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestsComponent } from './components/requests/requests.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PayoutComponent } from './components/dashboard/payout/payout.component';
import { HistoryComponent } from './components/dashboard/history/history.component';
import { ProfileComponent } from './components/dashboard/profile/profile.component';
import { ManageEventsComponent } from './components/manage-events/manage-events.component';
import { CreateEventComponent } from './components/create-event/create-event.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
  { path: 'payout', component: PayoutComponent, data: { title: 'Payout' } },
  { path: 'history', component: HistoryComponent, data: { title: 'Histoy' } },
  { path: 'profile', component: ProfileComponent, data: { title: 'Profile' } },
  { path: 'requests', component: RequestsComponent, data: { title: 'Requests' } },
  { path: 'events', component: ManageEventsComponent, data: { title: 'ManageEvents' } },
  { path: 'create-event', component: CreateEventComponent, data: { title: 'create-event' } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
