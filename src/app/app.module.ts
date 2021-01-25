import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';

import { IonicStorageModule } from '@ionic/storage';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { DatabaseProvider } from '../providers/database/database';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { TooltipsModule } from 'ionic-tooltips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomePage } from '../pages/home/home';
import { HttpClientModule } from '@angular/common/http';


var firebaseConfig = {
  apiKey: "AIzaSyAnOReFKdbSB3qHE0M_yzyTT5v0oOpuSnE",
  authDomain: "ceradent-2f868.firebaseapp.com",
  databaseURL: "https://ceradent-2f868.firebaseio.com",
  projectId: "ceradent-2f868",
  storageBucket: "ceradent-2f868.appspot.com",
  messagingSenderId: "320283851351"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage    
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),    
    AngularFireModule.initializeApp(firebaseConfig),
    //AngularFirestoreModule.enablePersistence(),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    IonicStorageModule.forRoot(), 
    IonicImageViewerModule,
    TooltipsModule,
    BrowserAnimationsModule,
    HttpClientModule    
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider,
 
  ]
})
export class AppModule {}
