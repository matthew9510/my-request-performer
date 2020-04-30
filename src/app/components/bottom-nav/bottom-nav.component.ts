import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { EventService } from "../../services/event.service";

@Component({
  selector: "app-bottom-nav",
  templateUrl: "./bottom-nav.component.html",
  styleUrls: ["./bottom-nav.component.scss"],
})
export class BottomNavComponent implements OnInit {
  constructor(private eventService: EventService, private router: Router) {}

  ngOnInit() {
    if (localStorage.getItem("currentEventId")) {
      this.eventService.currentEventId = localStorage.getItem("currentEventId");
    }
  }
}
