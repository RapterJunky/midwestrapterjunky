import type { SeoOrFaviconTag } from "react-datocms";
import type { NavProps } from "@components/Navbar";

export type Color = {
  hex: string;
};

export type Icon = {
  prefix: string;
  iconName: string;
  icon: [number, number, any[], string, string];
};

export type LinkWithIcon = {
  title: string;
  link: string;
  iconPosition: "end" | "start";
  icon: null | Icon;
  useIcon: null | boolean;
};

type Image = {
  src: string;
  sizes: string;
  alt: string | null;
};

export type ResponsiveImage<E = never> = {
  blurUpThumb: string;
  responsiveImage: [E] extends [never] ? Image : Image & E;
};

export type ModulerContent = { _modelApiKey: string;[key: string]: any };

export type StructuredContent = any;

export interface FullPageProps extends NavProps {
  _site: {
    faviconMetaTags: SeoOrFaviconTag[];
  };
  preview: boolean;
}

export interface Paginate<T> {
  limit: number;
  exceedCount: boolean;
  exceedTotalPages: boolean;
  count: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  page: boolean;
  result: T[];
}

