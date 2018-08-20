import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SelectionsService } from './shared/selections.service';
import { FilterComponent } from './filter/filter.component';
import { FilterSelectionsPipe } from './shared/filter-selections.pipe';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    ToolbarComponent,
    FilterComponent,
    FilterSelectionsPipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    SelectionsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
