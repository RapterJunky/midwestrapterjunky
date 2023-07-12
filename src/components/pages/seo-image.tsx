import { ImageResponse } from "next/server";

export const config = {
    alt: "Page Thumbnail",
    size: {
        width: 1200,
        height: 630,
    }
}

export const SEOImage = () => {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div tw="h-full w-full justify-center items-center flex" style={{
                backgroundImage:
                    "linear-gradient(to right, #24243e, #302b63, #0f0c29)",
            }}>
                <div tw="flex justify-center w-full">
                    <img width={500} height={500} alt="" src={`${process.env.VERCEL_ENV === "development" ? "http" : "https"}://${process.env.VERCEL_URL}/facebook.png`} />
                </div>
            </div>
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported opengraph-image
            // size config to also set the ImageResponse's width and height.
            ...config.size,
        },
    );
}
