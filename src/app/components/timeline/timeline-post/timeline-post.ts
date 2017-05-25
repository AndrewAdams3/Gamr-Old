import { Component, Input, OnInit } from '@angular/core';
import { SocialService } from '../../../services/social-service';
import { Router } from '@angular/router';
import { Lightbox, LightboxConfig } from 'angular2-lightbox';

@Component({
  selector: 'timeline-post',
  templateUrl: './timeline-post.html',
  styleUrls: ['./timeline-post.scss'],
})
export class TimelinePostComponent implements OnInit{
  user = JSON.parse( localStorage.getItem('user') );
  @Input() post: any;
  regex: any;
  constructor( private _lightboxConfig: LightboxConfig, private _lightbox: Lightbox, private _socialService: SocialService ) {}

  ngOnInit() {
    this._lightboxConfig.wrapAround = true;
    this._lightboxConfig.fitImageInViewPort = true;
    this.regex = new RegExp(`${this.post.uuid}`, 'g');
  }

  likePost() {
    this._socialService.likePost( this.post.ID ).subscribe( res => {
      this.post.liked = res.STATUS === 200 ? true : false;
      if ( res.LIKED ) {
        this.post.liked = true;
        this.post.likes++;
      } else {
        this.post.liked = false;
        this.post.likes--;
      }
    });
  }

  open(index: number, event): void {
    this._lightboxConfig.positionFromTop = event.pageY  - event.y + event.y / 4;
    this._lightbox.open(this.post.images, index);
  }
}
