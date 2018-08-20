import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // text = ``;
  // currentColor = 'yellow';

  // ngOnInit() {
  //   // document.designMode = 'on';
  //   document.execCommand('defaultParagraphSeparator', false, 'p');
  // }

  // onMouseUp(event, input): void {
  //   if (window.getSelection().toString().trim().length === 0) {
  //     return;
  //   }

  //   var range = window.getSelection().getRangeAt(0);
  //   var selected = range.toString().length; // *
  //   var preCaretRange = range.cloneRange();
  //   preCaretRange.selectNodeContents(input);
  //   preCaretRange.setEnd(range.endContainer, range.endOffset);
  //   let caretOffset;
  //   if(selected){ // *
  //     caretOffset = preCaretRange.toString().length - selected; // *
  //   } else { // *
  //     caretOffset = preCaretRange.toString().length;
  //   }
  //   var selectionEnd = caretOffset + selected;
  //   console.log(caretOffset, selectionEnd, range.toString(), this.currentColor);
  //   // console.log(window.getSelection().toString(), text);
  //   // const selection = window.getSelection().getRangeAt(0);
  //   // console.log('selection', window.getSelection().toString(), window.getSelection());
  //   // const ranges = this.getRanges(selection);
  //   // console.log(input.textContent, window.getSelection().toString(), input.textContent.indexOf(window.getSelection().toString()));
  //   // debugger

  //   // for (let i = 0; i < ranges.length; i++) {
  //   //   this.highlightRange(ranges[i]);
  //   // }
  //   // this.highlightRange(selection);
  //   document.execCommand('hiliteColor', false, (this.currentColor || ''));
  // }

  // onKeyUp(event, input) {
  //   if (event.which === 13) {
  //     // debugger
  //     // console.log(input.children);
  //     // // input.nativeElement
  //     // for (const element of input.children) {
  //     //   if (element.tagName !== 'DIV') {
  //     //     continue;
  //     //   }
  //     //   console.log(element);
  //     //   // debugger
  //     //   const text = '<br>' + element.innerHTML;
  //     //   // element.outerHTML.replace(/^<div>(\w|\W)*/, text);
  //     //   element.outerHTML = text;
  //     // }
  //   }
  // }

  // ngOnDestroy() {
  //   // document.designMode = 'off';
  // }

  // private highlightRange(range) {
  //   const newNode = document.createElement('span');
  //   newNode.classList.add(this.currentColor);
  //   range.surroundContents(newNode);
  // }

  // private getRanges(ranges) {
  //   const containerText = ranges.commonAncestorContainer;
  //   // console.log(ranges, containerText);
  //   // Starts -- Work inward from the start, selecting the largest safe range
  //   // var s = new Array(0), rs = new Array(0);
  //   const startStrings = [];
  //   const startRanges = [];

  //   if (ranges.startContainer !== containerText) {
  //     for (let i = ranges.startContainer; i !== containerText; i = i.parentNode) {
  //       // console.log('i=', i);
  //       startStrings.push(i);
  //     }
  //   }

  //   if (0 < startStrings.length) {
  //     for (let i = 0; i < startStrings.length; i++) {
  //       const xs = document.createRange();
  //       if (i) {
  //         xs.setStartAfter(startStrings[i - 1]);
  //         xs.setEndAfter(startStrings[i].lastChild);
  //       } else {
  //         xs.setStart(startStrings[i], ranges.startOffset);
  //         xs.setEndAfter(
  //           (startStrings[i].nodeType === Node.TEXT_NODE) ? startStrings[i] : startStrings[i].lastChild
  //         );
  //       }
  //       startRanges.push(xs);
  //     }
  //   }
  //   // console.log('rs', startRanges, 's', startStrings);

  //   const endStrings = [];
  //   const endRanges = [];

  //   if (ranges.endContainer !== containerText) {
  //     for (let i = ranges.endContainer; i !== containerText; i = i.parentNode) {
  //       endStrings.push(i);
  //     }
  //   }
  //   // console.log('e=', endStrings);

  //   if (0 < endStrings.length) {
  //     for (let i = 0; i < endStrings.length; i++) {
  //       const xe = document.createRange();
  //       if (i) {
  //         xe.setStartBefore(endStrings[i].firstChild);
  //         xe.setEndBefore(endStrings[i - 1]);
  //       } else {
  //         xe.setStartBefore(
  //             (endStrings[i].nodeType === Node.TEXT_NODE) ? endStrings[i] : endStrings[i].firstChild
  //         );
  //         xe.setEnd(endStrings[i], ranges.endOffset);
  //       }
  //       endRanges.unshift(xe);
  //     }
  //   }

  //   // console.log('e=', endStrings, 're=', endRanges);

  //   let xm;
  //   if ((0 < startStrings.length) && (0 < endStrings.length)) {
  //     xm = document.createRange();
  //     xm.setStartAfter(startStrings[startStrings.length - 1]);
  //     xm.setEndBefore(endStrings[endStrings.length - 1]);
  //   } else {
  //     return [ranges];
  //   }

  //   startRanges.push(xm);
  //   const result = startRanges.concat(endRanges);
  //   // console.log('result=', result);
  //   return result;

  // }

}
