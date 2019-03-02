'use strict';

const { spawn }         = require('threads');
const { ServiceBroker } = require('moleculer');

const ElectronService = require('./services/electron.service');

class Loader {

    static get config() {

        return {
            services: [{
                name: 'compressor',
                nodeID: 'compressor-node-1'
            }, {
                name: 'compressor',
                nodeID: 'compressor-node-2'
            }, {
                name: 'thumbnail',
                nodeID: 'thumbnail-node-1'
            }],
            transporter: {
                type: 'TCP',
                options: {
                    udpBindAddress: '127.0.0.1'
                }
            }
        };
    }

    static async loadServices() {

        for (const service of Loader.config.services) {

            const thread = spawn(options => {

                const path              = require('path');
                const { ServiceBroker } = require('moleculer');

                const service = require(path.resolve(options.__dirname, 'services', `${options.name}.service.js`));

                const broker = new ServiceBroker({
                    nodeID: options.nodeID,
                    transporter: options.transporter
                });

                broker.createService(service);

                broker.start().then(() => {
                    console.log(`Service Broker started, service: ${options.name}`);
                }).catch(err => {
                    throw err;
                });
            });

            thread
                .send({
                    name: service.name,
                    nodeID: service.nodeID,
                    transporter: Loader.config.transporter,
                    __dirname
                })
                .on('error', err => {
                    throw err;
                })
                .on('exit', () => {
                    console.log('Service has been terminated.');
                });
        }
    }

    static async loadElectronBroker() {

        const electronBroker = new ServiceBroker({
            nodeID: 'electron-node',
            transporter: Loader.config.transporter
        });

        electronBroker.createService(ElectronService);

        await electronBroker.start();
    }
}

module.exports = Loader;
