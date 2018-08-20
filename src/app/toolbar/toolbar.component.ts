import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Color } from '../shared/color.type';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  @Input() activeColor: Color;
  @Output() activeColorChange: EventEmitter<Color> = new EventEmitter<Color>();

  onButtonClick(color: Color): void {
    this.activeColor = color;
    this.activeColorChange.next(this.activeColor);
  }

}
