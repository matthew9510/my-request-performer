import { Component, OnInit } from "@angular/core";
import { RequestsService } from "src/app/services/requests.service";
import { StripeService } from "@services/stripe.service";
import { EventService } from "src/app/services/event.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { BreakpointObserver } from "@angular/cdk/layout";
import { translate } from "@ngneat/transloco";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router, ActivatedRoute } from "@angular/router";
import { Requests } from "../../interfaces/requests";
import { interval, Subscription } from "rxjs";
import { OrderPipe } from "ngx-order-pipe";
import { HostListener } from "@angular/core";

@Component({
  selector: "app-requests",
  templateUrl: "./requests.component.html",
  styleUrls: ["./requests.component.scss"],
})
export class RequestsComponent implements OnInit {
  eventId: string;
  eventStatus: string;
  acceptedRequests: any[]; //todo - alter Requests interfact to hold topUps property
  pendingRequests: Requests[];
  nowPlayingRequest: any = {
    song: null,
    artist: null,
    amount: null,
    memo: null,
    status: null,
  };
  currentlyPlaying: boolean = false;
  event: any;
  eventStatusMenuIcon: string = "fiber_manual_record";
  eventMenuStatus: string = "Inactive";
  pendingOrder: string = "modifiedOn";
  acceptedOrder: string = "modifiedOn";
  pendingReverse: boolean = false;
  acceptedReverse: boolean = false;
  acceptedTabLabel: string = "Accepted";
  pendingTabLabel: string = "Pending";
  pollingSubscription: Subscription;
  hidden: string;
  visibilityChange: string;
  sortedAcceptedRequests: any;
  sortedPendingRequests: any;

  constructor(
    public requestsService: RequestsService,
    public stripeService: StripeService,
    public eventService: EventService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private router: Router,
    private actRoute: ActivatedRoute,
    private orderPipe: OrderPipe
  ) {
    this.eventId = this.actRoute.snapshot.params.id;
  }

  ngOnInit() {
    this.onGetEventById();
    this.onGetRequestsByEventId();
    // checks browser so when browser is hidden/minimized it will stop polling the db for requests and enable polling when app is visible to the user
    if (typeof document.hidden !== "undefined") {
      // Opera 12.10 and Firefox 18 and later support
      this.hidden = "hidden";
      this.visibilityChange = "visibilitychange";
    } else if (typeof document["msHidden"] !== "undefined") {
      this.hidden = "msHidden";
      this.visibilityChange = "msvisibilitychange";
    } else if (typeof document["webkitHidden"] !== "undefined") {
      this.hidden = "webkitHidden";
      this.visibilityChange = "webkitvisibilitychange";
    }
    this.checkHiddenDocument();
  }

  ngOnDestroy() {
    this.pollingSubscription.unsubscribe();
  }

  // checks for changes in visibility
  @HostListener(`document:visibilitychange`, ["$event"])
  visibilitychange() {
    this.checkHiddenDocument();
  }

  // if document is hidden, polling will stop. when document is visible, polling will start again
  checkHiddenDocument() {
    if (document[this.hidden]) {
      if (this.pollingSubscription) {
        this.pollingSubscription.unsubscribe();
      }
    } else {
      this.onGetRequestsByEventId();
      this.setTabLabels();
      this.pollingSubscription = interval(10000).subscribe((x) => {
        this.onGetRequestsByEventId();
        this.setTabLabels();
      });
    }
  }

  navigateToErrorPage() {
    this.router.navigate(["/error"]);
  }

  // dynamically changes the count for accepted and pending requests on the tabs
  setTabLabels() {
    if (this.pendingRequests && this.pendingRequests.length > 0) {
      this.pendingTabLabel = `Pending (${this.pendingRequests.length})`;
    } else {
      this.pendingTabLabel = "Pending";
    }
    if (this.acceptedRequests && this.acceptedRequests.length > 0) {
      this.acceptedTabLabel = `Accepted (${this.acceptedRequests.length})`;
    } else {
      this.acceptedTabLabel = "Accepted";
    }
  }

  setPendingOrder(value: string) {
    if (this.pendingOrder === value) {
      this.pendingReverse = !this.pendingReverse;
    }
    this.pendingOrder = value;
    this.sortedPendingRequests = this.orderPipe.transform(
      this.pendingRequests,
      this.pendingOrder
    );
  }

  setAcceptedOrder(value: string) {
    if (this.acceptedOrder === value) {
      this.acceptedReverse = !this.acceptedReverse;
    }
    this.acceptedOrder = value;
    this.sortedAcceptedRequests = this.orderPipe.transform(
      this.acceptedRequests,
      value
    );
  }

  // checks the event id in url to check status
  onGetEventById() {
    this.eventService.getEvent(this.eventId).subscribe(
      (res: any) => {
        if (res.response !== undefined) {
          this.event = res.response.body.Item;
          this.eventStatus = this.event.status;
          this.eventService.currentEvent = this.event;
          this.eventService.currentEventId = this.event.id;

          // updates status menu appearance
          switch (this.eventStatus) {
            case "active":
              this.eventStatusMenuIcon = "play_circle_filled";
              this.eventMenuStatus = "Active";
              break;
            case "paused":
              this.eventStatusMenuIcon = "pause_circle_filled";
              this.eventMenuStatus = "Paused";
              break;
            case "completed":
              this.eventStatusMenuIcon = "remove_circle";
              this.eventMenuStatus = "Ended";
              break;
          }
        } else if (res.statusCode === 204) {
          this.navigateToErrorPage();
        }
      },
      (err) => this.navigateToErrorPage()
    );
  }

  onGetRequestsByEventId() {
    this.getPendingRequests();
    this.getAcceptedRequests();
    this.getNowPlayingRequests();
  }

  getPendingRequests() {
    this.requestsService
      .getRequestsByEventId(this.eventId, "pending")
      .subscribe(
        (res: any) => {
          if (res.response.statusCode === 204) {
            this.pendingRequests = null;
          } else {
            this.pendingRequests = res.response.body;
          }
          this.sortedPendingRequests = this.orderPipe.transform(
            this.pendingRequests,
            this.pendingOrder
          );
          this.setTabLabels();
        },
        (err) => {
          err;
        }
      );
  }

  getAcceptedRequests() {
    this.requestsService
      .getRequestsByEventId(this.eventId, "accepted")
      .subscribe(
        (res: any) => {
          if (res.response.statusCode === 204) {
            this.acceptedRequests = null;
          } else {
            // Method to remove duplicates and combine amounts of original requests and top ups
            // Note: res.response.body will have original requests before top-ups due to sorting by createdOn date
            this.acceptedRequests = res.response.body.reduce(
              (acc: any[], curr: any, currIndex: any, array: any) => {
                // if request is an original
                if (curr.id === curr.originalRequestId) {
                  curr.topUps = [];
                  acc.push(curr);
                } else {
                  // if request is a top-up
                  const originalRequestIndex = acc
                    .map((request) => request.id)
                    .indexOf(curr.originalRequestId);
                  // Needs a condition for the case of indexOf being -1 and throwing an error
                  if (originalRequestIndex >= 0) {
                    acc[originalRequestIndex].amount += curr.amount;
                    acc[originalRequestIndex].topUps.push(curr);
                  }
                }
                return acc;
              },
              []
            );
          }
          this.sortedAcceptedRequests = this.orderPipe.transform(
            this.acceptedRequests,
            this.acceptedOrder
          );
          this.setTabLabels();
        },
        (err) => {
          err;
        }
      );
  }

  getNowPlayingRequests() {
    this.requestsService
      .getRequestsByEventId(this.eventId, "now playing")
      .subscribe(
        (res: any) => {
          if (res.response.statusCode === 204) {
            this.currentlyPlaying = false;
            this.nowPlayingRequest = {
              song: null,
              artist: null,
              amount: null,
              memo: null,
              status: null,
              id: null,
            };
          } else {
            this.nowPlayingRequest = res.response.body.reduce(
              (acc: any[], curr: any, currIndex: any, array: any) => {
                // if request is an original
                if (curr.id === curr.originalRequestId) {
                  curr.topUps = [];
                  acc.push(curr);
                } else {
                  // if request is a top-up
                  const originalRequestIndex = acc
                    .map((request) => request.id)
                    .indexOf(curr.originalRequestId);
                  // Needs a condition for the case of indexOf being -1 and throwing an error
                  if (originalRequestIndex >= 0) {
                    acc[originalRequestIndex].amount += curr.amount;
                    acc[originalRequestIndex].topUps.push(curr);
                  }
                }
                return acc;
              },
              []
            )[0];
            this.currentlyPlaying = true;
          }
        },
        (err) => err
      );
  }

  get isLargeScreen() {
    return this.breakpointObserver.isMatched("(min-width: 700px)");
  }

  startEvent() {
    // changes on backend
    this.eventService.startEvent().subscribe(
      (res) => {
        // changes on front end
        this.eventStatus = "active";
        this.eventStatusMenuIcon = "play_circle_filled";
        this.eventMenuStatus = "Active";
        this.eventService.currentEvent.status = "active";
        return res;
      },
      (err) => err
    );
  }

  endEvent() {
    // changes on backend
    this.eventService.endEvent().subscribe((res: any) => {
      // changes on front end
      this.eventStatus = "completed";
      this.eventStatusMenuIcon = "remove_circle";
      this.eventMenuStatus = "Ended";
    });

    if (this.currentlyPlaying == true) {
      // if current song has top-ups alter the top-up statuses in db
      if (this.nowPlayingRequest.topUps.length > 0) {
        var topUpAmount = 0;
        for (let topUp of this.nowPlayingRequest.topUps) {
          let alteredTopUp = JSON.parse(JSON.stringify(topUp));
          alteredTopUp.status = "completed";
          this.onChangeRequestStatus(alteredTopUp, topUp.id);
          topUpAmount += topUp.amount;
        }
      }

      // change original request status
      let alteredNowPlayingRequest = JSON.parse(
        JSON.stringify(this.nowPlayingRequest)
      );
      alteredNowPlayingRequest.status = "completed";

      // subtract top-up amount if any
      if (topUpAmount > 0) {
        alteredNowPlayingRequest.amount -= topUpAmount;
      }
      // delete top-ups array from now playing request
      delete alteredNowPlayingRequest.topUps;

      this.onChangeRequestStatus(
        alteredNowPlayingRequest,
        this.nowPlayingRequest.id
      );

      this.currentlyPlaying = false;
      this.nowPlayingRequest = {
        song: null,
        artist: null,
        amount: null,
        memo: null,
        status: null,
        id: null,
      };
    }

    // reject all pending requests
    if (this.pendingRequests !== null) {
      this.pendingRequests.map((req) => (req.status = "rejected"));
      for (let request of this.pendingRequests) {
        this.onChangeRequestStatus(request, request.id);
      }
    }

    // reject all accepted Requests
    if (this.acceptedRequests !== null) {
      // for request in accepted requests
      for (let acceptedRequest of this.acceptedRequests) {
        let acceptedRequestToReject = this.acceptedRequests.filter(
          (req) => req.originalRequestId === acceptedRequest.originalRequestId
        )[0];

        // change top-up requests statuses if there are top-ups for a request to be rejected
        if (acceptedRequestToReject.topUps.length > 0) {
          var topUpAmount = 0;
          for (let topUp of acceptedRequestToReject.topUps) {
            let alteredTopUp = JSON.parse(JSON.stringify(topUp));
            alteredTopUp.status = "rejected";
            this.onChangeRequestStatus(alteredTopUp, topUp.id);
            topUpAmount += topUp.amount;
          }
        }

        // change original request status
        let alteredOriginalRequest = JSON.parse(
          JSON.stringify(acceptedRequestToReject)
        );
        alteredOriginalRequest.status = "rejected";
        // subtract topup amount if any
        if (topUpAmount > 0) {
          alteredOriginalRequest.amount -= topUpAmount;
        }
        // delete top up
        delete alteredOriginalRequest.topUps;
        this.onChangeRequestStatus(
          alteredOriginalRequest,
          acceptedRequestToReject.id
        );
      }
    }
    this.router.navigate([`/history/${this.eventId}`]);
  }

  pauseEvent() {
    // changes on backend
    this.eventService.pauseEvent().subscribe((res: any) => {
      // changes on front end
      this.eventStatus = "paused";
      this.eventStatusMenuIcon = "pause_circle_filled";
      this.eventMenuStatus = "Paused";
    });
  }

  openSnackBar(message: string) {
    let durationSeconds = 2;
    this._snackBar.open(message, "Dismiss", {
      duration: durationSeconds * 1000,
      verticalPosition: "bottom",
    });
  }

  openRejectRequestDialog(request: any, requestType: string): void {
    const message = translate("request confirm dialog message");
    const title = translate("request confirm dialog title");
    const action = translate("request confirm dialog action");
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "300px",
      data: {
        title,
        message,
        action,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      const message = translate("snackbar message rejected");
      if (result) {
        this.rejectRequest(request, requestType);
        this.openSnackBar(message);
      }
    });
  }

  openEndEventDialog(): void {
    const message = translate("event confirm dialog message");
    const title = translate("event confirm dialog title");
    const action = translate("event confirm dialog action");
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: "300px",
      data: {
        title,
        message,
        action,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      const message = translate("snackbar event ended");
      if (result) {
        this.endEvent();
        this.openSnackBar(message);
      }
    });
  }

  acceptRequest(request: any) {
    request.status = "accepted";
    const updatedReq = request;
    // this.pendingRequests.splice(index, index + 1);
    this.onChangeRequestStatus(updatedReq, request.id);
    const message = translate("snackbar message accepted");
    this.openSnackBar(message);
  }

  rejectRequest(request: any, requestType: string) {
    if (requestType === "acceptedRequests") {
      // This is done because of top-ups (top-up requests)
      let acceptedRequestToReject = this.acceptedRequests.filter(
        (req) => req.originalRequestId === request.originalRequestId
      )[0];

      // change top-up requests statuses if there are top-ups for a request to be rejected
      if (acceptedRequestToReject.topUps.length > 0) {
        var topUpAmount = 0;
        for (let topUp of acceptedRequestToReject.topUps) {
          let alteredTopUp = JSON.parse(JSON.stringify(topUp));
          alteredTopUp.status = "rejected";
          this.onChangeRequestStatus(alteredTopUp, topUp.id);
          topUpAmount += topUp.amount;
        }
      }

      // change original request status
      let alteredOriginalRequest = JSON.parse(
        JSON.stringify(acceptedRequestToReject)
      );
      alteredOriginalRequest.status = "rejected";
      // subtract topup amount if any
      if (topUpAmount > 0) {
        alteredOriginalRequest.amount -= topUpAmount;
      }
      delete alteredOriginalRequest.topUps;
      this.onChangeRequestStatus(
        alteredOriginalRequest,
        acceptedRequestToReject.id
      );
    }
    if (requestType === "pendingRequests") {
      // note no top-ups for a pending request
      // change original request status
      let alteredOriginalPendingRequest = JSON.parse(JSON.stringify(request));
      alteredOriginalPendingRequest.status = "rejected";
      this.onChangeRequestStatus(alteredOriginalPendingRequest, request.id);
    }
  }

  endCurrentSong() {
    if (this.currentlyPlaying) {
      // if current song has top-ups alter the top-up statuses in db
      if (this.nowPlayingRequest.topUps.length > 0) {
        var topUpAmount = 0;
        for (let topUp of this.nowPlayingRequest.topUps) {
          let alteredTopUp = JSON.parse(JSON.stringify(topUp));
          alteredTopUp.status = "completed";
          this.onChangeRequestStatus(alteredTopUp, topUp.id);
          topUpAmount += topUp.amount;
        }
      }

      // change original request status
      let alteredNowPlayingRequest = JSON.parse(
        JSON.stringify(this.nowPlayingRequest)
      );
      alteredNowPlayingRequest.status = "completed";

      // subtract top-up amount if any
      if (topUpAmount > 0) {
        alteredNowPlayingRequest.amount -= topUpAmount;
      }
      // delete top-ups array from now playing request
      delete alteredNowPlayingRequest.topUps;

      this.onChangeRequestStatus(
        alteredNowPlayingRequest,
        this.nowPlayingRequest.id
      );
    }
    this.currentlyPlaying = false;
    this.nowPlayingRequest = {
      song: null,
      artist: null,
      amount: null,
      memo: null,
      status: null,
      id: null,
    };
    const message = translate("snackbar song ended");
    this.openSnackBar(message);
  }

  playNext(request: any) {
    this.endCurrentSong();

    let requestToPlay = this.acceptedRequests.filter(
      (req) => req.originalRequestId === request.originalRequestId
    )[0];

    // if request has top-ups alter the top-up statuses in db
    if (requestToPlay.topUps.length > 0) {
      var topUpAmount = 0;
      for (let topUp of requestToPlay.topUps) {
        let alteredTopUp = JSON.parse(JSON.stringify(topUp));
        alteredTopUp.status = "now playing";
        this.onChangeRequestStatus(alteredTopUp, topUp.id);
        topUpAmount += topUp.amount;
      }
    }

    // change original request status
    let alteredRequestToPlay = JSON.parse(JSON.stringify(requestToPlay));
    alteredRequestToPlay.status = "now playing";

    // subtract top-up amount if any
    if (topUpAmount) {
      alteredRequestToPlay.amount -= topUpAmount;
    }
    // delete top-ups array from now playing request
    delete alteredRequestToPlay.topUps;

    this.onChangeRequestStatus(alteredRequestToPlay, requestToPlay.id);

    this.nowPlayingRequest = {
      song: request.song,
      artist: request.artist,
      amount: request.amount,
      memo: request.memo,
      status: request.status,
      id: request.id,
      originalRequestId: request.originalRequestId,
    };
    const message = translate("snackbar now playing");
    this.openSnackBar(`${this.nowPlayingRequest.song} ${message}`);
  }

  onChangeRequestStatus(request, requestId: string | number) {
    if (request.amount > 0 && request.status === "now playing") {
      this.stripeService.capturePaymentIntent(request).subscribe(
        (res) => {
          this.onGetRequestsByEventId();
        },
        (err: any) => err
      );
    } else if (request.amount > 0 && request.status === "rejected") {
      // cancel the stripe payment intent

      const payload = {
        status: request.status,
        paymentIntentId: request.paymentIntentId,
        performerStripeId: request.performerStripeId,
      };

      // prepare the payload
      this.stripeService.cancelPaymentIntent(payload, request.id).subscribe(
        (res) => {
          this.onGetRequestsByEventId();
        },
        (err: any) => err
      );
    } else {
      // for free requests
      this.requestsService
        .changeRequestStatus(request, requestId)
        .subscribe((res) => {
          this.onGetRequestsByEventId();
        }),
        (err: any) => err;
    }
  }
}
