import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
 
  @Input()  text!:   string;
  @Input()  color!:  string;
  givenColor: string = this.color;
  @Output() btnClick = new EventEmitter();
  
  constructor() {
    this.givenColor = this.color;
  }

  Hover(over: boolean) {
    this.givenColor= over ? 'white' : this.color;
    
  }

  onClick() {
    this.btnClick.emit();
  }

}
