import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { ISelection } from './selection.interface';
import { IRange } from './range.interface';

@Injectable()
export class SelectionsService {

  selectionsChanged = new Subject<ISelection[]>();
  private selections: ISelection[] = [];
  private newSelection: ISelection;
  private actionsQueue: string[] = [];

  getList(): ISelection[] {
    return this.selections.map(item => ({...item}));
  }

  add(selection: ISelection): void {
    this.recalculateIntersections(selection);
  }

  updateSelections(selection: ISelection): void {
    this.recalculateSelections(selection);
  }

  updateSelectionsAfterDelete(selection: ISelection): void {
    this.recalculateSelectionsAfterDelete(selection);
  }

  private removeItem(index: number): void {
    this.selections.splice(index, 1);
  }

  private appendItems(chunks: ISelection[]): void {
    this.selections = [...this.selections, ...chunks];
  }

  private appendItem(selection: ISelection): void {
    this.selections = [...this.selections, selection];
    this.selections.sort((a, b) => a.start - b.start);
    this.selectionsChanged.next(this.selections.map(item => ({...item})));
  }

  private recalculateIntersections(newSelection: ISelection): void {
    this.newSelection = newSelection;
    const selections = [...this.selections];
    if (selections.length > 0) {
      let noIntersections = true;
      selections.forEach((selection, index) => {
        const intersection: IRange = this.getIntersection(selection, this.newSelection);
        if (intersection) {
          noIntersections = false;
          this.updateSelection(selection, index, intersection);
        }
      });
      if (noIntersections) {
        this.appendItem(this.newSelection);
      } else {
        for (let i = 0; i < this.selections.length; i++) {
          this.selections = this.mergeSimilarSelections(this.selections);
        }
        this.selectionsChanged.next(this.selections.map(item => ({...item})));
      }
    } else {
      this.appendItem(this.newSelection);
    }
  }

  private getIntersection(
    selection: ISelection, newSelection: ISelection): IRange {
    const minSelection = (selection.start < newSelection.start) ? selection : newSelection;
    const maxSelection = (minSelection === selection) ? newSelection : selection;

    if (selection.end === newSelection.start && selection.end === newSelection.end) {
      if (minSelection.end < maxSelection.end) {
        return null;
      }
    } else if (selection.start === newSelection.start && selection.start === newSelection.end) {
      if (minSelection.end > maxSelection.start) {
        return null;
      }
    } else {
      if (minSelection.end < maxSelection.start) {
        return null;
      }
    }
    return {
      start: maxSelection.start,
      end: (minSelection.end < maxSelection.end) ? minSelection.end : maxSelection.end
    };
  }

  private updateSelection(selection: ISelection, index: number, intersection: IRange): void {
    const ss = selection.start,
          se = selection.end,
          is = intersection.start,
          ie = intersection.end;

    if (ss !== is && se !== ie) {
      if (selection.color !== this.newSelection.color) {
        const chunks: ISelection[] = this.splitSelection(selection, intersection);
        this.removeItem(index);
        this.appendItems(chunks);
        this.appendItem(this.newSelection);
        this.actionsQueue.push('split');
      } else {
        console.log('do nothing');
      }
    } else if (ss === is && se !== ie) {
      if (selection.color !== this.newSelection.color) {
        const tail: ISelection = this.getSelectionTail(selection, intersection);
        this.removeItem(index);
        this.appendItem(tail);
        this.appendItem(this.newSelection);
        this.actionsQueue.push('left');
      } else {
        this.newSelection = this.appendSelectionLeft(selection, this.newSelection, intersection);
        this.removeItem(index);
        this.appendItem(this.newSelection);
        this.actionsQueue.unshift('left');
      }
    } else if (ss !== is && se === ie) {
      if (selection.color !== this.newSelection.color) {
        const head: ISelection = this.getSelectionHead(selection, intersection);
        this.removeItem(index);
        this.appendItem(head);
        this.appendItem(this.newSelection);
        this.actionsQueue.push('right');
      } else {
        this.newSelection = this.appendSelectionRight(selection, this.newSelection, intersection);
        this.removeItem(index);
        this.appendItem(this.newSelection);
        this.actionsQueue.push('right');
      }
    } else if (ss <= is && se <= ie) {
      this.removeItem(index);
      this.appendItem(this.newSelection);
      this.actionsQueue.push('remove');
    }
  }

  private splitSelection(selection: ISelection, intersection: IRange): ISelection[] {
    const firstSelection: ISelection = {
      text: selection.text.substring(0, intersection.start - selection.start),
      color: selection.color,
      start: selection.start,
      end: intersection.start - 1
    };
    const secondSelection: ISelection = {
      text: selection.text.substring(intersection.end - selection.start + 1, selection.end - selection.start + 1),
      color: selection.color,
      start: intersection.end + 1,
      end: selection.end
    };
    return [firstSelection, secondSelection];
  }

  private getSelectionTail(selection: ISelection, intersection: IRange): ISelection {
    return {
      text: selection.text.substring(intersection.end - selection.start + 1, selection.end - selection.start + 1),
      color: selection.color,
      start: intersection.end + 1,
      end: selection.end
    };
  }

  private appendSelectionLeft(
    selection: ISelection, newSelection: ISelection, intersection: IRange): ISelection {
    const tail = selection.text.substring(intersection.end - selection.start + 1, selection.end - selection.start + 1);
    return {
      text: newSelection.text + tail,
      color: newSelection.color,
      start: newSelection.start,
      end: selection.end
    };
  }

  private getSelectionHead(selection: ISelection, intersection: IRange): ISelection {
    return {
      text: selection.text.substring(0, intersection.start - selection.start),
      color: selection.color,
      start: selection.start,
      end: intersection.start - 1
    };
  }

  private appendSelectionRight(
    selection: ISelection, newSelection: ISelection, intersection: IRange): ISelection {
    const head = selection.text.substring(0, intersection.start - selection.start);
    return {
      text: head + newSelection.text,
      color: newSelection.color,
      start: selection.start,
      end: newSelection.end
    };
  }

  private mergeSimilarSelections(selections: ISelection[]): ISelection[] {
    const selectionsCopy = [...selections];
    for (let i = 0; i < selectionsCopy.length - 1; i++) {
      const s1 = selectionsCopy[i],
            s2 = selectionsCopy[i + 1];
      const intersection: IRange = this.getIntersection(s1, s2);
      if (intersection && s1.color === s2.color) {
        if ((this.actionsQueue.length === 1 && this.actionsQueue[0] === 'left') ||
            (this.actionsQueue[this.actionsQueue.length - 1] === 'left' && this.actionsQueue[this.actionsQueue.length - 2] === 'right') ||
            (this.actionsQueue[this.actionsQueue.length - 1] === 'remove')) {
          selectionsCopy.splice(i + 1, 1);
        } else {
          selectionsCopy.splice(i, 1);
        }
      }
    }
    return selectionsCopy;
  }

  private recalculateSelections(newText: ISelection): void {
    const delta = newText.end - newText.start;

    this.selections
    .filter(item => newText.start < item.end)
    .forEach((selection, index) => {
      const intersection: IRange = this.getIntersection(selection, newText);

      if (!intersection) {
        selection.start += delta;
        selection.end += delta;
      } else {
        if (newText.start < selection.end && newText.end < selection.end) {
          selection.end += delta;
          const position = newText.start - selection.start;
          selection.text = [
            selection.text.slice(0, position),
            newText.text,
            selection.text.slice(position)
          ].join('');
        }
      }
    });
    this.selectionsChanged.next(this.selections.map(item => ({...item})));
  }

  private recalculateSelectionsAfterDelete(deleted: ISelection): void {
    const delta = -1;

    this.selections
    .filter(item => deleted.end <= item.end)
    .forEach((selection, index) => {
      const intersection: IRange = this.getIntersection(selection, deleted);

      if (!intersection) {
        selection.start += delta;
        selection.end += delta;
      } else {
        if (deleted.end === selection.start) {
          selection.text = selection.text.substring(1);
        } else if (deleted.start < selection.end && deleted.end < selection.end) {
          selection.text = [
            selection.text.slice(0, deleted.end - selection.start),
            selection.text.slice(deleted.start - selection.start + 1)
          ].join('');
        } else if (deleted.end === selection.end) {
          selection.text = selection.text.slice(0, -1);
        }
        selection.end += delta;
      }
    });
    this.selectionsChanged.next(this.selections.map(item => ({...item})));
  }

}
