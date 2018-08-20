import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Color } from '../shared/color.type';

// Toolbar component is using in both components - Editor, Filter. Here you can choose a color for parent component needs.
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  @Input() activeColor: Color;
  @Output() activeColorChange: EventEmitter<Color> = new EventEmitter<Color>();

  // Set active color to see active button and emit it to a parent component
  onButtonClick(color: Color): void {
    this.activeColor = color;
    this.activeColorChange.next(this.activeColor);
  }

}
