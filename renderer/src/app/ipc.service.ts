import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class IPCService {

    private callId: number = 0;

    private pendingCalls: any[] = [];

    constructor(public electronService: ElectronService) {

        this.electronService.ipcRenderer.on('call-result', (event, response) => {

            this.handleResponse(response);
        });
    }

    public async call(service: string, params: any): Promise<any> {

        const callId = this.getNextCallId();

        this.electronService.ipcRenderer.send('call', {callId, service, params});

        return new Promise<any>((resolve, reject) => {

            this.pendingCalls.push({
                id: callId,
                callback: (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            });
        });
    }

    public emit(event: string, payload: any) {

        this.electronService.ipcRenderer.send('emit', {event, payload});
    }

    public on(event: string, listener: (event, payload) => void) {

        this.electronService.ipcRenderer.on(event, listener);
    }

    private handleResponse(response) {

        const pendingCall = _.find(this.pendingCalls, {id: response.id});

        if (pendingCall) {

            pendingCall.callback(response.err, response.result);

            _.remove(pendingCall, {id: response.id});

        } else {

            console.error(`Couldn't find pending call data by id: ${response.id}`);
        }
    }

    private getNextCallId() {

        return ++this.callId;
    }
}
