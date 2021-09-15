import path from 'path';
import Jimp from 'jimp';
import outCon from './outCon';

const imagesDir: string = path.join(__dirname, "../load/", process.argv[2]);    // Directory of images to read
let asciiCharRamp: string = "░▒▓█";                                           // Characters ramp for grayscale representation in ASCII
const crLenght: number = asciiCharRamp.length;                                  // Characters ramp lenght

if (outCon.blankCharacter) {
    asciiCharRamp = ` ${asciiCharRamp}`;
}

const rgbToGray = (r: number, g: number, b: number): number => {
    return 0.21 * r + 0.72 * g + 0.07 * b;
};

const toGrayScale = (image: any, w: number, h: number) => {
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            // Get the RGBA values of each image pixel and convert them to grayscale
            const pixelColorInt: number = image.getPixelColor(x, y);
            let { r, g, b, a } = Jimp.intToRGBA(pixelColorInt);
            const grayScalePix: number = rgbToGray(r, g, b);
            r = g = b = grayScalePix;

            const gsInt: number = Jimp.rgbaToInt(r, g, b, a);
            image.setPixelColor(gsInt, x, y);
        }
    }
    
    return image;
};

const resizeImg = (image: any, w: number, h: number) => {
    const swPercentage: number = Math.round(outCon.resolution / w * 100);
    image.resize(outCon.resolution, (swPercentage / 100 * h) / 2);
    return image;
};

const toAscii = (image: any, w: number, h: number) => {
    let result: string[] = [];

    for (let y = 0; y < h; y++) {
        let line: string = "";

        for (let x = 0; x < w; x++) {
            const pixelGrayScale: number = Jimp.intToRGBA(image.getPixelColor(x, y)).r;
            const character: string = asciiCharRamp[Math.ceil((crLenght - 1) * pixelGrayScale / 255)];
            line = `${line}${character}`;
        }

        result.push(line);
    }

    for (const resultLine of result) {
        console.log(`${resultLine}`);
    }
};

Jimp.read(imagesDir, async (err, image): Promise<void> => {
    if (err) throw err;

    const imgWidth: number = image.bitmap.width,
        imgHeight: number = image.bitmap.height;

    const imgGrayScale = toGrayScale(image, imgHeight, imgHeight);
    imgGrayScale.contrast(outCon.imgContrast);
    const resizedImg = resizeImg(imgGrayScale, imgWidth, imgHeight);
    toAscii(resizedImg, resizedImg.bitmap.width, resizedImg.bitmap.height);
});