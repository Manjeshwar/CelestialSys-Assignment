import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MenuItem } from 'primeng/api';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit  {
  items: MenuItem[];
  selectedItem: string='item1';
  form: FormGroup;
  currentDate: Date = new Date();
  selectedCalendarType: string;
  selectedTimezone: string;
  showAuthorizeButton: any = false;

  
  constructor(private googleCalendarService: UserService,private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    }, { validator: this.dateTimeValidator });
  }

  ngOnInit() {
    this.items = [
      { label: 'Date and Time', icon: 'pi pi-fw pi-file', command: () => this.selectItem('item1') },
      { label: 'Calendar', icon: 'pi pi-fw pi-folder', command: () => this.selectItem('item2') }
    ];
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
    this.showAuthorizeButton = this.selectedCalendarType && this.selectedTimezone;
  }


  authorize() {
    this.googleCalendarService.authorize();
  }

  listCalendars() {
    this.googleCalendarService.listCalendars();
  }
  
  
  
}
