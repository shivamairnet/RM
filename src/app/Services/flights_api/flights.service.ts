import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import axios from 'axios'
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class FlightsService {
  constructor(private http: HttpClient) {}

  authenticate(){
    
    return axios.get("http://localhost:4000/flight/authenticate");
  }


  async searchFlights() {
    try {
      
        const payload={
          flightToken:localStorage.getItem("authenticateToken")
        }

        return new Promise((resolve, reject) => {
          this.http.post("http://localhost:4000/sendData", payload).subscribe(
            (data) => {
              
              console.log(data);
              resolve(data);
            },
            (err) => {
              console.log("not able to fetch the details", err);
              reject("No data available");
            }
          );
        });
      
    } catch (err) {
      console.log("error aa rha hai", err);
      return Promise.reject("Error in searching flights");
    }
  }
  

  // currently for package we are using this:
  async multiStopSearchFlights(docUid:string){
    try {
      
      const payload={
        itineraryDocName:docUid
      }

      const url = "http://localhost:4000/flight/searchMultiStopFlights";


      const {data}=await axios.post(url,payload);

      console.log(data);
      return data;
      // return new Promise((resolve, reject) => {
      //   this.http.post("http://localhost:4000/flight/searchMultiStopFlights", payload).subscribe(
      //     (data) => {
            
      //       console.log(data);
      //       resolve(data);
      //     },
      //     (err) => {
      //       console.log("not able to fetch the details", err);
      //       reject("No data available");
      //     }
      //   );
      // });
    
  } catch (err) {
    console.log("error aa rha hai", err);
    return "Error in searching flights";
  }
  }


  // flight cancel

  async flightCancellation(selectedRequestType,remarks,selectedCancellationType){
    const payload={
      flightToken:localStorage.getItem('authenticateToken'),
      requestType:selectedRequestType,
      remarks:remarks,
      cancellationType:selectedCancellationType
    }
    console.log(payload)
    try{
      const {data}=await axios.post(`${environment.BACKEND_BASE_URL}/flight/sendChangeRequest`,payload);
      if(data){
        console.log(data)
      }
      return data
    }catch(error){
      console.log('something went wrong ',error.message)
    }
  }

  async partialFlightCancellation(selectedRequestType,remarks,selectedCancellationType,sectorArray){
    const payload={
      flightToken:localStorage.getItem('authenticateToken'),
      requestType:selectedRequestType,
      remarks:remarks,
      cancellationType:selectedCancellationType,
      sectors:sectorArray
    }
    console.log(payload)
    try{
      const {data}=await axios.post(`${environment.BACKEND_BASE_URL}/flight/sendChangeRequestPartial`,payload);
      if(data){
        console.log(data)
      }
      return data
    }catch(error){
      console.log('something went wrong ',error.message)
    }

  }

  async getCsvData(){
    try{
      const res = await fetch(`${environment.BACKEND_BASE_URL}/flight/getCsvData`);
      // const csvData = await res.text();
      if(res){
        return res;
      }
    }catch(error){
      console.log(error.message)
    }
   }
  async getCountryData(){
    try{
      const res = await fetch(`${environment.BACKEND_BASE_URL}/flight/getCountryData`);
      // const csvData = await res.text();
      if(res){
        return res;
      }
    }catch(error){
      console.log(error.message)
    }
   }

  async flightSearch(payload:any){
    try{
      const res=await axios.post(`${environment.BACKEND_BASE_URL}/flight/searchflight`,payload);
      if(res.data.data){
        console.log(res.data.data)
      }
    }catch(error){
      console.log(error.message)
    }
  }
  async fareRule(payload:any){
    console.log('farequote',payload)
    try{
      const res=await axios.post(`${environment.BACKEND_BASE_URL}/flight/fareRule`,payload);
      if(res.data){
        console.log(res.data)
        return res.data
      }
    }catch(error){
      console.log(error.message)
    }
  }
  async fareQuote(payload:any){
    console.log('farequote',payload)
    try{
      const res=await axios.post(`${environment.BACKEND_BASE_URL}/flight/fareQuote`,payload);
      if(res.data){
        console.log(res.data)
        return res.data
      }
    }catch(error){
      console.log(error.message)
    }
  }
  
  async ssrCall(payload:any){
    console.log('ssr',payload)

    try{
      const res=await axios.post(`${environment.BACKEND_BASE_URL}/flight/ssr`,payload);
      if(res.data){
        console.log(res.data)
        return res.data
      }
    }catch(error){
      console.log(error.message)
    }
  }




  async flightBooking(payload:any){
    try{
      const {data}=await axios.post(`${environment.BACKEND_BASE_URL}/flight/flightBook`,payload);
      if(data){
        return data;
      }
    }catch(error){
      console.log('something went wrong',error.message)
    }
  }
  
  async ticketLCC(payload:any){
    try{
      const {data}=await axios.post(`${environment.BACKEND_BASE_URL}/flight/ticketLCC`,payload);
      console.log(data);
      return data
      // await this.getFlightBookingDetails()
    }catch(error){
      console.log('something went wrong ',error.message)
    }
  }

  async ticketNonLCC(payload:any){
    try{
      const {data}=await axios.post(`${environment.BACKEND_BASE_URL}/flight/ticketNonLCC`,payload);
      console.log(data);
      return data
      // await this.getFlightBookingDetails()
    }catch(error){
      console.log('something went wrong ',error.message)
    }
  }
  async getFlightBookingDetails(payload:any){
    try{
      const {data}=await axios.post(`${environment.BACKEND_BASE_URL}/flight/getFlightBookingDetails`,payload)
      console.log(data)
      return data
    }catch(error){
      console.log(error.message)
    }
  }
}
