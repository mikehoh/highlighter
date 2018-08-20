import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { ISelection } from '../shared/selection.interface';
import { SelectionsService } from '../shared/selections.service';
import { Color } from '../shared/color.type';

// Filter component gets highlights data from Selections Service and render it.
// It uses Toolbar component to select filter option.
// Filtering process manages with the pipe in the template.
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {

  dataSubscription: Subscription;
  selectionsData: ISelection[];
  activeColor: Color;

  constructor(
    private selectionsService: SelectionsService
  ) {}

  // It subscribes on changes in Selection Service.
  // All changes immediately reflects on the page.
  ngOnInit() {
    this.dataSubscription = this.selectionsService.selectionsChanged.subscribe(
      (data: ISelection[]) => {
        this.selectionsData = data;
      }
    );

    this.selectionsData = this.selectionsService.getList();
  }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
  }

}
