import {
  Button,
  Canvas,
  Dropdown,
  DropdownMenu,
  DropdownOption,
  DropdownSeparator,
  Spinner,
  TextInput,
  ButtonLink,
} from "datocms-react-ui";
import {
  FaChevronDown,
  FaChevronUp,
  FaEllipsisV,
  FaImage,
  FaSearch,
} from "react-icons/fa";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import useSWR, { type KeyedMutator } from "swr";
import update from "immutability-helper";
import { useRef, useState } from "react";
import { HiX } from "react-icons/hi";
import Image from "next/image";

import type { GoogleImage } from "@type/google";
import type { CursorPaginate, ResponsiveImage } from "@type/page";
import { AuthFetch } from "@lib/utils/plugin/auth_fetch";

const ImageItem: React.FC<{
  item: GoogleImage;
  ctx: RenderModalCtx;
  active: boolean;
  mutate: KeyedMutator<CursorPaginate<GoogleImage>>;
  onSelected: () => void;
}> = ({ item, ctx, mutate, onSelected, active }) => {
  const [loading, setLoading] = useState(false);

  const resolveImage = async () => {
    // generate thumbblur if it does not exist
    // currently for images uploaded by users as the blurthumb generated then
    // is not added to the appProperties when being uploaded.
    if (!item.appProperties.blurthumb.length) {
      try {
        setLoading(true);
        const response = await AuthFetch(
          `/api/plugin/images?id=${item.id}&type=blurthumb`
        );
        const data = (await response.json()) as {
          id: string;
          blurthumb: string;
        }[];

        const content = data.at(0);

        if (!content?.blurthumb || !content.id)
          throw new Error("Failed to get image blur");

        item.appProperties.blurthumb = content.blurthumb;
        await mutate((current) => {
          if (!current) throw new Error("Unable to process.");
          const idx = current?.result.findIndex(
            (value) => value.id === item.id
          );
          if (idx === -1) throw new Error("Unable to find image.");

          return update(current, {
            result: {
              [idx]: {
                appProperties(v) {
                  v.blurthumb = content.blurthumb;
                  return v;
                },
              },
            },
          });
        });
      } catch (error) {
        console.error(error);
        ctx
          .alert("Failed to generate image data.")
          .catch((e) => console.error(e));
        return;
      } finally {
        setLoading(false);
      }
    }

    await ctx.resolve({
      blurUpThumb: item.appProperties.blurthumb,
      responsiveImage: {
        alt: item.appProperties.alt.length ? item.appProperties.alt : item.name,
        src: `https://drive.google.com/uc?id=${item.id}`,
        sizes: item.appProperties?.sizes?.length
          ? item.appProperties.sizes
          : `(max-width: ${item.imageMediaMetadata.width}px) 100vw, ${item.imageMediaMetadata.width}px`,
        width: item.imageMediaMetadata.width,
        height: item.imageMediaMetadata.height,
      },
    } as ResponsiveImage);
  };

  const deleteImage = async () => {
    try {
      const confirm = await ctx.openConfirm({
        title: "Delete Image",
        content: "Are you sure you want to delete this image?",
        choices: [
          {
            label: "Yes",
            value: true,
            intent: "negative",
          },
        ],
        cancel: {
          label: "Cancel",
          value: false,
        },
      });

      if (!confirm) return;

      await mutate(async (current) => {
        if (!current) throw new Error("Not Data");
        await AuthFetch(`/api/plugin/images?id=${item.id}`, {
          method: "DELETE",
        });
        return {
          ...current,
          result: current.result.filter((image) => image.id !== item.id),
        };
      });
      ctx.notice("Image has been deleted.").catch((e) => console.error(e));
    } catch (error) {
      console.error(error);
      ctx.alert("Failed to delete image.").catch((e) => console.error(e));
    }
  };

  return (
    <div
      data-headlessui-state={active ? "active" : undefined}
      onClick={onSelected}
      className="border-dato-lighter group relative flex cursor-pointer flex-col items-center justify-center rounded-md border bg-neutral-100 px-1 py-1.5 shadow hover:border-dato-darker ui-active:border-dato-accent"
    >
      <div className="flex h-12 w-full content-center items-center gap-2 p-1">
        <FaImage className="m-2" />
        <div className="w-36 overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-snug">
          {item.name}
        </div>
        <Dropdown
          renderTrigger={({ onClick }) => (
            <button
              className="flex items-center justify-center rounded-full p-1 hover:bg-neutral-400 hover:bg-opacity-75 hover:text-dato-dark"
              onClick={onClick}
            >
              <FaEllipsisV />
            </button>
          )}
        >
          <DropdownMenu>
            <DropdownOption onClick={resolveImage}>Select</DropdownOption>
            <DropdownSeparator />
            <DropdownOption red onClick={deleteImage}>
              Delete
            </DropdownOption>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="relative h-40 w-full">
        {loading ? (
          <div className="absolute z-10 flex h-full w-full flex-col items-center justify-center gap-2 rounded-md bg-neutral-600 bg-opacity-80">
            <Spinner size={36} />
            <span className="text-white">Loading</span>
          </div>
        ) : null}
        <Image
          loader={({ src }) => src}
          loading="lazy"
          className="rounded-md object-contain object-center py-2"
          fill
          sizes={
            item.appProperties?.sizes ??
            `(max-width: ${item.imageMediaMetadata.width}px) 100vw, ${item.imageMediaMetadata.width}px`
          }
          src={`https://drive.google.com/uc?id=${item.id}`}
          alt={item.name}
        />
      </div>
    </div>
  );
};

const UploadButton: React.FC<{
  ctx: RenderModalCtx;
  mutate: KeyedMutator<CursorPaginate<GoogleImage>>;
}> = ({ ctx, mutate }) => {
  const imageRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <input
        onChange={async (e) => {
          const image = e.target.files?.item(0);
          if (!image) return;
          try {
            setLoading(true);

            if (image.size > 5 * 1024 * 1024) {
              throw new Error("Image size is too large.", {
                cause: "MAX_IMAGE_SIZE",
              });
            }
            const formData = new FormData();

            formData.set("image", image, image.name);

            await mutate(async (current) => {
              if (!current) throw new Error("Unable to process request.");
              const response = await AuthFetch("/api/plugin/upload", {
                method: "POST",
                body: formData,
              });
              const data = (await response.json()) as GoogleImage;

              return {
                ...current,
                result: [...current.result, data],
              };
            });
            ctx
              .notice("Image has been uploaded.")
              .catch((e) => console.error(e));
          } catch (error) {
            console.error(error);

            if (error instanceof Error && error.cause === "MAX_IMAGE_SIZE") {
              ctx
                .alert(
                  "Can't upload image, do to size of image. Max file size is 5MB"
                )
                .catch((e) => console.error(e));
            } else {
              ctx
                .alert("Failed to upload image.")
                .catch((e) => console.error(e));
            }
          } finally {
            setLoading(false);
          }
        }}
        ref={imageRef}
        className="hidden"
        type="file"
        accept="image/*"
      />
      <Button
        rightIcon={loading ? <Spinner size={20} /> : null}
        disabled={loading}
        type="button"
        onClick={() => imageRef.current?.click()}
        buttonSize="s"
        buttonType="primary"
      >
        Upload
      </Button>
    </>
  );
};

const GDriveModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [query, setQuery] = useState<string>();
  const [cursorList, setCursorList] = useState<Array<string | undefined>>([]);
  const [searchQuery, setSearchQuery] = useState<string | undefined>();
  const [sort, setSort] = useState<string>("");
  const [cursor, setCursor] = useState<string>();
  const { isLoading, data, error, mutate } = useSWR<
    CursorPaginate<GoogleImage>,
    Response | Error,
    [string, string | undefined, string | undefined, string]
  >(["/api/plugin/images", query, cursor, sort], async (args) => {
    const url = args.at(0);
    const search = args.at(1);
    const pageCursor = args.at(2);
    const sortType = args.at(3);
    if (!url) throw new Error("Failed to get url");

    const params = new URLSearchParams();
    params.set("type", "list");
    if (search && search.length > 3) params.set("q", search);
    if (pageCursor) params.set("cursor", pageCursor);
    if (sortType) params.set("sort", sortType);
    return AuthFetch(`${url}?${params.toString()}`).then((value) =>
      value.json()
    ) as Promise<CursorPaginate<GoogleImage>>;
  });

  const addImageGroup = async () => {
    try {
      setLoading(true);
      if (!data) throw new Error("Unable to process");

      if (
        (ctx.parameters.current as number) + selected.length >
        (ctx.parameters.maxAssets as number)
      ) {
        throw new Error("Too many assets have been selected", {
          cause: "MAX_ASSETS",
        });
      }

      const params = new URLSearchParams();
      params.set("type", "blurthumb");
      for (const image of selected) {
        const imageData = data.result.at(image);
        if (!imageData) throw new Error("Failed to find image");
        if (imageData.appProperties.blurthumb.length) continue;
        params.append("id", imageData.id);
      }

      const imagesData: ResponsiveImage<{ width: number; height: number }>[] =
        [];
      await mutate(async (current) => {
        if (!current) throw new Error("Unabel to process");
        const response = await AuthFetch(
          `/api/plugin/images?${params.toString()}`
        );
        const data = (await response.json()) as {
          id: string;
          blurthumb: string;
        }[];

        const results = [...current.result];
        for (const image of data) {
          const index = results.findIndex((item) => item.id === image.id);
          if (index === -1) continue;
          const item = results.at(index);
          if (!item) continue;
          item.appProperties.blurthumb = image.blurthumb;
          imagesData.push({
            blurUpThumb: item.appProperties.blurthumb,
            responsiveImage: {
              alt: item.appProperties.alt.length
                ? item.appProperties.alt
                : item.name,
              src: `https://drive.google.com/uc?id=${item.id}`,
              sizes: item.appProperties?.sizes?.length
                ? item.appProperties.sizes
                : `(max-width: ${item.imageMediaMetadata.width}px) 100vw, ${item.imageMediaMetadata.width}px`,
              width: item.imageMediaMetadata.width,
              height: item.imageMediaMetadata.height,
            },
          });
        }

        return update(current, { result: { $set: results } });
      });

      await ctx.resolve(imagesData);
    } catch (error) {
      console.error(error);

      if (error instanceof Error && error.cause === "MAX_ASSETS") {
        ctx.alert(error.message).catch((e) => console.error(e));
        return;
      }

      ctx
        .alert("There was an error in when loading images.")
        .catch((e) => console.error(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Canvas ctx={ctx}>
      <div className="relative flex flex-1 flex-col">
        <nav className="shadow">
          <div className="mb-2 flex items-center justify-between border-b-2 border-dato-light">
            <h1 className="ml-4 p-2 text-2xl font-bold">
              Choose from Google Drive
            </h1>
            <div className="flex items-center gap-4">
              <ButtonLink
                target="_blank"
                href="https://drive.google.com/drive/u/2/folders/15ppwy_3jcgWo-TDQS88k1vmSV6lHb-MO"
              >
                Open Drive
              </ButtonLink>
              <UploadButton ctx={ctx} mutate={mutate} />
              <button
                onClick={() => ctx.resolve(null)}
                className="flex h-14 w-14 items-center justify-center rounded-tr-lg border-l-2 border-dato-light text-2xl hover:bg-neutral-100"
              >
                <HiX />
              </button>
            </div>
          </div>
          <form
            className="mb-2 flex items-center justify-center gap-2 px-4"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(searchQuery);
            }}
          >
            <div className="flex w-full">
              <TextInput
                size={1}
                id="search"
                placeholder="Search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e)}
              />
              <Button type="submit">
                <FaSearch />
              </Button>
            </div>
            <Dropdown
              renderTrigger={({ open, onClick }) => (
                <Button
                  buttonSize="s"
                  rightIcon={open ? <FaChevronUp /> : <FaChevronDown />}
                  onClick={onClick}
                >
                  Sort By:{" "}
                  {!sort.length
                    ? "All"
                    : sort === "cms_upload"
                    ? "CMS Upload"
                    : "User Upload"}
                </Button>
              )}
            >
              <DropdownMenu alignment="right">
                <DropdownOption onClick={() => setSort("")}>
                  <div className="font-semibold">All</div>
                  <div className="text-sm font-light tracking-tighter">
                    Show all images.
                  </div>
                </DropdownOption>
                <DropdownOption onClick={() => setSort("cms_upload")}>
                  <div className="font-semibold">CMS Uploaded</div>
                  <div className="text-sm font-light tracking-tighter">
                    Images that have been upload though this interface.
                  </div>
                </DropdownOption>
                <DropdownOption onClick={() => setSort("user_upload")}>
                  <div className="font-semibold">User Uploaded</div>
                  <div className="text-sm font-light tracking-tighter">
                    Images that have been uploaded by users. Ex. from comments
                    and topics.
                  </div>
                </DropdownOption>
              </DropdownMenu>
            </Dropdown>
          </form>
        </nav>
        <div className="h-full flex-1">
          <main className="relative flex max-h-[30lvi] flex-1 flex-wrap items-start gap-2 overflow-y-scroll p-4">
            {error ? (
              <div className="my-4 flex w-full items-center justify-center">
                There was an error when loading the images.
              </div>
            ) : null}
            {isLoading ? (
              <div className="my-4 flex w-full items-center justify-center">
                <Spinner size={54} />
              </div>
            ) : data?.result.length ? (
              data?.result.map((item, i) => (
                <ImageItem
                  onSelected={() => {
                    setSelected((current) => {
                      if (current.includes(i)) {
                        return current.filter((item) => item !== i);
                      }
                      return update(current, { $push: [i] });
                    });
                  }}
                  active={selected.includes(i)}
                  key={i}
                  item={item}
                  mutate={mutate}
                  ctx={ctx}
                />
              ))
            ) : (
              <div className="w-full p-2 text-center text-xl font-bold">
                No assets where found.
              </div>
            )}
          </main>
          <div className="flex justify-between p-4">
            <Button
              buttonType="primary"
              disabled={!cursorList.length}
              onClick={() => {
                setCursorList((cursors) => {
                  const data = [...cursors];
                  const item = data.pop();
                  setCursor(item);
                  return data;
                });
              }}
            >
              Back
            </Button>
            <Button
              buttonType="primary"
              disabled={!data?.hasNextPage}
              onClick={() => {
                setCursor((current) => {
                  setCursorList((items) => [...items, current]);
                  return data?.nextCursor ?? undefined;
                });
              }}
            >
              Next
            </Button>
          </div>
        </div>
        {selected.length ? (
          <div className="flex items-center justify-between bg-dato-accent p-2">
            <div className="flex gap-dato-m text-dato-light">
              {ctx.parameters.limitAssets ?? false ? (
                <span>
                  Selected: {selected.length} of{" "}
                  {(ctx.parameters.maxAssets as number) -
                    (ctx.parameters.current as number)}
                </span>
              ) : (
                <span>Selected: {selected.length}</span>
              )}
              <button className="underline" onClick={() => setSelected([])}>
                Unselect all
              </button>
            </div>
            <Button
              rightIcon={loading ? <Spinner size={24} /> : null}
              disabled={loading}
              onClick={addImageGroup}
            >
              Add {selected.length} Assets
            </Button>
          </div>
        ) : null}
      </div>
    </Canvas>
  );
};

/*
 <main className="relative flex flex-wrap items-start gap-2 overflow-y-scroll p-4 max-h-[500px]">
            {error ? (
              <div className="my-4 flex w-full items-center justify-center">
                There was an error when loading the images.
              </div>
            ) : null}
            {isLoading ? (
              <div className="my-4 flex w-full items-center justify-center">
                <Spinner size={54} />
              </div>
            ) : data?.result.length ? (
              data?.result.map((item, i) => (
                <ImageItem
                  onSelected={() => {
                    setSelected((current) => {
                      if (current.includes(i)) {
                        return current.filter((item) => item !== i);
                      }
                      return update(current, { $push: [i] });
                    });
                  }}
                  active={selected.includes(i)}
                  key={i}
                  item={item}
                  mutate={mutate}
                  ctx={ctx}
                />
              ))
            ) : (
              <div className="w-full p-2 text-center text-xl font-bold">
                No assets where found.
              </div>
            )}
          </main>
*/

export default GDriveModel;
