import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { ISelection } from './selection.interface';
import { IRange } from './range.interface';

// Selections Service is the heart of the application.
// It stores all information about selections.
// It gets, checks and makes updates in selections storage
// Filter component gets actual state of data from here
@Injectable()
export class SelectionsService {

  // Changes subject, Filter component subscribed on this changes.
  selectionsChanged = new Subject<ISelection[]>();

  // Main storage of all created selections
  private selections: ISelection[] = [];

  // Storage for current new selection. It could be changed while checking, so it should be
  // available from all service methods.
  private newSelection: ISelection;

  // Stores actions history. Uses to make correct selections merge.
  private actionsQueue: string[] = [];

  // Returns current state of selections
  getList(): ISelection[] {
    return this.selections.map(item => ({...item}));
  }

  // Receives new selection data and transfers it to checking.
  add(selection: ISelection): void {
    this.recalculateIntersections(selection);
  }

  // Receives new text data and transfers to checking existing selections.
  updateSelections(selection: ISelection): void {
    this.recalculateSelections(selection);
  }

  // Receives data about deleted range.
  updateSelectionsAfterDelete(selection: ISelection): void {
    this.recalculateSelectionsAfterDelete(selection);
  }

  // Removes selection from storage by specified index.
  private removeItem(index: number): void {
    this.selections.splice(index, 1);
  }

  // Appends multiple items to storage.
  // Uses when we need to split some existing selection by two parts.
  // ex. another color highlight added in the middle of exisiting selection.
  private appendItems(chunks: ISelection[]): void {
    this.selections = [...this.selections, ...chunks];
  }

  // Append a new highlight to the storage. After that sorts selections to keep them in right
  // order, like in editor.
  // At the end it send a message with new storage to subscribed Filter component.
  private appendItem(selection: ISelection): void {
    this.selections = [...this.selections, selection];
    this.selections.sort((a, b) => a.start - b.start);
    this.selectionsChanged.next(this.selections.map(item => ({...item})));
  }

  // With a new selection we have to check if it intersects or not with other existing selections.
  // If no intersections, it's just add a new selection to the storage
  // If intersection exist, it gevs control to a method to manage this intersection.
  // After that it checks if similar selection exists (one covers other).
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

  // Gets existing selection and a new one. Checks if they have intersection.
  // Contains some conditions to verify intersection position.
  // Returns object with intersection range.
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

  // Receives selection object, its index in storage and intersection range
  // With all this information it selects a strategy what to do.
  // Possible actions:
  // - Split selection by two
  // - Cut selection from the left side
  // - Cut selection from the right side
  // - Remove selection if it's covered by new a selection
  // Each strategy calls a method to do that.
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

  // Split selection by two selections
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

  // Returns selection tail part if head part intersected
  private getSelectionTail(selection: ISelection, intersection: IRange): ISelection {
    return {
      text: selection.text.substring(intersection.end - selection.start + 1, selection.end - selection.start + 1),
      color: selection.color,
      start: intersection.end + 1,
      end: selection.end
    };
  }

  // Appends selection on the left side
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

  // Returns selection head part if tail part intersected
  private getSelectionHead(selection: ISelection, intersection: IRange): ISelection {
    return {
      text: selection.text.substring(0, intersection.start - selection.start),
      color: selection.color,
      start: selection.start,
      end: intersection.start - 1
    };
  }

  // Appends selection on the right side
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

  // Cheks all selections if they are contain others
  // If it found such cases, it removes unwanted selections
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

  // Checks if new entered text has impact on existing selections.
  // Handles if a new text added before each selection,
  // after selection (best case - need to change nothing:),
  // inside exisitng selection.
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

  // Checks if new deleted characters has impact on existing selections.
  // Handles if characters deleted before each selection,
  // after selection, selection deleted partially in different places.
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
