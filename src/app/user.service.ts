import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private gapi: any;

  constructor() {
    this.loadGoogleClient();
  }

  loadGoogleClient() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      // this.gapi = window['gapi'];
      this.gapi.load('client:auth2', this.initClient.bind(this));
    };
    document.body.appendChild(script);
  }

  initClient() {
    this.gapi.client.init({
      clientId: '1010479698959-1rshtu2885k8tefq4cdgvd02r2vnf5dn.apps.googleusercontent.com',
      scope: 'https://www.googleapis.com/auth/calendar',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    }).then(() => {
      // Initialization successful
      console.log('Google API client initialized');
    }, (error: any) => {
      // Initialization failed
      console.log('Error initializing Google API client', error);
    });
  }

  authorize() {
    return this.gapi.auth2.getAuthInstance().signIn();
  }

  listCalendars() {
    this.gapi.client.calendar.calendarList.list()
      .then((response: any) => {
        console.log(response.result.items);
      })
      .catch((error: any) => {
        console.log('Error listing calendars', error);
      });
  }
}
