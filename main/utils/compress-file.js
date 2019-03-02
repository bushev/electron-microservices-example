const path           = require('path');
const tmp            = require('tmp');
const compressImages = require('compress-images');

module.exports = filePath => {

    return new Promise((resolve, reject) => {

        const tmpObj = tmp.dirSync();

        compressImages(
            filePath,
            `${tmpObj.name}${path.sep}`,
            { compress_force: true, statistic: true, autoupdate: false },
            false,
            {
                jpg: { engine: 'mozjpeg', command: ['-quality', '60'] }
            },
            {
                png: { engine: 'pngquant', command: ['--quality=20-50'] }
            },
            {
                svg: { engine: 'svgo', command: '--multipass' }
            },
            {
                gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] }
            }, (err, completed, statistic) => {
                if (err) return reject(err);

                resolve({
                    optimizedPath: statistic.path_out_new,
                    sizeIn: statistic.size_in,
                    sizeOut: statistic.size_output,
                    percent: statistic.percent
                });
            }
        );
    });
};
