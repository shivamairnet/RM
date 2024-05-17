import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "src/environments/environment";
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
    return this.http.post<any>(`${environment.BACKEND_BASE_URL}/sendMail`, emailData);
  }
}
