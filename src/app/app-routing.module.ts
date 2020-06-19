import { NgModule, InjectionToken } from "@angular/core";
import { Routes, RouterModule, ActivatedRouteSnapshot } from "@angular/router";
import { RequestsComponent } from "./components/requests/requests.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { PayoutComponent } from "./components/dashboard/payout/payout.component";
import { HistoryComponent } from "./components/dashboard/history/history.component";
import { ProfileComponent } from "./components/dashboard/profile/profile.component";
import { ManageEventsComponent } from "./components/manage-events/manage-events.component";
import { CreateEventComponent } from "./components/create-event/create-event.component";
import { LoginComponent } from "./components/login/login.component";
import { ForgotPasswordComponent } from "./components/forgot-password/forgot-password.component";
import { EventOverviewComponent } from "./components/event-overview/event-overview.component";
import { AdminComponent } from "./components/admin/admin.component";
import { ErrorPageComponent } from "./components/error-page/error-page.component";
import { RedirectComponent } from "./components/redirect/redirect.component";
import { AuthGuard } from "./guards/auth.guard";
import { NotAuthGuard } from "./guards/not-auth.guard";
import { AdminGuard } from "./guards/admin.guard";
import { RegisterGuard } from "./guards/register.guard";

// Needed for redirecting to stripe for oath flow
const externalUrlProvider = new InjectionToken("externalUrlRedirectResolver");

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "admin",
    component: AdminComponent,
    canActivate: [NotAuthGuard, AdminGuard],
  },
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
  {
    path: "profile",
    component: ProfileComponent,
    data: { title: "Profile" },
    canActivate: [NotAuthGuard],
  },
  {
    path: "event/:id",
    component: RequestsComponent,
    data: { title: "Requests" },
    canActivate: [NotAuthGuard],
  },
  {
    path: "event-overview/:id",
    component: EventOverviewComponent,
    data: { title: "Event Details" },
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
    canActivate: [NotAuthGuard, RegisterGuard],
  },
  {
    path: "event/:id/clone",
    component: CreateEventComponent,
    data: { title: "Edit Event" },
    canActivate: [NotAuthGuard, RegisterGuard],
  },
  {
    path: "login",
    component: LoginComponent,
    data: { title: "Log in" },
    canActivate: [AuthGuard],
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
    data: { title: "Forgot Password" },
    canActivate: [AuthGuard],
  },
  {
    path: "externalRedirect",
    resolve: {
      url: externalUrlProvider,
    },
    component: RedirectComponent,
  },
  {
    path: "error",
    component: ErrorPageComponent,
    data: { title: "404 Error: Page Not Found" },
    canActivate: [NotAuthGuard],
  },
  {
    path: "**",
    component: DashboardComponent,
  },
  {
    path: "**",
    component: ErrorPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: externalUrlProvider,
      useValue: (route: ActivatedRouteSnapshot) => {
        const externalUrl = route.paramMap.get("externalUrl");
        window.open(externalUrl, "_self");
      },
    },
  ],
})
export class AppRoutingModule {}
