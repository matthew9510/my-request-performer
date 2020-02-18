import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public pageTitle: string;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,

  ) { }

  ngOnInit() {
    this.subscribeToRouteChangeEvents();
  }

  private setTitleFromRouteData(routeData) {
    if (routeData && routeData['title']) {
      this.pageTitle = routeData['title'];
    } else {
      this.pageTitle = 'No title';
    }
  }

  private getLatestChild(route) {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  private subscribeToRouteChangeEvents() {
    // Set initial title
    const latestRoute = this.getLatestChild(this.activeRoute);
    if (latestRoute) {
      this.setTitleFromRouteData(latestRoute.data.getValue());
    }
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activeRoute),
      map((route) => this.getLatestChild(route)),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data),
    ).subscribe((event) => {
      this.setTitleFromRouteData(event);
    });
  }

}
