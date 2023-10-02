import {
  Button,
  Canvas,
  Spinner,
  SelectInput,
  TextInput,
  ButtonLink,
} from "datocms-react-ui";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import { FaFilter, FaSearch } from "react-icons/fa";
import { useCallback, useState } from "react";
import update from "immutability-helper";
import useSWR from "swr";

import type { CursorPaginate, ResponsiveImage } from "@/types/page";
import { getImageProps } from "@/lib/utils/plugin/imageProps";
import { AuthFetch } from "@/lib/utils/plugin/auth_fetch";
import type { GoogleImage } from "@/lib/api/googleDrive";
import UploadAsset from "./UploadAsset";
import ModalImage from "./ModalImage";

import "../../../../styles/override.css";

type RequestParams = [
  string,
  string | undefined,
  string | undefined,
  string | undefined,
];

const queryImages = async ([url, query, cursor, sort]: RequestParams): Promise<
  CursorPaginate<GoogleImage>
> => {
  const params = new URLSearchParams();
  params.set("type", "list");

  if (query && query.length > 3) params.set("q", query);
  if (cursor) params.set("cursor", cursor);
  if (sort) params.set("sort", sort);

  const response = await AuthFetch(`${url}?${params.toString()}`);

  return response.json() as Promise<CursorPaginate<GoogleImage>>;
};

const GoogleDriveModal: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [query, setQuery] = useState<string>();
  const [cursor, setCursor] = useState<string | undefined>();
  const [filter, setFilter] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { isLoading, data, error, mutate } = useSWR<
    CursorPaginate<GoogleImage>,
    Response | Error,
    RequestParams
  >(
    [
      "/api/plugin/images",
      query,
      cursor,
      filter.map((value) => value.value).join(","),
    ],
    queryImages,
  );

  const onImageSelected = useCallback((state: boolean, id: string) => {
    if (state) {
      setSelected(current => update(current, { $push: [id] }));
      return;
    }

    setSelected(current => {
      const idx = current.findIndex(value => value === id);
      if (idx === -1) return current;
      return update(current, { $splice: [[idx, 1]] });
    })
  }, []);

  const addImages = async () => {
    try {
      setLoading(true);
      if (!data) throw new Error("Failed to load assets.", { cause: "MISSING_DATA_SOURCE" });

      const current = ctx.parameters.current as number;
      const max = ctx.parameters.maxAssets as number;
      const min = ctx.parameters.minAssets as number;

      if (current + selected.length > max) throw new Error(`Too many assets have been selected. There can only be ${max} assets.`, {
        cause: "MAX_ASSETS"
      });
      if (current + selected.length < min) throw new Error(`There needs to be a minium ${min} assets`, { cause: "MIN_ASSETS" });


      const images: ResponsiveImage<{ width: number; height: number }>[] = [];
      const params = new URLSearchParams();
      params.set("type", "blurthumb");
      // image to generate blur data
      for (const id of selected) {
        const image = data.result.find(value => value.id === id);
        if (!image) continue;

        if ("blurthumb" in image.appProperties && image.appProperties.blurthumb.length) {
          images.push(getImageProps(image));
          continue;
        }
        params.append("id", id);
      }

      await mutate<CursorPaginate<GoogleImage>>(async (current) => {
        if (!current) throw new Error("Failed to generate image data");
        const response = await AuthFetch(`/api/plugin/images?${params.toString()}`);

        const blurs = await response.json() as { id: string; blurthumb: string; }[];

        const results = [...current.result];

        for (const blur of blurs) {
          const idx = results.findIndex(value => value.id === blur.id);
          if (idx === -1) continue;
          const item = results.at(idx);
          if (!item) continue;
          item.appProperties.blurthumb = blur.blurthumb;
          images.push(getImageProps(item));
        }

        return update(current, { result: { $set: results } });
      });

      await ctx.resolve(images);
    } catch (error) {
      console.error(error);
      ctx.alert(error instanceof Error && error.cause ? error.message : "There was an error when adding assets").catch(e => console.log(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Canvas ctx={ctx}>
      <div className="[& > div]:h-full flex h-full w-full flex-col">
        <section
          className="relative flex flex-shrink justify-between border-b"
          data-id="toolbar-1"
        >
          <div className="flex w-full items-center justify-between px-9 py-3">
            <h1
              style={{
                fontSize: "var(--font-size-xl)",
                fontFamily:
                  "colfax-web,Roboto,Helvetica Neue,Helvetica,Roboto,Arial,sans-serif",
              }}
              className="mr-4 font-bold leading-4"
            >
              Chosse from Google Drive
            </h1>
            <div className="flex items-center gap-4">
              <div>{data?.result.length ?? 0} assets</div>
              <UploadAsset
                btnSize="s"
                callback={(data) =>
                  mutate((current) => {
                    if (!current) return;
                    return {
                      ...current,
                      result: [...current.result, data],
                    };
                  })
                }
                ctx={ctx}
              >
                Upload new asset
              </UploadAsset>
              <ButtonLink href="https://drive.google.com/drive/u/2/folders/15ppwy_3jcgWo-TDQS88k1vmSV6lHb-MO">
                Open Drive
              </ButtonLink>
            </div>
          </div>
          <button
            className="flex w-16 min-w-[49px] items-center justify-center rounded-tr-md border-l hover:bg-[var(--light-bg-color)]"
            onClick={() => ctx.resolve(null)}
          >
            <svg
              className="text-xl"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              width="1em"
              height="1em"
            >
              <path d="M345 137c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-119 119L73 103c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l119 119L39 375c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l119-119L311 409c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-119-119L345 137z"></path>
            </svg>
          </button>
        </section>
        <section
          className="relative flex flex-shrink border-b px-8 py-2"
          data-id="toolbar-2"
        >
          <div className="mr-4 flex items-center justify-center">Search</div>
          <form
            className="flex w-1/4 items-center"
            onSubmit={(ev) => {
              ev.preventDefault();
              const data = new FormData(ev.target as HTMLFormElement);
              const value = data.get("search")?.toString() ?? null;
              setQuery(value && value.length > 5 ? value : "");
            }}
          >
            <div className="flex h-full items-center border border-r-0 border-r-transparent px-2">
              <FaSearch className="text-md text-[var(--light-body-color)]" />
            </div>
            <TextInput
              className="!w-full !border-l-0 focus:!border-[var(--border-color)] focus:!shadow-none"
              placeholder="Type something..."
              id="search"
              name="search"
            />
          </form>
          <div className="flex w-3/4">
            <div className="flex h-full items-center border border-l-0 border-r-0 border-r-transparent px-2">
              <FaFilter className="text-md text-[var(--light-body-color)]" />
            </div>
            <SelectInput
              value={filter}
              onChange={(ev) => {
                setFilter(ev as Array<{ label: string; value: string }>);
              }}
              placeholder="No filters set"
              className="h-full w-full [&>div]:h-full [&>div]:!border-l-0 [&>div]:hover:!border-[var(--border-color)] [&>div]:hover:shadow-none"
              isMulti
              options={[
                { label: "User uploaded", value: "user_upload" },
                { label: "CMS Uploaded", value: "cms_upload" },
              ]}
            />
          </div>
        </section>
        <div
          className="relative flex flex-1 flex-col overflow-y-scroll bg-[var(--light-bg-color)] px-2 py-2"
          style={{
            maxHeight: `${((ctx.parameters.height as number) ?? 200) - 200}px`,
          }}
        >
          <main className="relative grid flex-1 flex-grow grid-cols-6 gap-6">
            {isLoading ? (
              <div className="col-span-6 flex items-center justify-center">
                <Spinner size={45} />
              </div>
            ) : error ? (
              <div className="col-span-6 flex items-center justify-center">
                Failed to load assets
              </div>
            ) : data && data.result.length <= 0 ? (
              <div className="col-span-6 flex items-center justify-center">
                Nothing to show.
              </div>
            ) : data && data.result.length > 0 ? (
              <>
                {data.result.map((value) => (
                  <ModalImage key={value.id} image={value} onSelected={onImageSelected} />
                ))}
              </>
            ) : null}
          </main>
          <div className="flex justify-center gap-4 p-4">
            <Button
              onClick={() => {
                setCursorStack((cursors) => {
                  const data = [...cursors];
                  const item = data.pop();
                  setCursor(item);
                  return data;
                });
              }}
              disabled={!cursorStack.length}
              buttonType="primary"
            >
              Prev
            </Button>
            <Button
              onClick={() => {
                setCursor((current) => {
                  if (current) setCursorStack((items) => [...items, current]);
                  return data?.nextCursor ?? undefined;
                });
              }}
              disabled={!data?.hasNextPage}
              buttonType="primary"
            >
              Next
            </Button>
          </div>
        </div>
        <section
          className="relative flex flex-shrink border-t bg-[var(--accent-color)] px-4 py-3"
          data-id="footer"
        >
          <div className="w-full flex items-center text-[var(--placeholder-body-color)]">
            {selected.length > 0 ? (
              <div className="flex">
                <span className="mr-1">{selected.length === 1 ? "One" : selected.length} selected:</span>
                <button onClick={() => setSelected([])} className="underline">Deselect</button>
              </div>
            ) : null}
          </div>
          {(selected.length) > 0 ? <Button disabled={loading} onClick={addImages} type="button" leftIcon={loading ? (<Spinner />) : null} buttonSize="s">Add {selected.length} assets</Button> : (<div className="h-10"></div>)}
        </section>
      </div>
    </Canvas>
  );
};

export default GoogleDriveModal;
