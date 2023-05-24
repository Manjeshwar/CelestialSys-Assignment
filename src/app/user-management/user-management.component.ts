import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MenuItem } from 'primeng/api';
import { UserService } from '../user.service';

import { HttpClient } from '@angular/common/http';
import { Router,ActivatedRoute } from '@angular/router';
declare const gapi: any;
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit  {
  items: MenuItem[];
  selectedItem: string='item1';
  form: FormGroup;

  calendarForm:FormGroup;
  currentDate: Date = new Date();
  selectedCalendarType: any;
  selectedTimezone: any;
  showAuthorizeButton: boolean = false;
  showResult:boolean=false;

  accessToken: any='';
  refreshToken: any='';

  YOUR_CLIENT_ID = '1010479698959-1rshtu2885k8tefq4cdgvd02r2vnf5dn.apps.googleusercontent.com';
  YOUR_REDIRECT_URI = 'http://localhost:4200/user-management';
  
  constructor(private route: ActivatedRoute,private router: Router,private http: HttpClient,private googleCalendarService: UserService,private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    }, { validator: this.dateTimeValidator });

    this.calendarForm=this.formBuilder.group({
      selectedCalendarType: ['', Validators.required],
      selectedTimezone: ['', Validators.required]
    });
  }

  ngOnInit() {
    
    this.items = [
      { label: 'Date and Time', icon: 'pi pi-fw pi-file', command: () => this.selectItem('item1') },
      { label: 'Calendar', icon: 'pi pi-fw pi-folder', command: () => this.selectItem('item2') }
    ];

    this.route.fragment.subscribe((fragment:any) => {
      const urlParams = new URLSearchParams(fragment);
      const accessToken = urlParams.get('access_token');
      this.accessToken=accessToken;
      const refreshToken = urlParams.get('refresh_token');
      this.refreshToken=refreshToken;
    });

  }

  dateAndTime(){
    this.showResult=true;
  }

  selectItem(item: string): void {
    this.selectedItem = item;
  }

  dateTimeValidator(form: FormGroup) {
    const date = form.value.date;
    const startTime = form.value.startTime;
    const endTime = form.value.endTime;
  
    if (date && startTime && endTime) {
      const selectedDateTime = new Date(date);
      const startDateTime = new Date(date + ' ' + startTime);
      const endDateTime = new Date(date + ' ' + endTime);
  
      if (selectedDateTime < this.currentDate) {
        return { pastDate: true };
      }
  
      if (startDateTime >= endDateTime) {
        return { invalidTimeRange: true };
      }
  
      if (startTime.includes('AM') && endTime.includes('PM')) {
        return { invalidEndTime: true };
      }
    }
  
    return null;
  }
  


  getTimes() {
    const times = [];
    const startTime = new Date();
    startTime.setHours(0, 0, 0, 0);
  
    const endTime = new Date();
    endTime.setHours(23, 59, 0, 0);
  
    const startHour = parseInt(this.form.value.startTime?.split(':')[0], 10);
  
    while (startTime < endTime) {
      const currentHour = startTime.getHours();
      const isSelectable =
        (startHour < 12 && currentHour >= 12) ||
        (startHour >= 12 && currentHour >= startHour);
  
      times.push({
        value: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        selectable: isSelectable
      });
  
      startTime.setMinutes(startTime.getMinutes() + 30);
    }
  
    return times;
  }

  onCalendarTypeChange() {
    if(this.calendarForm.value.selectedCalendarType=='google' && this.calendarForm.value.selectedTimezone){
      this.showAuthorizeButton=true;
    }else{
      this.showAuthorizeButton=false;
    }
  }

  
  signIn(): void {
    this.googleCalendarService.signIn();
  }

  createCalendar(): void {
    const summary = 'My Calendar';
    this.googleCalendarService.createCalendar(summary).then((response: any) => {
      console.log('Calendar created:', response);
    });
  }

  authorizeCalendar(): void {
    // Add your Google API Client ID and Calendar API scopes
    const clientId = '1010479698959-1rshtu2885k8tefq4cdgvd02r2vnf5dn.apps.googleusercontent.com';
    const scopes = ['https://www.googleapis.com/auth/calendar'];
  
    gapi.load('client:auth2', () => {
      gapi.client.init({
        clientId,
        scope: scopes.join(' '),
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
      }).then(() => {
        // Sign in the user
        return gapi.auth2.init();
      }).then(() => {
        // Handle successful authorization
        console.log('Google Calendar authorized!');
      }).catch((error: any) => {
        // Handle error
        console.error('Error authorizing Google Calendar:', error);
      });
    });
  }
  

  trySampleRequest() {
    const params = this.getOAuthParamsFromLocalStorage();
    if (params && params['access_token']) {
      localStorage.setItem('accessToken',params['access_token']);
      localStorage.setItem('refreshToken',params['refresh_token']);
      this.refreshToken = params['refresh_token'];
      alert(this.accessToken);
      alert(this.refreshToken);
      this.makeApiRequest(params['access_token']);
    } else {
      this.oauth2SignIn();
    }
  }

  // makeApiRequest(accessToken: string) {
  //   const url = 'https://www.googleapis.com/drive/v3/about?fields=user&access_token=' + accessToken;
  //   this.http.get(url).subscribe(
  //     (response: any) => {
  //       console.log(response);
  //     },
  //     (error: any) => {
  //       if (error.status === 401) {
  //         this.oauth2SignIn();
  //       }
  //     }
  //   );
  // }

  makeApiRequest(accessToken: string) {
    const url = 'https://www.googleapis.com/drive/v3/about?fields=user&access_token=' + accessToken;
    this.http.get(url).subscribe(
      (response: any) => {
        alert(accessToken);
        alert('Refresh Token:'+ this.getOAuthParamsFromLocalStorage()['refresh_token']);
        console.log(response);
      },
      (error: any) => {
        if (error.status === 401) {
          this.oauth2SignIn();
        }
      }
    );
  }

  

  oauth2SignIn() {
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = {
      'client_id': this.YOUR_CLIENT_ID,
      'redirect_uri': this.YOUR_REDIRECT_URI,
      'scope': 'https://www.googleapis.com/auth/drive.metadata.readonly',
      'state': 'try_sample_request',
      'include_granted_scopes': 'true',
      'response_type': 'token'
    };

    const form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', oauth2Endpoint);

    for (const p in params) {
      if (params.hasOwnProperty(p)) {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p as keyof typeof params]);
        form.appendChild(input);
      }
    }

    document.body.appendChild(form);
    form.submit();
  }

  getOAuthParamsFromLocalStorage() {
    const paramsString = localStorage.getItem('oauth2-test-params');
    return paramsString ? JSON.parse(paramsString) : null;
  }
  
  
  
}
