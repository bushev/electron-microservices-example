import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FileDropModule } from 'ngx-file-drop';
import { NgxElectronModule } from 'ngx-electron';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';

import { SizeFormat } from './sizeformat.pipe';

import { IPCService } from './ipc.service';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faDownload, faSpinner, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@NgModule({
    declarations: [
        AppComponent,
        SizeFormat
    ],
    imports: [
        BrowserModule,
        FileDropModule,
        NgxElectronModule,
        FontAwesomeModule
    ],
    providers: [IPCService],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {
        library.add(faDownload, faSpinner, faArrowRight);
    }
}
