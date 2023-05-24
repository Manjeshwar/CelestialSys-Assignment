import { Injectable } from '@angular/core';
declare const gapi: any;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private clientId = '1010479698959-1rshtu2885k8tefq4cdgvd02r2vnf5dn.apps.googleusercontent.com';
  private apiKey = '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CztnKa1AKfI';
  private scope = 'https://www.googleapis.com/auth/calendar';

  constructor() {}

  loadCalendarApi(): Promise<any> {
    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: this.apiKey,
          clientId: this.clientId,
          scope: this.scope
        })
        .then(() => {
          resolve('success');
        }, (error: any) => {
          reject(error);
        });
      });
    });
  }

  signIn(): Promise<any> {
    return gapi.auth2.getAuthInstance().signIn();
  }

  createCalendar(summary: string): Promise<any> {
    const request = gapi.client.calendar.calendars.insert({
      requestBody: {
        summary: summary
      }
    });
    return request.execute();
  }
}
