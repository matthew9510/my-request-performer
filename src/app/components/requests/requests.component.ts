import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'src/app/services/requests.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { translate } from '@ngneat/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Requests } from '../../interfaces/requests';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {
  event_id: string = '705346f8-c9da-4dc4-b0b8-6898595dcaaf';
  // not sure if this will be necessary once we are able to do patch requests
  updatedStatus: string = '';
  eventStatus: string = "active";
  acceptedRequests: Requests[];
  pendingRequests: Requests[];

  // now playing request is hard coded for now. there will be only one request with the status 'now-playing' at any given time
  nowPlayingRequest = {
    song: 'Return to Innocence',
    artist: 'Enigma',
    amount: 4.20,
    currentlyPlaying: true,
    memo: `Shout out for Matt's birthday!`,
    status: 'now playing'
  }


  constructor(
    public requestsService: RequestsService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private _snackBar: MatSnackBar,
    private actRoute: ActivatedRoute
  ) {
    // this.event_id = this.actRoute.snapshot.params.id;
  }


  ngOnInit() {
    this.requestsService.onFetchRequests();
    this.onGetRequestsByEventId();
  }

  onGetRequestsByEventId() {
    this.requestsService.getRequestsByEventId(this.event_id).subscribe(
      (res) => {
        // console.log(res);
        this.pendingRequests = res['response']
          .filter((el: { status: string; }) => el.status === 'pending')
        console.log(this.pendingRequests)
      }, (err) => {
        console.log(err);
      })
  }

  // onFetchRequests() {
  //   this.requestsService.fetchPendingRequests()
  //     .subscribe((res: Requests[]) => this.pendingRequests = res);
  //   this.requestsService.fetchAcceptedRequests()
  //     .subscribe((res: Requests[]) => this.acceptedRequests = res);
  // }

  get isLargeScreen() {
    return this.breakpointObserver.isMatched('(min-width: 700px)');
  }

  startEvent() {
    this.eventStatus = 'active';
  }

  endCurrentSong() {
    this.nowPlayingRequest = {
      song: null,
      artist: null,
      amount: null,
      currentlyPlaying: false,
      memo: null,
      status: null
    }
    const message = translate('snackbar song ended');
    this.openSnackBar(message);
  };

  openSnackBar(message: string) {
    let durationSeconds = 2;
    this._snackBar.open(message, 'Dismiss', {
      duration: durationSeconds * 1000,
      verticalPosition: 'bottom'
    });
  };

  // may need to pass in request_id as well to be able to change the status
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
      this.requestsService.acceptedRequests.splice(index, 1);
    }
    if (requestType === 'pendingRequests') {
      this.requestsService.pendingRequests.splice(index, 1);
    }
  }

  playNext(index: number) {
    this.nowPlayingRequest = {
      song: this.requestsService.acceptedRequests[index].song,
      artist: this.requestsService.acceptedRequests[index].artist,
      amount: this.requestsService.acceptedRequests[index].amount,
      memo: this.requestsService.acceptedRequests[index].memo,
      status: this.requestsService.acceptedRequests[index].status,
      currentlyPlaying: true
    }
    this.rejectRequest(index, 'acceptedRequests');
    const message = translate('snackbar now playing')
    this.openSnackBar(`${this.nowPlayingRequest.song} ${message}`);
  }

  acceptRequest(index: number) {
    this.requestsService.acceptedRequests.push(this.requestsService.pendingRequests[index]);
    this.rejectRequest(index, 'pendingRequests');
    const message = translate('snackbar message accepted');
    this.openSnackBar(message);
  }

  // these methods were used to grab the request data from the requests JSON files, may be reusable once backend is set up

  // onFetchRequests() {
  //   this.requestsService.fetchPendingRequests()
  //     .subscribe((res: Requests[]) => this.pendingRequests = res);
  //   this.requestsService.fetchAcceptedRequests()
  //     .subscribe((res: Requests[]) => this.acceptedRequests = res);
  // }

  // onChangeStatus(status) {
  //   console.log(status)
  //   this.updatedStatus = status;
  //   this.onPatchRequestStatus(this.updatedStatus, 'requestId')
  // }

  // not finished yet - waiting on backend set up
  // onPatchRequestStatus(newStatus, requestId) {
  //   this.requestsService.patchRequestStatus(newStatus, requestId)
  //     .subscribe((res => {
  //       console.log(res);
  //       this.onFetchRequests();
  //     }));
  // }

}
