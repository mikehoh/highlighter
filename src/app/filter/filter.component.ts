import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { ISelection } from '../shared/selection.interface';
import { SelectionsService } from '../shared/selections.service';
import { Color } from '../shared/color.type';

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
