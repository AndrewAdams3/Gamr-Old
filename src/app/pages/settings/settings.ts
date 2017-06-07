import { Component } from '@angular/core';
import { AuthService } from "../../services/auth-service";

@Component({
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
})

export class SettingsPage {
  user= JSON.parse(localStorage.getItem("user"));
  newTag= "";
  editID= 0;
  
  constructor(private _authService:AuthService){
    this.newTag=  this.user.tag;
  };
  
  updateOnEnter(id:string, e) {
    if(e.keyCode!= 13)
      return;
    
    this.editID= 0;
    this.update(id);
  }
  
  update(id:string) {
    switch(id)  {
      case "tag": {
        // TODO: update the user's tag here.
        this._authService.changeTag(this.user.tag, this.newTag).subscribe(res=> {
          console.log(res);
          this.newTag= "";
        });
      }break;
      case "display-name":  {
        // TODO: update the user's display name here
      }break;
      case "first-name":  {
        // TODO: update the user's first name here
      }break;
      case "last-name": {
        // TODO: update the user's last name here
      }break;
      case "description": {
        // TODO: update the user's description here.
      }break;
    }
  }
}

