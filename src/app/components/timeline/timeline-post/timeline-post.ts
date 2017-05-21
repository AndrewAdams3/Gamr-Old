import { Component, Input, OnInit } from '@angular/core';
import { SocialService } from '../../../services/social-service';
import { AuthService } from '../../../services/auth-service';
import { Router } from '@angular/router';
declare var $: any;
declare var lightbox: any;
@Component({
  selector: 'timeline-post',
  templateUrl: './timeline-post.html',
  styleUrls: ['./timeline-post.scss'],
})
export class TimelinePostComponent implements OnInit{
  user = JSON.parse( localStorage.getItem('user') );

  constructor( private _router: Router, private _socialService: SocialService, private _authService: AuthService ){
    lightbox.option({
      'resizeDuration': 300,
      'wrapAround': true,
      'disableScrolling': true,
      'alwaysShowNavOnTouchDevices': true
    })
  }

  @Input() post: any;
  
  ngOnInit() {
    $('#post-text>a').click((evt) => {
          evt.preventDefault();
          this._router.navigate(['/user', evt.target.innerText.substring(1)]);
      });
  }

  likePost() {
  	this._socialService.likePost( this.post.ID ).subscribe( res => {
  		this.post.liked = res.STATUS == 200 ? true : false;
  		if( res.LIKED ) {
  			this.post.liked = true;
  			this.post.likes++;
  		} else {
  			this.post.liked = false;
  			this.post.likes--;
  		}
  	});
  }
}
