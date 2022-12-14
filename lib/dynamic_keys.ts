import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { ArrayKey } from 'react-hook-form/dist/types/path/common';
import prisma from './prisma';

const ALGORITHM = 'aes-256-ctr';
const RANDOM_BYTES = 16;

const encrypt = (text: string) => {
    if(!process.env.APP_KEY) throw new Error("No App key found.");
    const iv = randomBytes(RANDOM_BYTES);
    const cipher = createCipheriv(ALGORITHM,process.env.APP_KEY,iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return `${iv.toString("hex")}${encrypted.toString("hex")}`;
}

const decrypt = (hash: string) => {
    if(!process.env.APP_KEY) throw new Error("No App key found.");
    const iv = hash.slice(0,RANDOM_BYTES*2);
    const content = hash.slice(RANDOM_BYTES*2);

    const decipher = createDecipheriv(ALGORITHM,process.env.APP_KEY,Buffer.from(iv,"hex"));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
    return decrpyted.toString();
}

type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
    [K in (T extends ReadonlyArray<infer U> ? U : never)]: V
  };

export const getKeys = async <T extends ReadonlyArray<string>>(keys: T): Promise<ObjectFromList<T>> => {

    const selector = keys.map(value=>({ key: value }));

    const settings = await prisma.settings.findMany({
        where: {
            OR: selector
        }
    });
    
    return settings.map(setting=>({ key: setting.key, value: decrypt(setting.value) })).reduce((pre,cur): ObjectFromList<T> =>({ ...pre, [cur.key]: cur.value }),{} as ObjectFromList<T>);
}

export const addKeys = async (values: { key: string; value: string; }[], method: "UPDATE" | "CREATE") => {

    const settings = values.map(setting=>({ key: setting.key, value: encrypt(setting.value) }));

    if(method === "CREATE") {
        return prisma.settings.createMany({
            data: settings,
        });
    }

    return prisma.settings.updateMany({
        data: settings
    });
}