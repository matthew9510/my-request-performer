import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { EventService } from 'src/app/services/event.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { translate } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Requests } from '../../interfaces/requests';
import { interval } from 'rxjs';
import { OrderPipe } from 'ngx-order-pipe';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
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
    status: null
  };
  currentlyPlaying: boolean = false;
  event: any;
  eventStatusMenuIcon: string = 'fiber_manual_record';
  eventMenuStatus: string = 'Inactive';
  order: string = 'createdOn';
  reverse: boolean = false;
  tempAcceptedRequests: any;
  tempNowPlayingRequest: any;

  constructor(
    public requestsService: RequestsService,
    public eventService: EventService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private actRoute: ActivatedRoute,
    private orderPipe: OrderPipe
  ) {
    this.eventId = this.actRoute.snapshot.params.id;

    // checks all pending requests from the backend every 20 seconds
    interval(20000).subscribe(x => {
      this.getPendingRequests();
    });
  }

  ngOnInit() {
    this.onGetEventById();
    this.onGetRequestsByEventId();
  }

  // sets order for pending requests
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }


  // checks the event id in url to check status
  onGetEventById() {
    this.eventService.getEvent(this.eventId)
      .subscribe(
        (res: any) => {
          if (res.response !== undefined) {
            this.event = res.response.body.Item;
            this.eventStatus = this.event['status'];
            this.eventService.currentEvent = this.event;

            // updates status menu appearance
            switch (this.eventStatus) {
              case "active":
                this.eventStatusMenuIcon = 'play_circle_filled';
                this.eventMenuStatus = 'Active';
                break;
              case "paused":
                this.eventStatusMenuIcon = 'pause_circle_filled';
                this.eventMenuStatus = 'Paused';
                break;
              case "completed":
                this.eventStatusMenuIcon = 'remove_circle';
                this.eventMenuStatus = 'Ended';
                break;
            }
          }
        },
        (err) => console.log(err)
      );
  }

  onGetRequestsByEventId() {
    this.getPendingRequests();
    this.getAcceptedRequests();
    this.getNowPlayingRequests();
  }

  getPendingRequests() {
    this.requestsService.getRequestsByEventId(this.eventId, "pending")
      .subscribe((res: any) => {
        if (res.response.body.length > 0) {
          this.pendingRequests = res.response.body;
        } else {
          this.pendingRequests = null;
        }
      }, (err) => {
        console.log(err);
      })
  }

  getAcceptedRequests() {
    this.requestsService.getRequestsByEventId(this.eventId, "accepted")
      .subscribe((res: any) => {
        if (res.response.body.length > 0) {
          // Method to remove duplicates and combine amounts of original requests and top ups
          // Note: res.response.body will have original requests before top-ups due to sorting by createdOn date
          this.acceptedRequests = res.response.body.reduce((acc: any[], curr: any, currIndex: any, array: any) => {
            // if request is an original
            if (curr.id === curr.originalRequestId) {
              curr.topUps = []
              acc.push(curr)
            }
            else { // if request is a top-up
              const originalRequestIndex = acc.map(request => request.id).indexOf(curr.originalRequestId);
              acc[originalRequestIndex].amount += curr.amount
              acc[originalRequestIndex].topUps.push(curr)
            }
            return acc
          }, [])
        } else {
          this.acceptedRequests = null;
        }
        console.log("accepted Requests", this.acceptedRequests)
      }, (err) => {
        console.log(err);
      })
  }

  getNowPlayingRequests() {
    this.requestsService.getRequestsByEventId(this.eventId, "now playing")
      .subscribe((res: any) => {
        if (res.response.body.length > 0) {
          this.nowPlayingRequest = res.response.body.reduce((acc: any[], curr: any, currIndex: any, array: any) => {
            // if request is an original
            if (curr.id === curr.originalRequestId) {
              curr.topUps = []
              acc.push(curr)
            }
            else { // if request is a top-up
              const originalRequestIndex = acc.map(request => request.id).indexOf(curr.originalRequestId);
              acc[originalRequestIndex].amount += curr.amount
              acc[originalRequestIndex].topUps.push(curr)
            }
            return acc
          }, [])[0]
          this.currentlyPlaying = true;
          console.log("nowplaying request", this.nowPlayingRequest)

        } else {
          this.currentlyPlaying = false;
          this.nowPlayingRequest = {
            song: null,
            artist: null,
            amount: null,
            memo: null,
            status: null,
            id: null
          };
        }
      }, (err) => {
        console.log(err);
      })
  }

  get isLargeScreen() {
    return this.breakpointObserver.isMatched('(min-width: 700px)');
  }

  startEvent() {
    // changes on backend
    this.eventService.startEvent();
    // changes on front end
    this.eventStatus = 'active';
    this.eventStatusMenuIcon = 'play_circle_filled';
    this.eventMenuStatus = 'Active';
  }

  endEvent() {
    // changes on backend
    this.eventService.endEvent();
    // changes on front end
    this.eventStatus = 'completed';
    this.eventStatusMenuIcon = 'remove_circle';
    this.eventMenuStatus = 'Ended';

    if (this.nowPlayingRequest) {
      this.nowPlayingRequest.status = "completed";
      this.onChangeRequestStatus(this.nowPlayingRequest, this.nowPlayingRequest.id);
      this.currentlyPlaying = false;
      this.nowPlayingRequest = {
        song: null,
        artist: null,
        amount: null,
        memo: null,
        status: null,
        id: null
      };
    }
    if (this.pendingRequests !== null) {
      this.pendingRequests.map(req => req.status = 'rejected');
      for (let request of this.pendingRequests) {
        this.onChangeRequestStatus(request, request.id)
      }
    }
    if (this.acceptedRequests !== null) {
      this.acceptedRequests.map(req => req.status = 'rejected');
      for (let request of this.acceptedRequests) {
        this.onChangeRequestStatus(request, request.id)
      }
    }
  }

  pauseEvent() {
    // changes on backend
    this.eventService.pauseEvent();
    // changes on front end
    this.eventStatus = 'paused';
    this.eventStatusMenuIcon = 'pause_circle_filled';
    this.eventMenuStatus = 'Paused';
  }

  openSnackBar(message: string) {
    let durationSeconds = 2;
    this._snackBar.open(message, 'Dismiss', {
      duration: durationSeconds * 1000,
      verticalPosition: 'bottom'
    });
  };

  openRejectRequestDialog(request: any, requestType: string): void {
    const message = translate('request confirm dialog message');
    const title = translate('request confirm dialog title');
    const action = translate('request confirm dialog action');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title,
        message,
        action
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const message = translate('snackbar message rejected');
      if (result) {
        this.rejectRequest(request, requestType);
        this.openSnackBar(message);
      };
    });
  }

  openEndEventDialog(): void {
    const message = translate('event confirm dialog message');
    const title = translate('event confirm dialog title');
    const action = translate('event confirm dialog action');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title,
        message,
        action
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const message = translate('snackbar event ended');
      if (result) {
        this.endEvent();
        this.openSnackBar(message);
      };
    });
  }

  acceptRequest(request: any) {
    request.status = "accepted";
    const updatedReq = request;
    // this.pendingRequests.splice(index, index + 1);
    this.onChangeRequestStatus(updatedReq, request.id);
    const message = translate('snackbar message accepted');
    this.openSnackBar(message);
  }

  rejectRequest(request: any, requestType: string) {
    if (requestType === 'acceptedRequests') {
      let acceptedRequestToReject = this.acceptedRequests.filter(req => req.originalRequestId === request.originalRequestId)[0];

      // change top-up requests statuses if there are top-ups for a request to be rejected
      if (acceptedRequestToReject.topUps.length > 0) {
        var topUpAmount = 0
        for (let topUp of acceptedRequestToReject.topUps) {
          let alteredTopUp = JSON.parse(JSON.stringify(topUp))
          alteredTopUp.status = "rejected"
          this.onChangeRequestStatus(alteredTopUp, topUp.id);
          topUpAmount += topUp.amount
        }
      }

      // change original request status
      let alteredOriginalRequest = JSON.parse(JSON.stringify(acceptedRequestToReject));
      alteredOriginalRequest.status = "rejected"
      // subtract topup amount if any
      if (topUpAmount) {
        alteredOriginalRequest.amount -= topUpAmount;
      }
      this.onChangeRequestStatus(alteredOriginalRequest, acceptedRequestToReject.id);
    }
    if (requestType === 'pendingRequests') { // note no top-ups for a pending request
      // change original request status
      let alteredOriginalPendingRequest = JSON.parse(JSON.stringify(request));
      alteredOriginalPendingRequest.status = "rejected"
      this.onChangeRequestStatus(alteredOriginalPendingRequest, request.id);
    }
  }

  endCurrentSong() {
    // let temp = this.tempNowPlayingRequest;
    // console.log(temp)
    if (this.currentlyPlaying) {

      // if current song has top-ups alter the top-up statuses in db
      if (this.nowPlayingRequest.topUps.length > 0) {
        var topUpAmount = 0
        for (let topUp of this.nowPlayingRequest.topUps) {
          let alteredTopUp = JSON.parse(JSON.stringify(topUp))
          alteredTopUp.status = "completed"
          this.onChangeRequestStatus(alteredTopUp, topUp.id);
          topUpAmount += topUp.amount
        }
      }

      // change original request status
      let alteredNowPlayingRequest = JSON.parse(JSON.stringify(this.nowPlayingRequest));
      alteredNowPlayingRequest.status = "completed"

      // subtract top-up amount if any
      if (topUpAmount) {
        alteredNowPlayingRequest.amount -= topUpAmount;
      }
      // delete top-ups array from now playing request
      delete alteredNowPlayingRequest.topUps

      this.onChangeRequestStatus(alteredNowPlayingRequest, this.nowPlayingRequest.id);
    };
    this.currentlyPlaying = false;
    this.nowPlayingRequest = {
      song: null,
      artist: null,
      amount: null,
      memo: null,
      status: null,
      id: null
    };
    const message = translate('snackbar song ended');
    this.openSnackBar(message);
  };

  playNext(request: any) {
    this.endCurrentSong();

    let requestToPlay = this.acceptedRequests.filter(req => req.originalRequestId === request.originalRequestId)[0];

    // if request has top-ups alter the top-up statuses in db
    if (requestToPlay.topUps.length > 0) {
      var topUpAmount = 0
      for (let topUp of requestToPlay.topUps) {
        let alteredTopUp = JSON.parse(JSON.stringify(topUp))
        alteredTopUp.status = "now playing"
        this.onChangeRequestStatus(alteredTopUp, topUp.id);
        topUpAmount += topUp.amount
      }
    }

    // change original request status
    let alteredRequestToPlay = JSON.parse(JSON.stringify(requestToPlay));
    alteredRequestToPlay.status = "now playing"

    // subtract top-up amount if any
    if (topUpAmount) {
      alteredRequestToPlay.amount -= topUpAmount;
    }
    // delete top-ups array from now playing request
    delete alteredRequestToPlay.topUps

    this.onChangeRequestStatus(alteredRequestToPlay, requestToPlay.id);

    // this.onChangeRequestStatus(request, request.id);
    // console.log(request.id)
    this.nowPlayingRequest = {
      song: request.song,
      artist: request.artist,
      amount: request.amount,
      memo: request.memo,
      status: request.status,
      id: request.id,
      originalRequestId: request.originalRequestId
    }
    const message = translate('snackbar now playing')
    this.openSnackBar(`${this.nowPlayingRequest.song} ${message}`);
  }

  onChangeRequestStatus(request: Requests, requestId: string | number) {
    this.requestsService.changeRequestStatus(request, requestId)
      .subscribe((res) => {
        this.onGetRequestsByEventId();
      }), (
        (err: any) => console.log(err)
      )
  }

}