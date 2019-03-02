const { Service } = require('moleculer');

const createThumbnail = require('../utils/create-thumbnail');

class ThumbnailService extends Service {

    constructor(broker) {
        super(broker);

        this.parseServiceSchema({
            name: 'thumbnail',
            actions: {
                create: {
                    params: {
                        filePath: 'string'
                    },
                    handler: this.create
                }
            },
            events: {
                'electron.file-dropped': this.handleDroppedFile
            },
            created: this.serviceCreated
        });
    }

    create(ctx) {

        return this.createThumbnail(ctx.params.filePath);
    }

    async handleDroppedFile(payload) {

        this.broker.emit('thumbnail.created', {
            id: payload.id,
            ...await this.createThumbnail(payload.filePath)
        });
    }

    serviceCreated() {

        this.logger.info(`Thumbnail Service created. PID ${process.pid}`);
    }

    async createThumbnail(filePath) {

        // Helper method: Create thumbnail, return base64 encoded string
        return createThumbnail(filePath);
    }
}

module.exports = ThumbnailService;
