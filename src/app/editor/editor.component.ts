import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Color } from '../shared/color.type';
import { ISelection } from '../shared/selection.interface';
import { SelectionsService } from '../shared/selections.service';

// Editor component lets enter a text and make highlights.
// It uses Toolbar component to choose highlight color.
// Div html element with contenteditable attribute uses to work with text.
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  // Default highlight color
  activeColor: Color = 'yellow';

  // Lorem ipsum text for tests
  text = `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
    architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
    aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
    sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
    adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.`;

  // Ref to the DOM div editor
  @ViewChild('input') input: ElementRef;

  // Flag which is on when we are working with the text
  isEdititng = false;

  // Variable which contains new added piece of text
  newText: ISelection;

  // Default value to reset newText when editing is finished
  defaultValue: ISelection = {
    start: null,
    end: null,
    text: '',
    color: null
  };

  constructor(
    private selectionsService: SelectionsService
  ) {
    this.newText = {...this.defaultValue};
  }

  // By default this parameter has value 'div' which does not fit to our case.
  ngOnInit() {
    document.execCommand('defaultParagraphSeparator', false, 'p');
  }

  // Fires when left mouse button is released and we can proceed with selected text.
  // Highlight selected text with active color.
  // Get this selected text as selection object with all necessary data
  // (text, color, start position, end position).
  // Add this object to the Selection Service to keep it there.
  onMouseUp(event): void {
    if (window.getSelection().toString().trim().length === 0) {
      return;
    }

    let foreColor = '#000';
    if (this.activeColor === 'green') {
      foreColor = '#fff';
    }
    document.execCommand('hiliteColor', false, this.activeColor);
    document.execCommand('foreColor', false, foreColor);

    const selection: ISelection = this.getSelectionData(window.getSelection().getRangeAt(0));
    this.selectionsService.add(selection);
  }

  // Fires when any keys pressed
  // By starting typing it collects entered text positions - start and end.
  // By pressing on 'enter' or any arrow keys it stops collecting and gives control to another
  // method - onEnteringEnd - to keep all changes.
  // Also by pressing 'backspace' it gives control to corresponding method - onDeleteChars.
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

  // Fires when focus on editor (place cursor on text).
  // By this action it starts editing proccess.
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

  // When focus is lost we need to keep all changes
  onBlur(event): void {
    this.onEnteringEnd();
  }

  // Finishes editing and gets all new entered text.
  // As usual, new text has impact on already saved highlights, so we have to transfer new text to
  // Selections Service to check, update and save if necessary.
  private onEnteringEnd(): void {
    this.isEdititng = false;
    this.newText.text =
      this.input.nativeElement.textContent.substring(this.newText.start, this.newText.end);
    if (this.newText.start !== this.newText.end && this.newText.text.length > 0) {
      this.selectionsService.updateSelections(this.newText);
    }
    this.newText = {...this.defaultValue};
  }

  // Also as entering, deleting characters has impact on saved highlights.
  // Transfers deleted range to Selection Service to make all checks and update highlights if
  // necessary.
  private onDeleteChars(): void {
    this.newText.text =
      this.input.nativeElement.textContent.substring(this.newText.start, this.newText.end);
    this.selectionsService.updateSelectionsAfterDelete(this.newText);
  }

  // Helper where we can get selection start position, or current cursor position.
  private getStartingPoint(range: Range): number {
    const selectedLength = range.toString().length;
    const beforeCaretRange = range.cloneRange();
    beforeCaretRange.selectNodeContents(this.input.nativeElement);
    beforeCaretRange.setEnd(range.endContainer, range.endOffset);
    const selectionStart = beforeCaretRange.toString().length - selectedLength;
    return selectionStart;
  }

  // Gets new selections range and creats a new Selection object.
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
