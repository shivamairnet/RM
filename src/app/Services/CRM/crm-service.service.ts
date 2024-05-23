import { Injectable } from "@angular/core";
import axios from "axios";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class CrmServiceService {
  constructor() {}

  async loginCustomer(customerSearchText) {
    try {
      const { data } = await axios.get(
        `${environment.BACKEND_BASE_URL}/users/search`,
        {
          params: {
            query: customerSearchText 
          }
        }
      );

      return data;
    } catch (err) {
      console.error(err);
      return err.message;
    }
  }
 
  async registerCustomer(userData: {
    name: string;
    email: string;
    phone_number: string;
    address: string;
    merchantId: string;
  }) {
    try {
      const response  = await axios.post(
        `${environment.BACKEND_BASE_URL}/users`,
        userData
      );

      return response;
    } catch (err) {
      console.error(err);
      return err.message;
    }
  }

  async getAllEnquiriesOfCustomer(userData: {
    phone_number: string;
    merchantId: string;
  }) {
    try {
      const { data } = await axios.post(
        `${environment.BACKEND_BASE_URL}/crm/customerEnquiry`,
        userData
      );

      return data;
    } catch (err) {
      console.error(err);
      return err.message;
    }
  }

  async registerItineraryEnquiry(itineraryDetails) {
    try {
      const { data } = await axios.post(
        `${environment.BACKEND_BASE_URL}/crm/itineraryEnquiry`,
        itineraryDetails
      );

      return data;
    } catch (err) {
      console.error(err);
      return err.message;
    }
  }

  async registerFlightsEnquiry(payload){
    try {
      const { data } = await axios.post(
        `${environment.BACKEND_BASE_URL}/crm/flightsEnquiry`,
        payload
      );

      return data;
    } catch (err) {
      console.error(err);
      return err.message;
    }
  }

}
