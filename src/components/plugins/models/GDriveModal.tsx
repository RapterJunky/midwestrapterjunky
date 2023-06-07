import { Button, Canvas, Dropdown, DropdownMenu, DropdownOption, Spinner, TextInput } from "datocms-react-ui";
import { FaChevronDown, FaChevronUp, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import useSWR, { type KeyedMutator } from 'swr';
import update from "immutability-helper";
import { useLayoutEffect, useRef, useState } from "react";
import { HiX } from "react-icons/hi";
import Image from "next/image";

import type { GoogleImage } from "@type/google";
import type { CursorPaginate, ResponsiveImage } from "@type/page";
import { AuthFetch } from "@lib/utils/plugin/auth_fetch";


const ImageItem: React.FC<{
  item: GoogleImage,
  ctx: RenderModalCtx,
  mutate: KeyedMutator<CursorPaginate<GoogleImage>>,
}> = ({ item, ctx, mutate }) => {
  const [loading, setLoading] = useState(false);

  const resolveImage = async () => {
    // generate thumbblur if it does not exist
    // currently for images uploaded by users as the blurthumb generated then
    // is not added to the appProperties when being uploaded.
    if (!item.appProperties.blurthumb.length) {
      try {
        setLoading(true);
        const response = await AuthFetch(`/api/plugin/images?id=${item.id}&type=blurthumb`);
        const data = await response.json() as { blurthumb: string; }
        item.appProperties.blurthumb = data.blurthumb;
        await mutate(current => {
          if (!current) throw new Error("Unable to process.");
          const idx = current?.result.findIndex(value => value.id === item.id);
          if (idx === -1) throw new Error("Unable to find image.");

          return update(current, {
            result: {
              [idx]: {
                appProperties(v) {
                  v.blurthumb = data.blurthumb;
                  return v;
                },
              }
            }
          })
        })
      } catch (error) {
        console.error(error);
        ctx.alert("Failed to generate image data.").catch(e => console.error(e));
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
        sizes: item.appProperties?.sizes?.length ? item.appProperties.sizes : "((min-width: 10em) and (max-width: 20em)) 10em, ((min-width: 30em) and (max-width: 40em)) 30em, (min-width: 40em) 40em",
        width: item.imageMediaMetadata.width,
        height: item.imageMediaMetadata.height
      }
    } as ResponsiveImage);
  }

  const deleteImage = async () => {
    try {
      const confirm = await ctx.openConfirm({
        title: "Delete Image",
        content: "Are you sure you want to delete this image?",
        choices: [
          {
            label: 'Yes',
            value: true,
            intent: 'negative',
          },
        ],
        cancel: {
          label: 'Cancel',
          value: false,
        },
      });

      if (!confirm) return;

      await mutate(async (current) => {
        if (!current) throw new Error("Not Data");
        await AuthFetch(`/api/plugin/images?id=${item.id}`, { method: "DELETE" })
        return {
          ...current,
          result: current.result.filter((image) => image.id !== item.id)
        }
      });
      ctx.notice("Image has been deleted.").catch(e => console.error(e));
    } catch (error) {
      console.error(error);
      ctx.alert("Failed to delete image.").catch(e => console.error(e));
    }
  }

  return (
    <div className="bg-white relative group flex flex-col items-center justify-center px-1 py-1.5 shadow border border-dato-lighter rounded-md">
      {loading ? (
        <div className="rounded-md flex flex-col items-center justify-center gap-2 absolute z-10 w-full h-full bg-opacity-80 bg-neutral-600">
          <Spinner size={36} />
          <span className="text-white">Loading</span>
        </div>
      ) : null}
      <div className="rounded-md hidden group-hover:flex items-center justify-center gap-2 absolute w-full h-full bg-opacity-80 bg-neutral-600">
        <Button buttonType="primary" buttonSize="m" onClick={resolveImage}>
          <FaPlus />
        </Button>
        <Button buttonType="negative" buttonSize="m" onClick={deleteImage}>
          <FaTrash />
        </Button>
      </div>
      <Image className="rounded-sm py-2" height={150} width={150} src={`https://drive.google.com/uc?id=${item.id}`} alt={item.name} />
      <div className="border-t border-dato-lighter p-2">
        <span className="text-sm leading-snug overflow-hidden text-ellipsis">{item.name}</span>
      </div>
    </div>
  );
}

const UploadButton: React.FC<{ ctx: RenderModalCtx, mutate: KeyedMutator<CursorPaginate<GoogleImage>> }> = ({ ctx, mutate }) => {
  const imageRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <input onChange={async (e) => {
        const image = e.target.files?.item(0);
        if (!image) return;
        try {
          setLoading(true);

          if (image.size > (5 * 1024 * 1024)) {
            throw new Error("Image size is too large.", { cause: "MAX_IMAGE_SIZE" });
          }

          const formData = new FormData();

          formData.set("image", image, image.name);

          await mutate(async current => {
            if (!current) throw new Error("Unable to process request.");
            const response = await AuthFetch("/api/plugin/upload", { method: "POST", body: formData });
            const data = await response.json() as GoogleImage;

            return {
              ...current,
              result: [...current.result, data]
            }

          });
          ctx.notice("Image has been uploaded.").catch(e => console.error(e));
        } catch (error) {
          console.error(error);

          if (error instanceof Error && error.cause === "MAX_IMAGE_SIZE") {
            ctx.alert("Can't upload image, do to size of image. Max file size is 5MB").catch(e => console.error(e));
          } else {
            ctx.alert("Failed to upload image.").catch(e => console.error(e));
          }
        } finally {
          setLoading(false);
        }

      }} ref={imageRef} className="hidden" type="file" accept="image/*" />
      <Button rightIcon={loading ? <Spinner size={20} /> : null} disabled={loading} type="button" onClick={() => imageRef.current?.click()} buttonSize="s" buttonType="primary">Upload</Button>
    </>
  );
}

const GDriveModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  const [query, setQuery] = useState<string>();
  const [cursorList, setCursorList] = useState<Array<string | undefined>>([]);
  const [searchQuery, setSearchQuery] = useState<string | undefined>()
  const [sort, setSort] = useState<string>("");
  const [cursor, setCursor] = useState<string>();
  const { isLoading, data, error, mutate } = useSWR<CursorPaginate<GoogleImage>, Response | Error, [string, string | undefined, string | undefined, string]>(["/api/plugin/images", query, cursor, sort], async (args) => {
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
    return AuthFetch(`${url}?${params.toString()}`).then(value => value.json()) as Promise<CursorPaginate<GoogleImage>>
  });

  return (
    <Canvas ctx={ctx}>
      <div className="flex flex-col flex-1">
        <nav className="shadow">
          <div className="flex justify-between border-b-2 border-dato-light items-center mb-2">
            <h1 className="text-2xl font-bold ml-4 p-2">Choose from Google Drive</h1>
            <div className="flex items-center gap-4">
              <UploadButton ctx={ctx} mutate={mutate} />
              <button onClick={() => ctx.resolve(null)} className="h-14 w-14 hover:bg-neutral-100 rounded-tr-lg text-2xl flex justify-center items-center border-dato-light border-l-2">
                <HiX />
              </button>
            </div>
          </div>
          <form className="flex items-center justify-center gap-2 px-4 mb-2" onSubmit={(e) => { e.preventDefault(); setQuery(searchQuery) }}>
            <div className="w-full flex">
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
            <Dropdown renderTrigger={({ open, onClick }) => (
              <Button buttonSize="s" rightIcon={open ? (<FaChevronUp />) : (<FaChevronDown />)} onClick={onClick}>Sort By: {!sort.length ? "All" : sort === "cms_upload" ? "CMS Upload" : "User Upload"}</Button>
            )}>
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
                    Images that have been uploaded by users. Ex. from comments and topics.
                  </div>
                </DropdownOption>
              </DropdownMenu>
            </Dropdown>
          </form>
        </nav>
        <div className="h-full bg-dato-light flex-1">
          <main className="flex items-start flex-wrap gap-2 p-4 overflow-y-scroll">
            {error ? (
              <div className="flex w-full items-center justify-center my-4">
                There was an error when loading the images.
              </div>
            ) : null}
            {isLoading ? (
              <div className="flex w-full items-center justify-center my-4">
                <Spinner size={54} />
              </div>
            ) : null}
            {data?.result.map((item, i) => (
              <ImageItem key={i} item={item} mutate={mutate} ctx={ctx} />
            ))}
          </main>
          <div className="flex justify-between p-4">
            <Button buttonType="primary" disabled={!cursorList.length} onClick={() => {
              setCursorList((cursors) => {
                const data = [...cursors];
                const item = data.pop();
                setCursor(item);
                return data;
              });
            }}>Back</Button>
            <Button buttonType="primary" disabled={!data?.hasNextPage} onClick={() => {
              setCursor((current) => {
                setCursorList((items) => [...items, current]);
                return data?.nextCursor ?? undefined;
              });
            }}>Next</Button>
          </div>
        </div>
      </div>
    </Canvas>
  );
};

export default GDriveModel;

/*

<div className="shadow">
          <div className="flex justify-between">
            <h1 className="font-bold">Choose from Google Drive</h1>

            <div>
              <UploadButton ctx={ctx} mutate={mutate} />
              <button>
                <FaXingSquare />
              </button>
            </div>
          </div>
          <form className="flex mb-4 w-full items-center justify-center gap-2" onSubmit={(e) => { e.preventDefault(); setQuery(searchQuery) }}>
            <div className="w-full flex">
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
            <Dropdown renderTrigger={({ open, onClick }) => (
              <Button buttonSize="s" rightIcon={open ? (<FaChevronUp />) : (<FaChevronDown />)} onClick={onClick}>Sort By: {!sort.length ? "All" : sort === "cms_upload" ? "CMS Upload" : "User Upload"}</Button>
            )}>
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
                    Images that have been uploaded by users. Ex. from comments and topics.
                  </div>
                </DropdownOption>
              </DropdownMenu>
            </Dropdown>
          </form>
        </div>
        <div className="bg-neutral-300">
          <div className="flex flex-wrap gap-2 overflow-y-scroll">
            {error ? (
              <div className="flex w-full items-center justify-center my-4">
                There was an error when loading the images.
              </div>
            ) : null}
            {isLoading ? (
              <div className="flex w-full items-center justify-center my-4">
                <Spinner size={54} />
              </div>
            ) : null}
            {data?.result.map((item, i) => (
              <ImageItem key={i} item={item} mutate={mutate} ctx={ctx} />
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <Button buttonType="primary" disabled={!cursorList.length} onClick={() => {
              setCursorList((cursors) => {
                const data = [...cursors];
                const item = data.pop();
                setCursor(item);
                return data;
              });
            }}>Back</Button>
            <Button buttonType="primary" disabled={!data?.hasNextPage} onClick={() => {
              setCursor((current) => {
                setCursorList((items) => [...items, current]);
                return data?.nextCursor ?? undefined;
              });
            }}>Next</Button>
          </div>
        </div>

*/
