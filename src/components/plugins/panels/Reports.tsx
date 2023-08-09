import {
  Dropdown,
  DropdownMenu,
  DropdownGroup,
  TextInput,
  DropdownOption,
  Button,
  DropdownSeparator,
} from "datocms-react-ui";
import { FaSearch, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { StructuredText } from "react-datocms/structured-text";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import { useDebounce } from "use-debounce";
import { useCtx } from "datocms-react-ui";
import update from "immutability-helper";
import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";

import type { User, Report, ThreadPost, Comment } from "@prisma/client";
import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import { renderBlock } from "@/lib/structuredTextRules";
import type { Paginate } from "@type/page";
import { Panel } from "./Panel";
import DatoCmsPagination from "./Pagination";
import DisplayDataStates from "./DisplayDataStates";

type ContentType = Paginate<
  Omit<Report, "created"> & {
    created: string;
    owner: User | null;
    comment: (Comment & { owner: User }) | null;
    post: (ThreadPost & { owner: User }) | null;
  }
>;

type FullReport = {
  id: number;
  handleBan: (userId?: string, name?: string | null) => Promise<void>;
  handleDelete: (id: number) => void;
  reason: string;
  created: string;
  owner: User | null;
  reporter: User | null;
};

const patchItem = async (
  ctx: RenderPageCtx,
  type: "comment" | "topic",
  prop: string,
  value: boolean | string | number,
  id?: string,
) => {
  try {
    await AuthFetch(`/api/plugin/tac`, {
      method: "PATCH",
      json: {
        id,
        type,
        prop,
        value,
      },
    });
    ctx.notice(`Successfully updated ${type}`).catch((e) => console.error(e));
  } catch (error) {
    ctx.alert(`Failed to update ${type}`).catch((e) => console.error(e));
  }
};

const deleteItem = async (
  ctx: RenderPageCtx,
  type: "comment" | "topic",
  id?: string,
) => {
  try {
    await AuthFetch(`/api/plugin/tac?type=${type}&id=${id}`, {
      method: "DELETE",
    });
    ctx.notice(`Successfully deleted ${type}`).catch((e) => console.error(e));
  } catch (error) {
    ctx.alert(`Failed to delete ${type}.`).catch((e) => console.error(e));
  }
};

const ArticleReport: React.FC<
  {
    ctx: RenderPageCtx;
    article: { id?: string; slug: string; name: string };
  } & FullReport
> = ({
  handleBan,
  ctx,
  handleDelete,
  id,
  article,
  reason,
  created,
  owner,
  reporter,
}) => {
    return (
      <li className="bg-white p-4 shadow">
        <h2 className="line-clamp-1 text-lg font-bold">{reason}</h2>
        <span className="text-sm">
          Reported:{" "}
          {new Date(created).toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "long",
          })}
        </span>
        <hr />
        <details>
          <summary className="cursor-pointer py-1">View Report</summary>
          <h4 className="font-bold">Type: Topic</h4>
          <h4 className="font-bold">Reason:</h4>
          <p className="line-clamp-1 p-1 text-sm">{reason}</p>
          <h4 className="font-bold">Link to Topic:</h4>
          <a
            className="ml-4 text-blue-400 underline"
            target="_blank"
            href={article.slug}
          >
            {article.name}
          </a>
          <h4 className="font-bold">Owner:</h4>
          <div className="ml-4">
            <Image
              width={32}
              height={32}
              className="h-8 w-8"
              src={owner?.image ?? ""}
              alt="avatar"
            />
            <span className="text-sm">{owner?.name ?? "Deleted User"}</span>
          </div>
          <h4 className="font-bold">Reported By:</h4>
          <div className="ml-4">
            <Image
              unoptimized
              width={32}
              height={32}
              className="h-8 w-8"
              src={reporter?.image ?? ""}
              alt="avatar"
            />
            <span className="text-sm">
              {reporter?.name ?? "Deleted Reporter"}
            </span>
          </div>

          <div className="flex w-full justify-end">
            <Dropdown
              renderTrigger={({ open, onClick }) => (
                <Button
                  onClick={onClick}
                  buttonSize="xxs"
                  buttonType="primary"
                  rightIcon={
                    open ? (
                      <FaChevronUp style={{ fill: "white" }} />
                    ) : (
                      <FaChevronDown style={{ fill: "white" }} />
                    )
                  }
                >
                  Actions
                </Button>
              )}
            >
              <DropdownMenu alignment="right">
                <DropdownOption onClick={() => handleDelete(id)}>
                  <div className="font-semibold">Dismiss report</div>
                </DropdownOption>
                <DropdownOption
                  onClick={() =>
                    patchItem(ctx, "topic", "locked", true, article.id)
                  }
                >
                  <div className="font-semibold">Lock topic</div>
                  <div className="text-sm tracking-tighter text-neutral-500">
                    Stop Users from posting comments on this topic.
                  </div>
                </DropdownOption>
                <DropdownSeparator />
                <DropdownOption
                  red
                  onClick={() =>
                    Promise.all([
                      deleteItem(ctx, "topic", article.id),
                      handleBan(owner?.id, owner?.name),
                    ])
                  }
                >
                  <div className="font-semibold">Remove topic and ban user</div>
                  <div className="text-sm font-light tracking-tighter">
                    Delete topic and ban its owner.
                  </div>
                </DropdownOption>
                <DropdownOption
                  red
                  onClick={() => deleteItem(ctx, "topic", article.id)}
                >
                  <div className="font-semibold">Remove topic</div>
                  <div className="text-sm font-light tracking-tighter">
                    Delete topic
                  </div>
                </DropdownOption>
                <DropdownOption
                  red
                  onClick={() => handleBan(reporter?.id, reporter?.name)}
                >
                  <div className="font-semibold">Ban reporty</div>
                  <div className="text-sm font-light tracking-tighter">
                    Ban the user who reported this.
                  </div>
                </DropdownOption>
              </DropdownMenu>
            </Dropdown>
          </div>
        </details>
      </li>
    );
  };

const CommentReport: React.FC<
  { ctx: RenderPageCtx; comment: Comment } & FullReport
> = ({
  handleBan,
  id,
  handleDelete,
  comment,
  reason,
  created,
  owner,
  reporter,
  ctx,
}) => {
    return (
      <li className="bg-white p-4 shadow">
        <h2 className="line-clamp-1 text-lg font-bold">{reason}</h2>
        <span className="text-sm">
          Reported:{" "}
          {new Date(created).toLocaleDateString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "long",
          })}
        </span>
        <hr />
        <details>
          <summary className="cursor-pointer py-1">View Report</summary>
          <h4 className="font-bold">Type: Comment</h4>
          <h4 className="font-bold">Reason for report:</h4>
          <p className="p-1 text-sm">{reason}</p>
          <h4 className="font-bold">Offending Comment:</h4>
          <div className="w-1/2 p-1 text-sm">
            <StructuredText renderBlock={renderBlock} data={comment.content as PrismaJson.PostComment} />
          </div>
          <h4 className="font-bold">Owner:</h4>
          <div className="ml-4">
            <Image
              unoptimized
              width={32}
              height={32}
              className="h-8 w-8"
              src={owner?.image ?? ""}
              alt="avatar"
            />
            <span className="text-sm">{owner?.name ?? "Deleted User"}</span>
          </div>
          <h4 className="font-bold">Reported By:</h4>
          <div className="ml-4">
            <Image
              width={32}
              height={32}
              className="h-8 w-8"
              src={reporter?.image ?? ""}
              alt="avatar"
            />
            <span className="text-sm">
              {reporter?.name ?? "Deleted Reporter"}
            </span>
          </div>

          <div className="flex w-full justify-end">
            <Dropdown
              renderTrigger={({ open, onClick }) => (
                <Button
                  onClick={onClick}
                  buttonSize="xxs"
                  buttonType="primary"
                  rightIcon={
                    open ? (
                      <FaChevronUp style={{ fill: "white" }} />
                    ) : (
                      <FaChevronDown style={{ fill: "white" }} />
                    )
                  }
                >
                  Actions
                </Button>
              )}
            >
              <DropdownMenu alignment="right">
                <DropdownOption onClick={() => handleDelete(id)}>
                  <div className="font-semibold">Dismiss report</div>
                </DropdownOption>
                <DropdownSeparator />
                <DropdownOption
                  red
                  onClick={() =>
                    Promise.all([
                      deleteItem(ctx, "comment", comment.id),
                      handleBan(owner?.id, owner?.name),
                    ])
                  }
                >
                  <div className="font-semibold">Remove comment and ban user</div>
                  <div className="text-sm font-light tracking-tighter">
                    Delete comment and ban its owner.
                  </div>
                </DropdownOption>
                <DropdownOption
                  red
                  onClick={() => deleteItem(ctx, "comment", comment.id)}
                >
                  <div className="font-semibold">Remove comment</div>
                  <div className="text-sm font-light tracking-tighter">
                    Delete comment
                  </div>
                </DropdownOption>
                <DropdownOption
                  red
                  onClick={() => handleBan(reporter?.id, reporter?.name)}
                >
                  <div className="font-semibold">Ban reporty</div>
                  <div className="text-sm font-light tracking-tighter">
                    Ban the user who reported this.
                  </div>
                </DropdownOption>
              </DropdownMenu>
            </Dropdown>
          </div>
        </details>
      </li>
    );
  };

export const Reports: React.FC<{
  mini: boolean;
  setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ mini, setMini }) => {
  const ctx = useCtx<RenderPageCtx>();
  const [page, setPage] = useState<number>(1);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [type, setType] = useState<"Comment" | "Post" | undefined>();
  const [query, setQuery] = useDebounce<string>("", 500);
  const { data, isLoading, error, mutate } = useSWR<
    ContentType,
    Response,
    [number, string, "asc" | "desc", "Comment" | "Post" | undefined]
  >(
    [page, query, order, type],
    async (params) => {
      const url = new URL("/api/plugin/reports", window.location.origin);
      url.searchParams.set("page", params[0].toString());
      if (params[1] && !!params[1].length) {
        url.searchParams.set("search", params[1]);
      }
      url.searchParams.set("order", params[2]);
      if (params[3]) {
        url.searchParams.set("type", params[3]);
      }

      const reports = await AuthFetch(url);

      return reports.json() as Promise<ContentType>;
    },
    { revalidateOnFocus: true },
  );

  const handleBan = async (userId?: string, name?: string | null) => {
    try {
      if (!userId || !name) throw new Error("Missing userId");
      await AuthFetch(`/api/plugin/users`, {
        method: "PATCH",
        json: {
          id: userId,
          ban: 1,
        },
      });
      ctx
        .notice(`User ${name} has been banned.`)
        .catch((e) => console.error(e));
    } catch (error) {
      ctx
        .alert(`Failed to ban user ${name ?? "?????"}.`)
        .catch((e) => console.error(e));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await mutate(
        async (current) => {
          if (!current) throw new Error("NoSourceData");
          const idx = current.result.findIndex((item) => item.id === id);
          if (idx === -1) throw new Error("Failed to find report.");

          await AuthFetch(`/api/plugin/reports?type=report&id=${id}`, {
            method: "DELETE",
          });

          return update(current, {
            result: { $splice: [[idx, 1]] },
          });
        },
        {
          revalidate: false,
          rollbackOnError: true,
        },
      );
    } catch (error) {
      console.error(error);
      ctx.alert("Failed to delete report!").catch((e) => console.error(e));
    }
  };

  return (
    <Panel
      actions={
        <>
          <div className="mr-dato-m flex">
            <TextInput
              onChange={(value) => setQuery(value)}
              id="search"
              name="search"
              placeholder="Search"
            />
            <Button leftIcon={<FaSearch />} />
          </div>
          <Dropdown
            renderTrigger={({ open, onClick }) => (
              <Button
                buttonType="primary"
                buttonSize="m"
                rightIcon={
                  open ? (
                    <FaChevronUp style={{ fill: "white" }} />
                  ) : (
                    <FaChevronDown style={{ fill: "white" }} />
                  )
                }
                onClick={onClick}
              >
                Sort By: {type ?? "All"} | {order === "asc" ? "Asc" : "Desc"}
              </Button>
            )}
          >
            <DropdownMenu alignment="right">
              <DropdownGroup name="Date">
                <DropdownOption onClick={() => setOrder("desc")}>
                  Desc
                </DropdownOption>
                <DropdownOption onClick={() => setOrder("asc")}>
                  Asc
                </DropdownOption>
              </DropdownGroup>
              <DropdownGroup name="Type">
                <DropdownOption onClick={() => setType(undefined)}>
                  All
                </DropdownOption>
                <DropdownOption onClick={() => setType("Comment")}>
                  Comment
                </DropdownOption>
                <DropdownOption onClick={() => setType("Post")}>
                  Post
                </DropdownOption>
              </DropdownGroup>
            </DropdownMenu>
          </Dropdown>
        </>
      }
      title="Reports"
      mini={mini}
      setMini={() => setMini((state) => !state)}
    >
      <DisplayDataStates
        message={{
          error: "There was an error, loading reports.",
          empty: "No reports found!",
        }}
        data={data as Paginate<object>}
        error={error}
        isLoading={isLoading}
      />
      {data && data.result.length ? (
        <>
          <ul className="w-full space-y-2 p-4">
            {data.result.map((report) =>
              report.type === "Comment" ? (
                <CommentReport
                  ctx={ctx}
                  handleBan={handleBan}
                  handleDelete={handleDelete}
                  key={report.id}
                  id={report.id}
                  comment={report.comment as Comment}
                  reason={report.reason}
                  created={report.created}
                  owner={report.comment?.owner ?? null}
                  reporter={report.owner}
                />
              ) : (
                <ArticleReport
                  ctx={ctx}
                  handleBan={handleBan}
                  handleDelete={handleDelete}
                  key={report.id}
                  id={report.id}
                  article={{
                    id: report.post?.id,
                    slug: `/community/p/${report.post?.id}`,
                    name: report.post?.name ?? "Missing Name",
                  }}
                  reason={report.reason}
                  created={report.created}
                  owner={report.post?.owner ?? null}
                  reporter={report.owner}
                />
              ),
            )}
          </ul>
          <hr />
          <DatoCmsPagination setPage={setPage} data={data} />
        </>
      ) : null}
    </Panel>
  );
};
