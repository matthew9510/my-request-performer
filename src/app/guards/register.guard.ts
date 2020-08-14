import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { PerformerService } from "../services/performer.service";

@Injectable({
  providedIn: "root",
})
export class RegisterGuard implements CanActivate {
  constructor(private performerService: PerformerService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // prevents performer from creating a new event if they have not completed registration
    return this.performerService.isSignedUp;
  }
}
