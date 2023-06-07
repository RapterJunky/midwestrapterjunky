export type GoogleImage = {
    id: string;
    name: string;
    appProperties: {
        alt: string;
        blurthumb: string;
        sizes: string;
        label: string;
    }
    imageMediaMetadata: {
        width: number;
        height: number;
    }
}