import { Component } from '@angular/core';
import { UploadEvent, UploadFile, FileSystemFileEntry } from 'ngx-file-drop';
import { IPCService } from './ipc.service';

import * as async from 'async';
import * as _ from 'lodash';

interface UploadedFile extends UploadFile {
    id?: number;
    status: 'processing' | 'processed';
    path: string;
    optimizedPath?: string;
    sizeIn?: number;
    sizeOut?: number;
    percent?: number;
    thumbnailUrl?: string;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    public files: UploadedFile[] = [];

    constructor(private ipcService: IPCService) {

    }

    public async droppedV1(event: UploadEvent) {

        await this.receiveFiles(event.files);

        // @notice .forEach is used to process all the files in parallel
        this.files.forEach(async (file: UploadedFile) => {

            const thumbnailResult = await this.ipcService.call('thumbnail.create', {filePath: file.path});

            file.thumbnailUrl = thumbnailResult.thumbnailUrl;

            const compressResult = await this.ipcService.call('compressor.compress', {filePath: file.path});

            file.optimizedPath = compressResult.optimizedPath;
            file.sizeIn        = compressResult.sizeIn;
            file.sizeOut       = compressResult.sizeOut;
            file.percent       = compressResult.percent;

            file.status = 'processed';
        });
    }

    public async droppedV2(event: UploadEvent) {

        await this.receiveFiles(event.files);

        this.ipcService.on('thumbnail.created', (event, payload) => {

            const file: UploadedFile = _.find(this.files, item => payload.id === item.id);

            file.thumbnailUrl = payload.thumbnailUrl;
        });

        this.ipcService.on('compressor.compressed', (event, payload) => {

            const file: UploadedFile = _.find(this.files, item => payload.id === item.id);

            file.status = 'processed';

            file.optimizedPath = payload.optimizedPath;
            file.sizeIn        = payload.sizeIn;
            file.sizeOut       = payload.sizeOut;
            file.percent       = payload.percent;
        });

        for (let i = 0; i < this.files.length; i++) {

            this.ipcService.emit('electron.file-dropped', {
                id: i + 1,
                filePath: this.files[i].path
            });
        }
    }

    public download(file: UploadedFile) {

        this.ipcService.call('electron.save-file', {filePath: file.optimizedPath});
    }

    private async receiveFiles(files) {

        this.files = [];

        return new Promise((resolve, reject) => {

            async.forEachOf(files, (file, index, callback) => {

                const fileEntry = file.fileEntry as FileSystemFileEntry;

                fileEntry.file((f: File) => {

                    const uploadedFile: UploadedFile = {
                        id: index + 1,
                        ...file,
                        path: f.path,
                        status: 'processing'
                    };

                    this.files.push(uploadedFile);

                    callback();
                });

            }, err => {
                if (err) return reject(err);

                resolve();
            });
        });
    }
}
