import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestsComponent } from './components/requests/requests.component';


const routes: Routes = [
  { path: '**', redirectTo: 'requests', pathMatch: 'full' },
  { path: 'requests', component: RequestsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
