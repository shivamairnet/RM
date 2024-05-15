import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor(private http: HttpClient) {
    
   }
   sendEmail(recipient: string, subject: string, htmlContent: string){
    const emailData = {
      recipient,
      subject,
      htmlContent
    };
      console.log(htmlContent)
    return this.http.post<any>('http://localhost:4000/sendMail', emailData);
  }
}
