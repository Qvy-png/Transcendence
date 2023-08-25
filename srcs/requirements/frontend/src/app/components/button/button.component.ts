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
  @Output() btnClick = new EventEmitter();

  Hover(over: boolean) {
    this.color = over ? 'white' : '#FFDE56';
  }

  onClick() {
    this.btnClick.emit();
  }

}
