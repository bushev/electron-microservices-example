const sharp = require('sharp');

module.exports = async filePath => {

    const buffer = await sharp(filePath)
        .resize({ height: 100 })
        .toBuffer();

    const kind = /\.(jpg|jpeg)$/.test(filePath) ? 'jpeg' : 'png';

    return { thumbnailUrl: `data:image/${kind};base64,${buffer.toString('base64')}` };
};
