import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
<<<<<<< HEAD
import { CreateEventComponent } from './create-event/create-event.component';
import {
  MatFormFieldModule,
  MatInputModule,
  MatDatepickerModule,
  MatIconModule
 } from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';



=======
import { HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';
>>>>>>> 29df7d315f100f21ca283fa237bf53db4299043d

@NgModule({
  declarations: [
    AppComponent,
    CreateEventComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
<<<<<<< HEAD
    MatFormFieldModule,
    MatInputModule,
    MatMomentDateModule,
    MatDatepickerModule,
    MatIconModule
=======
    HttpClientModule,
    TranslocoRootModule
>>>>>>> 29df7d315f100f21ca283fa237bf53db4299043d
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
