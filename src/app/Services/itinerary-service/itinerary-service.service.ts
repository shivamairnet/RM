import { Injectable } from '@angular/core';
import axios from 'axios';
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  Timestamp,
  setDoc,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  updateDoc
} from "@angular/fire/firestore";
import { environment } from 'src/enviroments/environment';
@Injectable({
  providedIn: 'root'
})
export class ItineraryServiceService {

  constructor(private firestore:Firestore) { }

  async getAllData(responseId:string){

    console.log(responseId)
    const {data}=await axios.post(`${environment.BACKEND_BASE_URL}/package/getFullPackage`,{itineraryDocName:"EPp5F58lcjml3js5P0i5"});
    try {
      if(data.packageDetails){
        return data.packageDetails
      } else {
        console.log("Document does not exist");
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  }

}
