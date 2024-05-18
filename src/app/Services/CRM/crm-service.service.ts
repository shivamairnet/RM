import { Injectable } from "@angular/core";
import axios from "axios";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class CrmServiceService {
  constructor() {}

  async loginCustomer(userData: { contactNumber: string; merchantId: string }) {
    try {
      const { data } = await axios.post(
        `${environment.BACKEND_BASE_URL}/crm/login`,
        userData
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
    contactNumber: string;
    address: string;
    merchantId: string;
  }) {
    try {
      const { data } = await axios.post(
        `${environment.BACKEND_BASE_URL}/crm/register`,
        userData
      );

      return data;
    } catch (err) {
      console.error(err);
      return err.message;
    }
  }

  async getAllEnquiriesOfCustomer(userData: {
    contactNumber: string;
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
}
