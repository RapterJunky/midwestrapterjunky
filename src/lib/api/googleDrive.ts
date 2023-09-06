import { google } from "googleapis";
import { logger } from "../logger";
import sharp from "sharp";
import { rgbaToDataURL } from "thumbhash";
import { GOOGLE_DRIVE_IMAGE_ROOT } from "../utils/googleConsts";
import { parse } from "path";

export type GoogleImage = {
  id: string;
  name: string;
  appProperties: {
    alt: string;
    blurthumb: string;
    sizes: string;
    label: string;
  };
  imageMediaMetadata: {
    width: number;
    height: number;
  };
};

const googleDrive = () => {
  const creds = JSON.parse(
    process.env.GOOGLE_SERVICE_KEY,
  ) as NodeJS.GoogleServiceKey;

  const auth = new google.auth.GoogleAuth({
    projectId: creds.project_id,
    credentials: {
      type: creds.type,
      private_key: creds.private_key,
      client_email: creds.client_email,
      client_id: creds.client_id,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
};

export const driveConfig = {
  uploadFolderId: "15ppwy_3jcgWo-TDQS88k1vmSV6lHb-MO",
  userEmail: "rapterjunky@gmail.com",
} as const;

export const imageConfig = {
  size: 16,
  blur: 2,
  /**
   * Max Size about 5MB
   */
  maxSize: 5 * 1024 * 1024,
} as const;


export const deleteImages = async (ids: string[]) => {
  const drive = googleDrive();

  const result = await Promise.allSettled(
    ids.map(id => drive.files.delete({
      fileId: id
    }))
  );

  for (const item of result) {
    if (item.status === "rejected") {
      logger.error(item, "Failed to delete image");
    }
  }

}

export const uploadFiles = async (files: File[]) => {
  const drive = googleDrive();

  const results = await Promise.allSettled(files.map(file => uploadFile(file, drive)));

  return results.map(value => {
    return value.status === "fulfilled" ? value.value : null
  }).filter(Boolean);
}


export const extractImgTags = (value: string) => {
  const imgTag = /<img(\w|\s|-|=|\")+\/>/g;
  const getId = /id="(?<id>\S+)"/;

  const ids = [];

  const matches = value.matchAll(imgTag);

  for (const tag of matches) {
    console.log(tag, tag[0].includes('data-image-type="google"'));

    if (!tag[0].includes('data-image-type="google"')) continue;

    const matchId = tag[0].match(getId);

    console.log(matchId, matchId?.groups);

    if (matchId?.groups?.id) ids.push(matchId?.groups?.id);
  }

  return ids;
}

export const generateImageBlur = (arraybuffer: ArrayBuffer) => new Promise<string>(async (ok, rej) => {
  try {
    const { info, data } = await sharp(arraybuffer)
      .resize(imageConfig.size, imageConfig.size)
      .blur(imageConfig.blur)
      .raw()
      .ensureAlpha().toBuffer({ resolveWithObject: true });
    const png = rgbaToDataURL(info.width, info.height, data);

    const buffer = Buffer.from(png.replace("data:image/png;base64,", ""), "base64");

    const compress = await sharp(buffer).toFormat("webp").toBuffer();

    ok(`data:image/webp;base64,${compress.toString("base64")}`);
  } catch (error) {
    rej(error);
  }
});

export const uploadFile = async (file: File, drive: ReturnType<typeof googleDrive>) => {

  const arraybuffer = await file.arrayBuffer();

  const [uploadResult, blurResult] = await Promise.allSettled([
    new Promise<string>(async (ok, rej) => {
      try {
        const compressedImage = await sharp(arraybuffer).withMetadata().toFormat("webp").webp().toBuffer();

        const { data } = await drive.files.create({
          requestBody: {
            name: `${file.name.replace("{", "").replace("}", "")}`,
            parents: [driveConfig.uploadFolderId],
            appProperties: {
              label: "user_upload"
            },
          },
          media: {
            mimeType: "image/webp",
            body: compressedImage
          },
          fields: "id"
        });

        await drive.permissions.create({
          fileId: data.id!,
          requestBody: {
            role: "reader",
            type: "anyone"
          }
        });

        ok(data.id!);
      } catch (error) {
        rej(error);
      }
    }),
    generateImageBlur(arraybuffer)
  ]);

  const image: { blur: string; src: string; id: string; replaceId: string; } = {
    blur: "",
    src: "https://api.dicebear.com/6.x/initials/png?seed=%3F",
    id: "",
    replaceId: file.name
  };

  if (uploadResult.status === "fulfilled" && uploadResult.value) {
    image.src = `${GOOGLE_DRIVE_IMAGE_ROOT}${uploadResult.value}`;
    image.id = uploadResult.value;
  } else {
    logger.error((uploadResult as PromiseRejectedResult)?.reason ?? "Invaild id", "Failed to upload image");
  }

  if (blurResult.status === "fulfilled") {
    image.blur = blurResult.value;
  } else {
    logger.error(blurResult.reason, "Failed to generate image blur");
  }

  return image;
}

export const uploadFileCMS = async (file: File, alt: string) => {
  const drive = googleDrive();

  if (file.size <= 0) throw new Error("File size is too small");

  const arraybuffer = await file.arrayBuffer();

  const [upload, blur] = await Promise.allSettled([
    new Promise<GoogleImage>(async (ok, rej) => {
      try {
        const compressedImage = await sharp(arraybuffer).withMetadata().toFormat("webp").webp().toBuffer();

        const { data } = await drive.files.create({
          requestBody: {
            name: `${Date.now()}_${parse(file.name).name}`,
            parents: [driveConfig.uploadFolderId],
            appProperties: {
              blurthumb: "",
              alt,
              sizes: "",
              label: "cms_upload",
            },
          },
          media: {
            mimeType: "image/webp",
            body: compressedImage
          },
          fields: "name,id,appProperties,imageMediaMetadata(width,height)",
        });

        await drive.permissions.create({
          fileId: data.id ?? undefined,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
        });

        ok(data as GoogleImage);
      } catch (error) {
        rej(error);
      }
    }),
    generateImageBlur(arraybuffer)
  ]);

  if (upload.status === "rejected") throw new Error("Image failed to upload");

  return {
    ...upload.value,
    appProperties: {
      ...upload.value.appProperties,
      blurthumb: blur.status === "fulfilled" ? blur.value : ""
    }
  } as GoogleImage;
}

export default googleDrive;
