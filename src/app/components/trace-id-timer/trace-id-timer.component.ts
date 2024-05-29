import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';



@Component({
  selector: 'app-trace-id-timer',
  templateUrl: './trace-id-timer.component.html',
  styleUrls: ['./trace-id-timer.component.scss']
})
export class TraceIdTimerComponent implements OnInit {
  timeLeft: number = 900; // 15 minutes in seconds
  displayTime: string = '15:00';
  private timerSubscription: Subscription;
  constructor() { }

  ngOnInit(): void {
    this.startApiCall();
  }

  startApiCall() {
   
      this.startTimer();
    
  }

  startTimer() {
    const source = interval(1000);
    this.timerSubscription = source.subscribe(val => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.displayTime = this.formatTime(this.timeLeft);
      } else {
        this.timerSubscription.unsubscribe();
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const remainingSeconds: number = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

}
