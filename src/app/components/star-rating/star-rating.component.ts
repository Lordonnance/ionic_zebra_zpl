import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnInit {
  @Input() rate: number;
  @Output() onRated = new EventEmitter<number>();
  constructor() { }

  ngOnInit() {
    
  }
  rate1() {
    this.rate = 1;
    this.onRated.emit(1);
  }
  rate2() {
    this.rate = 2;
    this.onRated.emit(2);
  }
  rate3() {
    this.rate = 3;
    this.onRated.emit(3);
  }
  rate4() {
    this.rate = 4;
    this.onRated.emit(4);
  }
  rate5() {
    this.rate = 5;
    this.onRated.emit(5);
  }
}