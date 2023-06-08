import { Button, Canvas, Dropdown, DropdownMenu, DropdownOption, DropdownSeparator, Spinner, TextInput } from "datocms-react-ui";
import { FaChevronDown, FaChevronUp, FaEllipsisV, FaImage, FaSearch } from "react-icons/fa";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import useSWR, { type KeyedMutator } from 'swr';
import update from "immutability-helper";
import { useRef, useState } from "react";
import { HiX } from "react-icons/hi";
import Image from "next/image";

import type { GoogleImage } from "@type/google";
import type { CursorPaginate, ResponsiveImage } from "@type/page";
import { AuthFetch } from "@lib/utils/plugin/auth_fetch";


const ImageItem: React.FC<{
  item: GoogleImage,
  ctx: RenderModalCtx,
  active: boolean,
  mutate: KeyedMutator<CursorPaginate<GoogleImage>>,
  onSelected: () => void
}> = ({ item, ctx, mutate, onSelected, active }) => {

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
        sizes: item.appProperties?.sizes?.length ? item.appProperties.sizes : `(max-width: ${item.imageMediaMetadata.width}px) 100vw, ${item.imageMediaMetadata.width}px`,
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
    <button data-headlessui-state={active ? "active" : undefined} onClick={onSelected} className="relative ui-active:border-dato-accent bg-neutral-100 group flex flex-col items-center justify-center px-1 py-1.5 shadow border border-dato-lighter rounded-md hover:border-dato-darker">
      <div className="flex w-full p-1 gap-2 items-center content-center h-12">
        <FaImage className="m-2" />
        <div className="text-sm leading-snug overflow-hidden text-ellipsis w-36 whitespace-nowrap">{item.name}</div>
        <Dropdown renderTrigger={({ onClick }) => (
          <button className="flex items-center justify-center hover:text-dato-dark p-1 hover:bg-neutral-400 hover:bg-opacity-75 rounded-full" onClick={onClick}>
            <FaEllipsisV />
          </button>
        )}>
          <DropdownMenu>
            <DropdownOption onClick={resolveImage}>Select</DropdownOption>
            <DropdownSeparator />
            <DropdownOption red onClick={deleteImage}>Delete</DropdownOption>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="relative h-40 w-full">
        {loading ? (
          <div className="rounded-md flex flex-col items-center justify-center gap-2 absolute z-10 w-full h-full bg-opacity-80 bg-neutral-600">
            <Spinner size={36} />
            <span className="text-white">Loading</span>
          </div>
        ) : null}
        <Image className="py-2 rounded-md object-center object-contain" fill src={`https://drive.google.com/uc?id=${item.id}`} alt={item.name} />
      </div>
    </button>
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
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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

  const addImageGroup = async () => {
    try {
      setLoading(true);
      if (!data) throw new Error("Unable to process");

      const images = selected.map(async image => {
        const imageData = data.result.at(image);
        if (!imageData) throw new Error("Failed to find image");
        if (!imageData.appProperties.blurthumb.length) {
          await mutate(async current => {
            const response = await AuthFetch(`/api/plugin/images?id=${imageData.id}&type=blurthumb`);
            const data = await response.json() as { blurthumb: string; }
            imageData.appProperties.blurthumb = data.blurthumb;
            return update(current, {
              result: {
                [image]: {
                  appProperties(v) {
                    v.blurthumb = data.blurthumb;
                    return v;
                  },
                }
              }
            })
          })
        }

        return {
          blurUpThumb: imageData.appProperties.blurthumb,
          responsiveImage: {
            alt: imageData.appProperties.alt.length ? imageData.appProperties.alt : imageData.name,
            src: `https://drive.google.com/uc?id=${imageData.id}`,
            sizes: imageData.appProperties?.sizes?.length ? imageData.appProperties.sizes : `(max-width: ${imageData.imageMediaMetadata.width}px) 100vw, ${imageData.imageMediaMetadata.width}px`,
            width: imageData.imageMediaMetadata.width,
            height: imageData.imageMediaMetadata.height
          }
        } as ResponsiveImage
      });
      const content = await Promise.all(images);
      await ctx.resolve(content);
    } catch (error) {
      console.error(error);
      ctx.alert("There was an error in fetch images.").catch(e => console.error(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Canvas ctx={ctx}>
      <div className="flex flex-col flex-1 relative">
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
        <div className="h-full flex-1">
          <main className="flex items-start flex-wrap gap-2 p-4 overflow-y-scroll relative">
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
              <ImageItem onSelected={() => {
                setSelected(current => {
                  if (current.includes(i)) {
                    return current.filter(item => item !== i)
                  }
                  return update(current, { $push: [i] });
                })
              }} active={selected.includes(i)} key={i} item={item} mutate={mutate} ctx={ctx} />
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
        {
          selected.length ? (
            <div className="bg-dato-accent p-2 flex items-center justify-between">
              <div className="text-dato-light flex gap-dato-m">
                <span>Selected: {selected.length}</span>
                <button className="underline" onClick={() => setSelected([])}>Unselect all</button>
              </div>
              <Button rightIcon={loading ? (<Spinner size={24} />) : null} disabled={loading} onClick={addImageGroup}>Add {selected.length} Assets</Button>
            </div>
          ) : null
        }
      </div>
    </Canvas>
  );
};

export default GDriveModel;