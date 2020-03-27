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
  acceptedRequests: Requests[];
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
      this.requestsService.getRequestsByEventId(this.eventId, "pending")
        .subscribe((res: any) => {
          if (res.response.body.length > 0) {
            this.pendingRequests = res.response.body;
          }
        }, (err) => {
          console.log(err);
        })
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
    this.requestsService.getRequestsByEventId(this.eventId, "accepted")
      .subscribe((res: any) => {
        if (res.response.body.length > 0) {
          this.acceptedRequests = res.response.body;
        } else {
          this.acceptedRequests = null;
        }
      }, (err) => {
        console.log(err);
      })
    this.requestsService.getRequestsByEventId(this.eventId, "now playing")
      .subscribe((res: any) => {
        if (res.response.body.length > 0) {
          this.nowPlayingRequest = res.response.body[0];
          this.currentlyPlaying = true;
        } else {
          this.nowPlayingRequest = {
            song: null,
            artist: null,
            amount: null,
            memo: null,
            status: null
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
        status: null
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
      request.status = "rejected";
      const updatedReq = request;
      // this.acceptedRequests.splice(index, index + 1);
      this.onChangeRequestStatus(updatedReq, request.id);
    }
    if (requestType === 'pendingRequests') {
      request.status = "rejected";
      const updatedReq = request;
      // this.pendingRequests.splice(index, index + 1);
      this.onChangeRequestStatus(updatedReq, request.id);
    }
  }

  endCurrentSong() {
    this.nowPlayingRequest.status = "completed";
    this.onChangeRequestStatus(this.nowPlayingRequest, this.nowPlayingRequest.id);
    this.currentlyPlaying = false;
    this.nowPlayingRequest = {
      song: null,
      artist: null,
      amount: null,
      memo: null,
      status: null
    };
    const message = translate('snackbar song ended');
    this.openSnackBar(message);
  };

  playNext(index: number) {
    console.log('clicked')
    this.endCurrentSong();
    this.acceptedRequests[index].status = "now playing";
    const request = this.acceptedRequests[index];
    this.acceptedRequests.splice(index, index + 1);
    this.onChangeRequestStatus(request, request.id);
    this.nowPlayingRequest = {
      song: request.song,
      artist: request.artist,
      amount: request.amount,
      memo: request.memo,
      status: request.status
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