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
import { interval, Subscription, forkJoin } from "rxjs";
import { OrderPipe } from "ngx-order-pipe";
import { HostListener } from "@angular/core";
import { FormBuilder, FormGroup, AbstractControl } from "@angular/forms";

import { PerformerService } from "@services/performer.service";

@Component({
  selector: "app-requests",
  templateUrl: "./requests.component.html",
  styleUrls: ["./requests.component.scss"],
})
export class RequestsComponent implements OnInit {
  eventId: string;
  eventStatus: string;
  acceptedRequests: any[];
  pendingRequests: Requests[];
  nowPlayingRequest: any = {
    song: null,
    artist: null,
    amount: null,
    memo: null,
    status: null,
  };
  nowPlayingRequests: any[];
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
  requesterSortOrderForm: FormGroup;
  requesterClientSortOrders: string[] = ["modifiedOn", "amount"];
  isSecondaryRequestSortOrderLoaded = false;
  secondaryRequestSortOrder: string;
  updateRequesterClientSortOrderError: boolean = false;
  constructor(
    public requestsService: RequestsService,
    public stripeService: StripeService,
    public eventService: EventService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private router: Router,
    private actRoute: ActivatedRoute,
    private fb: FormBuilder,

    private orderPipe: OrderPipe,
    public performerService: PerformerService
  ) {
    this.eventId = this.actRoute.snapshot.params.id;
  }

  ngOnInit() {
    this.requesterSortOrderForm = this.fb.group({
      requesterClientSortOrder: ["modifiedOn"],
    });

    this.requesterSortOrderForm.controls.requesterClientSortOrder.valueChanges.subscribe(
      (newDesiredSortOrder: any) => {
        // This value will be set on init, so make sure we only update requester
        // client sort order if the performer changes the value from what is saved in the db
        if (
          this.event.requesterClientSortOrder !== newDesiredSortOrder &&
          !this.updateRequesterClientSortOrderError
        )
          this.updateRequesterClientSortOrder(newDesiredSortOrder);
        if (
          this.event.requesterClientSortOrder !== newDesiredSortOrder &&
          this.updateRequesterClientSortOrderError
        )
          this.updateRequesterClientSortOrderError = false;
      }
    );

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
      let numberOfAcceptedRequests = this.acceptedRequests.filter(
        (req) => req.originalRequestId === req.id
      ).length;
      this.acceptedTabLabel = `Accepted (${numberOfAcceptedRequests})`;
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
          this.requesterSortOrderForm.controls.requesterClientSortOrder.setValue(
            this.event.requesterClientSortOrder
          );

          // handling of if the event isn't the performers
          if (this.performerService.performer === undefined) {
            // load performer
            this.performerService
              .getPerformerInfoById(localStorage.getItem("performerSub"))
              .subscribe((res: any) => {
                if (res.response !== undefined) {
                  this.performerService.performer = res.response.body.Item;
                  if (
                    this.performerService.performer.id !==
                    this.event.performerId
                  ) {
                    // redirect to events because this is not the performers event
                    this.router.navigate(["/events"]);
                  }

                  // set appropriate sort orders and set flag to show correct sort order html elements
                  if (!this.performerService.isStripeAccountLinked) {
                    // render html content to sort by likes
                    // set a flag to show correct html elements
                    this.secondaryRequestSortOrder = "likes";
                    this.requesterClientSortOrders = ["modifiedOn", "likes"];
                    this.requesterSortOrderForm.controls.requesterClientSortOrder.setValue(
                      this.event.requesterClientSortOrder
                    );
                    // render html now that correct secondary request order is set
                    this.isSecondaryRequestSortOrderLoaded = true;
                  } else {
                    this.secondaryRequestSortOrder = "amount";
                    // render html now that correct secondary request order is set
                    this.isSecondaryRequestSortOrderLoaded = true;
                  }
                }
              });
            // check if the event owner is theirs and redirect if not
          } else {
            // check if the event owner is theirs and redirect if not
            if (this.performerService.performer.id !== this.event.performerId) {
              // redirect to events because this is not the performers event
              this.router.navigate(["/events"]);
            }

            // set appropriate sort orders and set flag to show correct sort order html elements
            if (!this.performerService.isStripeAccountLinked) {
              // render html content to sort by likes
              // set a flag to show correct html elements
              this.secondaryRequestSortOrder = "likes";
              this.requesterClientSortOrders = ["modifiedOn", "likes"];
              this.requesterSortOrderForm.controls.requesterClientSortOrder.setValue(
                this.event.requesterClientSortOrder
              );
              // render html now that correct secondary request order is set
              this.isSecondaryRequestSortOrderLoaded = true;
            } else {
              this.secondaryRequestSortOrder = "amount";
              // render html now that correct secondary request order is set
              this.isSecondaryRequestSortOrderLoaded = true;
            }
          }

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

  // Needed for getting accepted and now playing requests
  reshapeRequestsForDisplayPurposes(requests: any) {
    let reshapedRequests = [];
    let dictOfOriginalRequestIndexes = {};
    requests.forEach((request, index) => {
      // if original request add new property totalAmountToDisplay for
      // display purposes. Add the original request to the
      // reshapedRequests array, and store this element index in a
      // dictionary for O(1) lookup for accumulating totalAmountToDisplay
      // accurately.
      if (request.id === request.originalRequestId) {
        request = this.addNecessaryOriginalRequestPropertiesForDisplay(request);
        reshapedRequests.push(request);
        dictOfOriginalRequestIndexes[request.id] = index;
      }
      // if topup request locate original request index and add topup
      // amount to the original totalAmountToDisplay property, along
      // with adding the topup request to the reshapedRequests array
      else {
        let indexOfOriginal =
          dictOfOriginalRequestIndexes[request.originalRequestId];
        reshapedRequests[indexOfOriginal].totalAmountToDisplay +=
          request.amount;
        reshapedRequests[indexOfOriginal].numberOfTopUps += 1;
        reshapedRequests[indexOfOriginal].topUpIndexes.push(index);
        reshapedRequests.push(request);
      }
    });
    return reshapedRequests;
  }

  // Needed for getting accepted and now playing requests,
  // called when loading requests from db
  addNecessaryOriginalRequestPropertiesForDisplay(originalRequest) {
    // Add new properties to request for display purposes
    originalRequest.totalAmountToDisplay = originalRequest.amount;
    originalRequest.numberOfTopUps = 0;
    originalRequest.topUpIndexes = [];
    return originalRequest;
  }

  // Needed for getting accepted and now playing requests,
  // called when updating requests in the db
  removeNecessaryOriginalRequestPropertiesForDisplay(originalRequest) {
    delete originalRequest.totalAmountToDisplay;
    delete originalRequest.numberOfTopUps;
    delete originalRequest.topUpIndexes;
    return originalRequest;
  }

  getAcceptedRequests() {
    this.requestsService
      .getRequestsByEventId(this.eventId, "accepted")
      .subscribe(
        (res: any) => {
          if (res.response.statusCode === 204) {
            this.acceptedRequests = null;
          } else {
            this.acceptedRequests = this.reshapeRequestsForDisplayPurposes(
              res.response.body
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
            this.nowPlayingRequests = this.reshapeRequestsForDisplayPurposes(
              res.response.body
            );
            // original request will be the first element in the array
            this.nowPlayingRequest = this.nowPlayingRequests[0];
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

    let listOfAlteredRequestObservables = [];

    if (this.currentlyPlaying == true) {
      listOfAlteredRequestObservables.push(
        ...this.prepRequestsForStatusChange(this.nowPlayingRequest, "completed")
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
        listOfAlteredRequestObservables.push(
          this.onChangeRequestStatus(request, request.id)
        );
      }
    }

    // reject all accepted Requests
    if (this.acceptedRequests !== null) {
      for (let acceptedRequest of this.acceptedRequests) {
        // filter out the topups due to the implementation of the function
        // this.prepRequestsForStatusChange altering topups through it's logic
        if (acceptedRequest.id === acceptedRequest.originalRequestId) {
          listOfAlteredRequestObservables.push(
            ...this.prepRequestsForStatusChange(acceptedRequest, "rejected")
          );
        }
      }
    }
    forkJoin(listOfAlteredRequestObservables).subscribe(
      (res) => {
        this.router.navigate([`/history/${this.eventId}`]);
      },
      (err) => console.error(err)
    );
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

  updateRequesterClientSortOrder(newDesiredSortOrder) {
    // prepare new event values to update the database
    this.event.requesterClientSortOrder = newDesiredSortOrder;

    this.eventService.updateEvent(this.event.id, this.event).subscribe(
      (res: any) => {
        // update service value
        if (res.error === undefined) {
          // if success
          this.event = res.response;
          this.eventService.currentEvent = this.event;
          this.requesterSortOrderForm.controls.requesterClientSortOrder.setValue(
            this.event.requesterClientSortOrder
          );
        }
      },
      (err) => {
        // show a console.error saying couldn't update the requester client sort order
        console.error(
          "Cannot update the requester client sort order at this moment."
        );
        // set an error flag for requesterSortOrderForm.controls.requesterClientSortOrder
        // value changes function to not trigger an infinite loop
        this.updateRequesterClientSortOrderError = true;

        // reverse changes and set the requesterClientSortOrder back to its previous value
        let oldIndex = this.requesterClientSortOrders.indexOf(
          this.requesterSortOrderForm.controls.requesterClientSortOrder.value
        );
        if (oldIndex == 0) {
          this.requesterSortOrderForm.controls.requesterClientSortOrder.setValue(
            this.requesterClientSortOrders[1]
          );
          this.event.requesterClientSortOrder = this.requesterClientSortOrders[1];
          this.eventService.currentEvent = this.event;
        } else {
          this.requesterSortOrderForm.controls.requesterClientSortOrder.setValue(
            this.requesterClientSortOrders[0]
          );
          this.event.requesterClientSortOrder = this.requesterClientSortOrders[0];
          this.eventService.currentEvent = this.event;
        }
      }
    );
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
      if (result) {
        this.rejectRequest(request, requestType);
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
    this.onChangeRequestStatus(updatedReq, request.id).subscribe(
      (res) => {
        const message = translate("snackbar message accepted");
        this.openSnackBar(message);
        this.onGetRequestsByEventId();
      },
      (err) => {
        console.error(err);
      }
    );
  }

  rejectRequest(request: any, requestType: string) {
    if (requestType === "acceptedRequests") {
      let listOfAlteredRequestObservables = [];

      listOfAlteredRequestObservables = this.prepRequestsForStatusChange(
        request,
        "rejected"
      );

      forkJoin(listOfAlteredRequestObservables).subscribe(
        (res) => {
          const message = translate("snackbar message rejected");
          this.openSnackBar(message);
          this.onGetRequestsByEventId();
        },
        (err) => console.error(err)
      );
    }
    if (requestType === "pendingRequests") {
      // note no top-ups for a pending request
      // change original request status
      let alteredOriginalPendingRequest = JSON.parse(JSON.stringify(request));
      alteredOriginalPendingRequest.status = "rejected";
      this.onChangeRequestStatus(
        alteredOriginalPendingRequest,
        request.id
      ).subscribe(
        (res) => {
          const message = translate("snackbar message rejected");
          this.openSnackBar(message);
          this.onGetRequestsByEventId();
        },
        (err) => console.error(err)
      );
    }
  }

  endCurrentSong() {
    if (this.currentlyPlaying) {
      let listOfAlteredRequestObservables = [];

      listOfAlteredRequestObservables = this.prepRequestsForStatusChange(
        this.nowPlayingRequest,
        "completed"
      );
      forkJoin(listOfAlteredRequestObservables).subscribe(
        (res) => {
          this.currentlyPlaying = false;
          this.nowPlayingRequest = {
            song: null,
            artist: null,
            amount: null,
            memo: null,
            status: null,
            id: null,
          };

          this.onGetRequestsByEventId();
        },
        (err) => console.error(err)
      );
    } else {
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
  }

  playNext(request: any) {
    this.endCurrentSong();
    let listOfAlteredRequestObservables = [];

    listOfAlteredRequestObservables = this.prepRequestsForStatusChange(
      request,
      "now playing"
    );

    forkJoin(listOfAlteredRequestObservables).subscribe(
      (res) => {
        this.nowPlayingRequest = request;
        const message = translate("snackbar now playing");
        this.openSnackBar(`${this.nowPlayingRequest.song} ${message}`);
        this.onGetRequestsByEventId();
      },
      (err: any) => console.error(err)
    );
  }

  prepRequestsForStatusChange(originalRequest: any, desiredStatus: string) {
    let listOfAlteredRequestObservables = [];

    // change statuses of top-ups
    for (let topUpRequestIndex of originalRequest.topUpIndexes) {
      let topUp;
      // get topup from correct array based on the desired future status
      if (desiredStatus === "now playing" || desiredStatus === "rejected") {
        topUp = this.acceptedRequests[topUpRequestIndex];
      } else if (desiredStatus === "completed") {
        topUp = this.nowPlayingRequests[topUpRequestIndex];
      }
      let deepCopyOfTopUp = JSON.parse(JSON.stringify(topUp));
      deepCopyOfTopUp.status = desiredStatus;
      listOfAlteredRequestObservables.push(
        this.onChangeRequestStatus(deepCopyOfTopUp, topUp.id)
      );
    }

    // change original request status
    let deepCopyOfRequestToPlay = JSON.parse(JSON.stringify(originalRequest));
    deepCopyOfRequestToPlay = this.removeNecessaryOriginalRequestPropertiesForDisplay(
      deepCopyOfRequestToPlay
    );
    deepCopyOfRequestToPlay.status = desiredStatus;
    listOfAlteredRequestObservables.push(
      this.onChangeRequestStatus(deepCopyOfRequestToPlay, originalRequest.id)
    );

    return listOfAlteredRequestObservables;
  }

  onChangeRequestStatus(request, requestId: string | number) {
    if (request.amount > 0 && request.status === "now playing") {
      return this.stripeService.capturePaymentIntent(request);
    } else if (request.amount > 0 && request.status === "rejected") {
      // cancel the stripe payment intent
      const payload = {
        status: request.status,
        paymentIntentId: request.paymentIntentId,
        performerStripeId: request.performerStripeId,
      };

      // prepare the payload
      return this.stripeService.cancelPaymentIntent(payload, request.id);
    } else {
      // for free requests
      return this.requestsService.changeRequestStatus(request, requestId);
    }
  }
}
