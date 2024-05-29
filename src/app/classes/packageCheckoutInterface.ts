
export interface Room {
    NoOfAdults: number;
    NoOfChild: number;
    ChildAge: number[];
  }
  
export interface Traveler {
    travelerType: 'adult' | 'child' | 'infant';
    travelerTypeCode: 1 | 2 | 3;
    age: number;
    uid:string;
    personalInfoCompleted:boolean
    personalInfo?: {
      FirstName: string;
      Title: string;
      LastName: string;
      DateOfBirth: Date;
      Gender: string;
      Nationality: string;
      AddressLine1: string;
      AddressLine2?: string;
      Email: string;
      ContactNo: string;
      Phoneno?: number;
      PAN?: string;
      PassportNo?: string;
      PassportIssueDate?: Date;
      PassportExpDate?: Date;
      PassportExpiry?: Date;
      Age: number;
      PaxType: number;
      CountryCode: string;
      City: string;
      CountryName: string;
      LeadPassenger: boolean;
    };
  
    guardian?: {
      Title: string;
      FirstName: string;
      LastName: string;
      PAN?: string;
      PassportNo?: string;
    };
  
    ssr?: {
      extraBaggage: string;
      meal: string; // Initializing with null for "No Preference"
      seat: string;
    };
  }
  