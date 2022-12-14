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

export type ResponsiveImage<E> = {
    blurUpThumb: string;
    responsiveImage: {
      src: string;
      sizes: string;
      alt: string | null
    } & E
}

export type ModulerContent = { _modelApiKey: string; [key: string]: any; };

export type StructuredContent = any;