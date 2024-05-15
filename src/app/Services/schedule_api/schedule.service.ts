import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import axios from 'axios';
import { environment } from 'src/enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http: HttpClient) {}


  async getSchedules(uid:string){

    try{
      console.log('in serveice hello')
      const {data}=await axios.post(  `${environment.BACKEND_BASE_URL}/schedule/getItinerarySchedule`,{uid:uid});
      console.log("IN SCHEDULE SERVICE",data)
      return data
    }
    catch(err){
      console.log("error aa rha hai", err);
      return Promise.reject("Error in searching flights");
    }


  }

  // not in use
  // async getDocument(uid:string){

  //   try {
  //     const {data}=await axios.post(" http://localhost:4000/schedule/getDocument",{docUid:uid});
  //       console.log(data)
  //     return data;

  //   } catch (error) {
  //     return Promise.reject("Error in getting document");
      
  //   }
  // }
}
