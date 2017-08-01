import { Component, OnInit, HostListener, NgZone } from '@angular/core';
import { TimelineService } from './shared/timeline-service';
import { EventService } from '../../services/event-service';
import * as _ from 'lodash';

/*---|--Timeline Stuff ----------------------------------------------------------------------- Pts -- Progress -- Complete --
| 1  |  Kill modal when closed so the inputs will refresh and loading will refresh           | ****|     💡     | --/--/---- |
| 2  |  Load more comments/replies                                                           |  ***|     💡     | --/--/---- |
| 3  |  When a post modal is open, poll for updates via universal poll                       | ****|     🚧     | --/--/---- |
| 4  |  Post/View Images (Imgur)                                                             |  ***|     💡     | --/--/---- |
| 5  |  Maybe make deleting posts turn all comments into posts with a "was_comment" tag      |   **|     💡     | --/--/---- |
|    |    - Do the same for replies if a comment was deleted. It'll be a "was_reply" tag     |  a  |     💡     | --/--/---- |
|    |    - This would be one to keep better track of actual post counts                     |  b  |     💡     | --/--/---- |
| 6  |  Sharing Posts/Comments/Replies                                                       | ****|     💡     | --/--/---- |
| 7  |  Posting Links                                                                        | ****|     💡     | --/--/---- |
| 8  |  #tags                                                                                |*****|     💡     | --/--/---- |
| 9  |  Auto-color @inputs as you type                                                       |*****|     🚧     | --/--/---- |
|    |    - Should include dropdown of potential mentions                                    |  a  |     🚧     | --/--/---- |
|    |    - Change to contenteditable div and stuff                                          |  b  |     🚧     | --/--/---- |
|    |    - Auto populate @mention when opening reply input                                  |  c  |     🚧     | --/--/---- |
|    |   - The same functionality as 9, but for the tags                                     |  d  |     🚧     | --/--/---- |
| 10 |  Posting videos/viewing videos                                                        |*****|     💡     | --/--/---- |
---------------------------------------------------------------------------------------------------------------------------*/

/* Other Stuff
  1.)  Universal Polling that handles different things (notifications, indiv. post updates,
       timeline updates, etc...)
*/

/* Future Stuff
    The whole timeline is a vertical timeline and when you click a post it "zooms" in on
    a branch that holds comments/replies and stuff
*/

@Component({
  selector: 'timeline',
  templateUrl: './timeline.html',
  styleUrls: ['./timeline.scss'],
})
export class TimelineComponent implements OnInit {
  posts: any;
  postBuffer: any = [];
  loadingMore = false;
  endOfTime = false;
  @HostListener('window:scroll', ['$event']) checkPosition(event) {
    if ((window.innerHeight + window.scrollY) >= event.target.scrollingElement.scrollHeight - 100) {
        if ( this.loadingMore || this.endOfTime ) { return;  }
        this.loadingMore = true;
        this._timelineService.populateFeed(
          this._timelineService.convertTimestamp(this.posts[this.posts.length - 1].timestamp), false
        ).subscribe( res => {
          this.zone.run(() => {
            if ( res.length === 0 ) {
              this.endOfTime = true;
            }
            this.loadingMore = false;
            this.posts.push(...res);
          });
        });
    }
  }

  constructor(
    private _timelineService: TimelineService,
    private _eventService: EventService,
    private zone: NgZone
  ){}

  ngOnInit() {
    this._timelineService.populateFeed('start', false).subscribe( res => {
      this.posts = res ;
      this._timelineService.updatePollTimestamp(res[0].timestamp);
      this._timelineService.pollProcess();
    });
    this._timelineService.$feedDestroyer.subscribe( data => this.removeFeedItem(data) );
    this._eventService.merger$.subscribe( trigger => this.mergeBuffer() );
    this._timelineService.timelineUpdate.subscribe( update => {
      if ( update.type === 'many' ) {
        this.postBuffer.unshift(...update.data);
        this._timelineService.updatePollTimestamp( this.postBuffer[0].timestamp );
        this._eventService.emitUnread(this.postBuffer.length);
      } else if ( update.type === 'single' ) {
        this.posts[_.findKey(this.posts, { 'ID': update.data.ID})] = update.data;
      }
    });
  }


  removeFeedItem(data) {
      let postIndex = null;
      switch ( data.type ) {
        case 'post':
          this.posts = this.posts.filter( post => { return post.ID !== data.targetID; });
          break;
        case 'comment':
          postIndex = _.findKey(this.posts, { 'ID': data.postID });
          this.posts[postIndex].response_count--;
          this.posts[postIndex].comments = this.posts[postIndex].comments.filter(
            comment => { return comment.ID !== data.targetID; }
          );
          break;
        case 'reply':
          postIndex = _.findKey(this.posts, { 'ID': data.postID });
          const post = this.posts[postIndex];
          this.posts[postIndex].response_count--;
          const commentIndex = _.findKey(post.comments, {'ID': data.commentID});
          this.posts[postIndex].comments[commentIndex].replies = this.posts[postIndex].comments[commentIndex].replies.filter(
            reply => { return reply.ID !== data.targetID; }
          );
          break;
      }
  }

  save(event) {
    this._timelineService.saveItem(event.text, event.attachments).subscribe( res => {
      if ( res.status === 200 ) {
        this.postBuffer.unshift(res.post);
        this._eventService.emitUnread(this.postBuffer.length);
        this._timelineService.updatePollTimestamp( this.postBuffer[0].timestamp );
      }
    });
  }

  mergeBuffer() {
    for ( const newPost of this.postBuffer.reverse() ) {
      _.remove(this.posts, { ID: newPost.ID });
      this.posts.unshift(newPost);
    }
    this.postBuffer = [];
    this._eventService.emitUnread( 0 );
  }
}
