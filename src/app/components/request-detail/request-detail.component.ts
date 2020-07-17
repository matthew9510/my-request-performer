import { Component, OnInit, Input } from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";

@Component({
  selector: "app-request-detail",
  templateUrl: "./request-detail.component.html",
  styleUrls: ["./request-detail.component.scss"],
})
export class RequestDetailComponent implements OnInit {
  @Input() artist: string;
  @Input() song: string;
  @Input() amount: any;
  @Input() memo: string;
  @Input() status: string;
  @Input() createdOn: string;
  @Input() amountOfTopUps: number;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    console.log(this.amount);
    if (this.amount === "") {
      this.amount = 0;
    }
    console.log(this.amount);
  }

  get isSmallScreen() {
    return this.breakpointObserver.isMatched("(max-width: 450px)");
  }

  get isLargeScreen() {
    return this.breakpointObserver.isMatched("(min-width: 700px)");
  }
}
