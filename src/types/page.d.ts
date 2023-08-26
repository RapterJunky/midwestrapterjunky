import type { SeoOrFaviconTag } from "react-datocms";
import type { NextPage } from "next";

import type { NavProps } from "@components/layout/OldNavbar";

export type NextPageWithProvider<P = object, I = object> = NextPage<P, I> & {
  provider?: React.FC;
};

export type Color = {
  hex: string;
};

export type Icon = {
  prefix: string;
  iconName: string;
  icon: [number, number, unknown[], string, string, string?];
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

export type ModulerContent = { __typename: string;[key: string]: unknown };

export interface FullPageProps extends NavProps {
  site: {
    faviconMetaTags: SeoOrFaviconTag[];
  };
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
