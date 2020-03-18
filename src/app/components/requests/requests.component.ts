import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { translate } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Requests } from '../../interfaces/requests';
import { interval } from 'rxjs';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  eventId: string = '6a118640-6805-11ea-a4ab-ab5d9877af50';
  eventStatus: string = "active";
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

  constructor(
    public requestsService: RequestsService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private actRoute: ActivatedRoute
  ) {
    // this.eventId = this.actRoute.snapshot.params.id;

    // checks all requests from the backend every 5 seconds
    // interval(5000).subscribe(x => {
    //   this.onGetRequestsByEventId();
    // });
  }


  ngOnInit() {
    this.onGetRequestsByEventId();
  }

  onGetRequestsByEventId() {
    this.requestsService.getRequestsByEventId(this.eventId, "pending")
      .subscribe((res) => {
        if (res['response'] !== undefined) {
          this.pendingRequests = res['response']['body'];
        }
      }, (err) => {
        console.log(err);
      })
    this.requestsService.getRequestsByEventId(this.eventId, "accepted")
      .subscribe((res) => {
        if (res['response'] !== undefined) {
          this.acceptedRequests = res['response']['body'];
        }
      }, (err) => {
        console.log(err);
      })
    this.requestsService.getRequestsByEventId(this.eventId, "now playing")
      .subscribe((res) => {
        if (res['response'] !== undefined) {
          this.nowPlayingRequest = res['response']['body'][0];
          this.currentlyPlaying = true;
        }
      }, (err) => {
        console.log(err);
      })
  }

  get isLargeScreen() {
    return this.breakpointObserver.isMatched('(min-width: 700px)');
  }

  startEvent() {
    this.eventStatus = 'active';
  }

  endEvent() {
    this.eventStatus = 'completed';
  }

  openSnackBar(message: string) {
    let durationSeconds = 2;
    this._snackBar.open(message, 'Dismiss', {
      duration: durationSeconds * 1000,
      verticalPosition: 'bottom'
    });
  };

  openDialog(index: number, requestType: string): void {
    const message = translate('confirm dialog message');
    const title = translate('confirm dialog title');
    const action = translate('confirm dialog action');
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
        this.rejectRequest(index, requestType);
        this.openSnackBar(message);
      };
    });
  }

  rejectRequest(index: number, requestType: string) {
    if (requestType === 'acceptedRequests') {
      this.acceptedRequests[index].status = "rejected";
      this.onChangeRequestStatus(this.acceptedRequests[index], this.acceptedRequests[index].id);
    }
    if (requestType === 'pendingRequests') {
      this.pendingRequests[index].status = "rejected";
      this.onChangeRequestStatus(this.pendingRequests[index], this.pendingRequests[index].id);
    }
  }

  endCurrentSong() {
    this.nowPlayingRequest.status = "completed";
    this.onChangeRequestStatus(this.nowPlayingRequest, this.nowPlayingRequest.id);
    this.currentlyPlaying = false;
    const message = translate('snackbar song ended');
    this.openSnackBar(message);
  };

  playNext(index: number) {
    this.endCurrentSong();
    this.acceptedRequests[index].status = "now playing";
    this.onChangeRequestStatus(this.acceptedRequests[index], this.acceptedRequests[index].id)
    this.nowPlayingRequest = {
      song: this.acceptedRequests[index].song,
      artist: this.acceptedRequests[index].artist,
      amount: this.acceptedRequests[index].amount,
      memo: this.acceptedRequests[index].memo,
      status: this.acceptedRequests[index].status
    }
    const message = translate('snackbar now playing')
    this.openSnackBar(`${this.nowPlayingRequest.song} ${message}`);
  }

  acceptRequest(index: number) {
    this.pendingRequests[index].status = "accepted";
    this.onChangeRequestStatus(this.pendingRequests[index], this.pendingRequests[index].id);
    const message = translate('snackbar message accepted');
    this.openSnackBar(message);
  }

  onChangeRequestStatus(request: Requests, requestId: string | number) {
    this.requestsService.changeRequestStatus(request, requestId)
      .subscribe((res) =>
        this.onGetRequestsByEventId()
      ), (
        (err: any) => console.log(err)
      )
  }

}
