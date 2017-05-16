import { Component, Input } from '@angular/core';
import { SocialService } from '../../../services/social-service';

@Component({
  selector: 'timeline-post',
  templateUrl: './timeline-post.html',
  styleUrls: ['./timeline-post.scss'],
})
export class TimelinePostComponent {
  user = JSON.parse( localStorage.getItem('user') );

  constructor( private _socialService: SocialService ){}

  @Input() post: any;

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
