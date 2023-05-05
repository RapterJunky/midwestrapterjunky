import { rgbaToDataURL } from 'thumbhash';
import sharp from 'sharp';

const blurtest = async () => {

    const data = await sharp("C:\\projects\\clients\\rapterjunky\\images\\248634691_335566845005271_1533030822954225279_n.jpg").resize(16, 16).blur(2).raw().ensureAlpha().toBuffer({ resolveWithObject: true });

    const hash = rgbaToDataURL(data.info.width, data.info.height, data.data);

    console.log(hash);

    const buf = Buffer.from(hash.replace("data:image/png;base64,", ""), "base64");
    const compress = await sharp(buf).toFormat("webp").toBuffer();

    console.log(`data:image/webp;base64,${compress.toString("base64")}`);
}


blurtest().catch(e => console.error(e));
