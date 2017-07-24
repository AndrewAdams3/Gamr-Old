import { Component, OnInit, Input } from '@angular/core';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { TimelineService } from '../shared/timeline-service';
// Break post grabbing/polling into a function called by the initiators
@Component({
  selector: 'feed-item-actions',
  templateUrl: './feed-item-actions.html',
  styleUrls: ['./feed-item-actions.scss'],
  providers: [{provide: BsDropdownConfig, useValue: {autoClose: false}}]
})
export class FeedItemActionsComponent implements OnInit {
    @Input() post: any;
    user = JSON.parse(localStorage.getItem('user'));
    constructor( private _timelineService: TimelineService ){}
    ngOnInit() {}
}
