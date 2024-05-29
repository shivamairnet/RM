export const RESPONSE_COLLECTION = "response-itinerary"

  enum ResponseStatus {
    NotSet = 0,
    Successfull = 1,
    Failed = 2,
    InValidRequest = 3,
    InValidSession = 4,
    InValidCredentials = 5,
  }
  
  export const  getResponseStatus=(statusCode: number): string=> {
    switch (statusCode) {
      case ResponseStatus.NotSet:
        return "NotSet";
      case ResponseStatus.Successfull:
        return "Successfull";
      case ResponseStatus.Failed:
        return "Failed";
      case ResponseStatus.InValidRequest:
        return "InValidRequest";
      case ResponseStatus.InValidSession:
        return "InValidSession";
      case ResponseStatus.InValidCredentials:
        return "InValidCredentials";
      default:
        return "Unknown Status";
    }
  }
