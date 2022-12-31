export type Color = {
    hex: string;
}

export type Icon = { prefix: string; iconName: string; icon: any[]; }

export type LinkWithIcon = { 
    title: string; 
    link: string;
    iconPosition: "end" | "start";
    icon: null | Icon;
    useIcon: null | boolean; 
}

type Image = {
    src: string;
    sizes: string;
    alt: string | null
};

export type ResponsiveImage<E = never> = {
    blurUpThumb: string;
    responsiveImage: [E] extends [never] ? Image: Image & E;
}

export type ModulerContent = { _modelApiKey: string; [key: string]: any; };

export type StructuredContent = any;