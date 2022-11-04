interface ImageGalleryProps {
    heading: string;
    images: {
        url: string;
        alt: string;
    }[];
}

export default function ImageGallery(props: ImageGalleryProps){
    return (
        <div className="h-96">
            <h1>{props.heading}</h1>
            <div className="flex flex-wrap">
                <div className="relative w-1/4 flex-grow">

                </div>
            </div>
        </div>
    );
}