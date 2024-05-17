import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrmServiceService {

  constructor() { }

  async loginCustomer(userData: { contactNumber: string; merchantId: string }){

    try{
      const  {data}=await axios.post(`http://localhost:4000/crm/login` , userData)

      return data;
    }
   catch(err){
    console.error(err)
      return err.message
   }

  }

  async registerCustomer(userData: {
    name: string;
    email: string;
    contactNumber: string;
    address: string;
    merchantId: string;
  }){
    try{
      const  {data}=await axios.post(`http://localhost:4000/crm/register` , userData)

      return data;
    }
   catch(err){
    console.error(err)
      return err.message
   }
  }

}
