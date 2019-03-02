const { Service } = require('moleculer');

const compressFileHelper = require('../utils/compress-file');

class CompressorService extends Service {

    constructor(broker) {
        super(broker);

        this.parseServiceSchema({
            name: 'compressor',
            actions: {
                compress: {
                    params: {
                        filePath: 'string'
                    },
                    handler: this.compress
                }
            },
            events: {
                'electron.file-dropped': this.handleDroppedFile
            },
            created: this.serviceCreated
        });
    }

    compress(ctx) {

        return this.compressFile(ctx.params.filePath);
    }

    async handleDroppedFile(payload) {

        this.broker.emit('compressor.compressed', {
            id: payload.id,
            ...await this.compressFile(payload.filePath)
        });
    }

    serviceCreated() {

        this.logger.info(`Compressor Service created. PID ${process.pid}`);
    }

    compressFile(filePath) {

        // Helper method: Compress file, return: optimizedPath, sizeIn, sizeOut, percent
        return compressFileHelper(filePath);
    }
}

module.exports = CompressorService;
