import { Router } from "@angular/router";

export class AuthManager {
    
    private static _instance: AuthManager = new AuthManager();
    
    public static getInstance(): AuthManager {
       return AuthManager._instance;
    }

    public router: Router = null;



}