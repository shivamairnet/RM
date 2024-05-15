import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from "@angular/forms";
import { Route, Router } from "@angular/router";
import { AuthService } from "src/app/Services/auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  errorMsg: string | undefined;
  loader: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
    });
  }

 

  loginUser(loginForm): void {
    const { email, password } = loginForm.value;
    this.authService
      .loginUser({ email, password })
      .then(() => {
        console.log("User logged in successfully!");
        this.router.navigate(["/dashboard"]);
      }) 
      .catch((error) => {
        console.error("Login error:", error);
        this.errorMsg = error.message; // Assuming your AuthService returns an error message
        setTimeout(() => (this.errorMsg = undefined), 5000);
      });
  }
  onSubmit() {
    console.log("clicked login button");
    this.router.navigate(["/dashboard"]);
  }
}