import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { RequestsComponent } from "./components/requests/requests.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { PayoutComponent } from "./components/dashboard/payout/payout.component";
import { HistoryComponent } from "./components/dashboard/history/history.component";
import { ProfileComponent } from "./components/dashboard/profile/profile.component";
import { ManageEventsComponent } from "./components/manage-events/manage-events.component";
import { CreateEventComponent } from "./components/create-event/create-event.component";
import { LoginComponent } from "./components/login/login.component";
import { AuthGuard } from "./guards/auth.guard";
import { NotAuthGuard } from "./guards/not-auth.guard";

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "dashboard",
    component: DashboardComponent,
    data: { title: "Dashboard" },
    canActivate: [NotAuthGuard],
  },
  {
    path: "payout",
    component: PayoutComponent,
    data: { title: "Payout" },
    canActivate: [NotAuthGuard],
  },
  {
    path: "history/:id",
    component: HistoryComponent,
    data: { title: "Event Recap" },
    canActivate: [NotAuthGuard],
  },
  // Removing access to this component until it is functional

  // {
  //   path: "profile",
  //   component: ProfileComponent,
  //   data: { title: "Profile" },
  //   canActivate: [NotAuthGuard],
  // },
  {
    path: "event/:id",
    component: RequestsComponent,
    data: { title: "Requests" },
    canActivate: [NotAuthGuard],
  },
  {
    path: "events",
    component: ManageEventsComponent,
    data: { title: "Manage Events" },
    canActivate: [NotAuthGuard],
  },
  {
    path: "create-event",
    component: CreateEventComponent,
    data: { title: "Create Event" },
    canActivate: [NotAuthGuard],
  },
  {
    path: "event/:id/clone",
    component: CreateEventComponent,
    data: { title: "Edit Event" },
    canActivate: [NotAuthGuard],
  },
  {
    path: "login",
    component: LoginComponent,
    data: { title: "Log in" },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
