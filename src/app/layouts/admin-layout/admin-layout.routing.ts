import { Routes } from '@angular/router';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { AuthService } from 'src/app/Services/auth.service';
import { AuthGuard } from 'src/app/Services/auth.guard';
import { CollectionsComponent } from 'src/app/pages/collections/collections.component';
import { ComingSoonComponent } from 'src/app/pages/coming-soon/coming-soon.component';
import { CheckoutComponent } from 'src/app/pages/checkout/checkout.component';
import { SuccessComponent } from 'src/app/pages/success/success.component';
import { PackageCheckoutComponent } from 'src/app/pages/package-checkout/package-checkout.component';
import { ItineraryComponent } from 'src/app/pages/itinerary/itinerary.component';
import { AdminDashboardComponent } from 'src/app/pages/admin-dashboard/admin-dashboard.component';
import { FlightSearchComponent } from 'src/app/pages/flight-search/flight-search.component';
import { PackageCheckoutFlightsComponent } from 'src/app/pages/package-checkout-flights/package-checkout-flights.component';
import { HotelSearchComponent } from 'src/app/pages/hotel-search/hotel-search.component';
import { PackageCheckoutHotelsComponent } from 'src/app/pages/package-checkout-hotels/package-checkout-hotels.component';
import { ReissuanceComponent } from 'src/app/pages/reissuance/reissuance.component';
import { ReissueCheckoutComponent } from 'src/app/pages/reissue-checkout/reissue-checkout.component';
import { PackageListComponent } from 'src/app/pages/package-list/package-list.component';
import { BookingDetailsComponent } from 'src/app/pages/booking-details/booking-details.component';
import { NotRegiteredComponent } from 'src/app/pages/not-regitered/not-regitered.component';
import { RegisteredUserComponent } from 'src/app/pages/registered-user/registered-user.component';
import { EnquiryComponent } from 'src/app/pages/enquiry/enquiry.component';
import { EnqDetailsComponent } from 'src/app/pages/enq-details/enq-details.component';
import { CitySelectionForRoutingComponent } from 'src/app/pages/city-selection-for-routing/city-selection-for-routing.component';
//testee
import { TesterComponent } from 'src/app/pages/tester/tester.component';



export const AdminLayoutRoutes: Routes = [

  //testee
  {path:"app-tester",component:TesterComponent},
//testee till here
  {path:"route-planner/citySelection", component:CitySelectionForRoutingComponent },
  {path:"dashboard",component:AdminDashboardComponent},
  {path:"register-user",component:NotRegiteredComponent},
  {path:"customer-details",component:EnqDetailsComponent},
  // { path: 'generate-aI-itinerary',  component: DashboardComponent },

    // { path: 'dashboard/:id',  component: DashboardComponent,canActivate: [AuthGuard] },
    { path: 'user-profile',   component: UserProfileComponent, canActivate: [AuthGuard]},
    { path: 'tables',         component: TablesComponent },
    { path: 'icons',          component: IconsComponent},
    { path: 'icons/:id',      component: IconsComponent},
    { path: 'maps',           component: MapsComponent }, 
    { path: 'collections',    component: CollectionsComponent },
    { path: 'generate-aI-itinerary/:responseId', component: DashboardComponent },
    { path:'customer',component:RegisteredUserComponent},
    { path:'customerEnquiry',component:EnquiryComponent},
   
    {path:"itinerary/:uid" , component:ItineraryComponent},

  

    
  {path:"success/:id/:isFlight" , component:SuccessComponent},
  {path:"reissue/:date" , component:ReissuanceComponent},
  {path:"reissue-checkout" , component:ReissueCheckoutComponent},
  {path:"package-checkout/:uid" , component:PackageCheckoutComponent},
  {path:"package-checkout-flight" , component:PackageCheckoutFlightsComponent},
  {path:"package-checkout-hotels" , component:PackageCheckoutHotelsComponent},

  {path:"package-list" , component:PackageListComponent},
  {path:"booking-details/:uid/:id" , component:BookingDetailsComponent},
  { path: "dashboard", component: AdminDashboardComponent },
  { path: "flight-search", component: FlightSearchComponent },
  { path: "hotel-search", component: HotelSearchComponent },
  // {path:"package-list" , component:PackageListComponent},
  { path: "generate-aI-itinerary", component: DashboardComponent },
  


  



];
