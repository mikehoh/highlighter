import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Color } from '../shared/color.type';
import { ISelection } from '../shared/selection.interface';
import { SelectionsService } from '../shared/selections.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  activeColor: Color = 'yellow';
  text: string = `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`;
  @ViewChild('input') input: ElementRef;
  isEdititng = false;
  defaultValue: ISelection = {
    start: null,
    end: null,
    text: '',
    color: null
  };
  newText: ISelection;

  constructor(
    private selectionsService: SelectionsService
  ) {
    this.newText = {...this.defaultValue};
  }

  ngOnInit() {
    document.execCommand('defaultParagraphSeparator', false, 'p');
  }

  onMouseUp(): void {
    if (window.getSelection().toString().trim().length === 0) {
      return;
    }

    document.execCommand('hiliteColor', false, (this.activeColor || ''));

    const selection: ISelection = this.getSelectionData(window.getSelection().getRangeAt(0));
    this.selectionsService.add(selection);
  }

  onKeyUp(event): void {
    const range = window.getSelection().getRangeAt(0);
    const start = this.getStartingPoint(range);

    const input = event.key;
    if (input.length === 1) {
      this.newText.end = start;
    } else if ([13, 37, 38, 39, 40].includes(event.which)) {
      this.onEnteringEnd();
      this.newText.start = start;
      this.newText.end = start;
    } else if (event.which === 8) {
      this.newText.end = start;
      if (this.newText.end < this.newText.start) {
        this.newText.start = start;
      }
      this.onDeleteChars();
    }
  }

  onFocus(event): void {
    if (this.isEdititng) {
      this.onEnteringEnd();
    }

    const range = window.getSelection().getRangeAt(0);
    const start = this.getStartingPoint(range);

    this.isEdititng = true;
    this.newText.start = start;
    this.newText.end = start;
  }

  onBlur(event): void {
    this.onEnteringEnd();
  }

  private onEnteringEnd(): void {
    this.isEdititng = false;
    this.newText.text =
      this.input.nativeElement.textContent.substring(this.newText.start, this.newText.end);
    if (this.newText.start !== this.newText.end && this.newText.text.length > 0) {
      this.selectionsService.updateSelections(this.newText);
    }
    this.newText = {...this.defaultValue};
  }

  private onDeleteChars(): void {
    this.newText.text =
      this.input.nativeElement.textContent.substring(this.newText.start, this.newText.end);
    this.selectionsService.updateSelectionsAfterDelete(this.newText);
  }

  private getStartingPoint(range: Range): number {
    const selectedLength = range.toString().length;
    const beforeCaretRange = range.cloneRange();
    beforeCaretRange.selectNodeContents(this.input.nativeElement);
    beforeCaretRange.setEnd(range.endContainer, range.endOffset);
    const selectionStart = beforeCaretRange.toString().length - selectedLength;
    return selectionStart;
  }

  private getSelectionData(range: Range): ISelection {
    const selectedLength = range.toString().length;
    const selectionStart = this.getStartingPoint(range);

    return {
      text: range.toString(),
      color: this.activeColor,
      start: selectionStart,
      end: selectionStart + selectedLength - 1
    };
  }

}
