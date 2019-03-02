const {Service} = require('moleculer');
const {app, dialog, ipcMain} = require('electron');

const fs = require('fs-extra');
const path = require('path');

class ElectronService extends Service {

    constructor(broker) {
        super(broker);

        this.parseServiceSchema({
            name: 'electron',
            actions: {
                'save-file': {
                    params: {
                        filePath: 'string'
                    },
                    handler: this.saveFile
                }
            },
            events: {
                'compressor.*': this.handleEvent,
                'thumbnail.*': this.handleEvent
            },
            created: this.serviceCreated
        });
    }

    async saveFile(ctx) {

        const toLocalPath = path.resolve(app.getPath('desktop'), path.basename(ctx.params.filePath));

        const userChosenPath = dialog.showSaveDialog({defaultPath: toLocalPath});

        if (userChosenPath) {

            await fs.move(ctx.params.filePath, userChosenPath);
        }
    }

    handleEvent(payload, sender, event) {

        this.logger.info(`Event '${event}' received from ${sender} node`);

        this.metadata.webContents.send(event, payload);
    }

    serviceCreated() {

        this.logger.info(`Electron Service created. PID ${process.pid}`);

        ipcMain.on('call', async (event, notification) => {

            this.logger.info(`Call service: ${notification.service}`);

            event.sender.send('call-result', {
                id: notification.callId,
                result: await this.broker.call(notification.service, notification.params)
            });
        });

        ipcMain.on('emit', async (event, notification) => {

            if (!this.metadata.webContents) this.metadata.webContents = event.sender;

            this.logger.info(`Emit event: ${notification.event}`);

            this.broker.emit(notification.event, notification.payload);
        });
    }
}

module.exports = ElectronService;
