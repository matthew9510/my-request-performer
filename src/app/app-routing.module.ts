import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestsComponent } from './components/requests/requests.component';
import { ManageEventsComponent } from './components/manage-events/manage-events.component';


const routes: Routes = [
  { path: '', redirectTo: 'requests', pathMatch: 'full'},
  { path: 'requests', component: RequestsComponent},
  { path: 'events', component: ManageEventsComponent },
  {path: '**',  redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
