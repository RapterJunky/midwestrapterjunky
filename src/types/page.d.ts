import type { SeoOrFaviconTag } from "react-datocms";
import type { NavProps } from "@components/layout/Navbar";

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

export interface FullPageProps extends NavProps {
  _site: {
    faviconMetaTags: SeoOrFaviconTag[];
  };
  preview: boolean;
}

export interface Paginate<T> {
  currentPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number | null;
  result: T[];
}

export interface CursorPaginate<T> {
  hasNextPage: boolean;
  nextCursor: string | null;
  result: T[];
}

