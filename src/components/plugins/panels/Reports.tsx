import useSWR from "swr";
import { useCtx } from "datocms-react-ui";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import type { User, Report, ThreadPost, Comment } from "@prisma/client";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import {
  Dropdown,
  DropdownMenu,
  DropdownGroup,
  TextInput,
  DropdownOption,
  Button,
  Spinner,
} from "datocms-react-ui";
import { FaSearch, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Panel } from "./Panel";
import type { Paginate } from "@type/page";
import { AuthFetch } from "@lib/utils/plugin/auth_fetch";

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
  handleDelete: (id: number) => void;
  reason: string;
  created: string;
  owner: User | null;
  reporter: User | null;
};

const ArticleReport: React.FC<
  { article: { slug: string; name: string } } & FullReport
> = ({ handleDelete, id, article, reason, created, owner, reporter }) => {
  return (
    <li className="bg-white p-4 shadow">
      <h2 className="text-lg font-bold line-clamp-1">{reason}</h2>
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
        <h4 className="font-bold">Type: Article</h4>
        <h4 className="font-bold">Reason:</h4>
        <p className="p-1 text-sm line-clamp-1">{reason}</p>
        <h4 className="font-bold">Link to Article:</h4>
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
              <DropdownOption red>Remove Article and Ban User</DropdownOption>
              <DropdownOption red>Remove Article</DropdownOption>
              <DropdownOption red>Ban Reporty</DropdownOption>
              <DropdownOption onClick={() => handleDelete(id)}>
                Dismiss Report
              </DropdownOption>
            </DropdownMenu>
          </Dropdown>
        </div>
      </details>
    </li>
  );
};

const CommentReport: React.FC<{ comment: Comment } & FullReport> = ({
  id,
  handleDelete,
  comment,
  reason,
  created,
  owner,
  reporter,
}) => {
  return (
    <li className="bg-white p-4 shadow">
      <h2 className="text-lg font-bold line-clamp-1">{reason}</h2>
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
        <p className="w-1/2 p-1 text-sm">{comment.content.message}</p>
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
              <DropdownOption red>Remove Article and Ban User</DropdownOption>
              <DropdownOption red>Remove Article</DropdownOption>
              <DropdownOption red>Ban Reporty</DropdownOption>
              <DropdownOption>Hide Article</DropdownOption>
              <DropdownOption onClick={() => handleDelete(id)}>
                Dismiss Report
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
  const { data, isLoading, error, mutate } = useSWR(
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
    }
  );

  const handleDelete = async (id: number) => {
    try {
      if (!data) throw new Error("NoSourceData");

      await AuthFetch("/api/plugin/reports", {
        method: "DELETE",
        json: { id },
      });

      await mutate({
        ...data,
        result: data?.result.filter((value) => value.id !== id),
      });
    } catch (error) {
      console.error(error);
      ctx.alert("Failed to delete report!");
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
      {!data && error ? (
        <div className="flex h-full w-full items-center justify-center">
          <h1 className="text-lg">There was an error, loading reports.</h1>
        </div>
      ) : null}
      {!data && isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner size={56} />
        </div>
      ) : null}
      {data && !data.result.length ? (
        <div className="flex h-full w-full items-center justify-center">
          <h1 className="text-lg">No reports found!</h1>
        </div>
      ) : null}
      {data && data.result.length ? (
        <>
          <ul className="w-full space-y-2 p-4">
            {data.result.map((report) =>
              report.type === "Comment" ? (
                <CommentReport
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
                  handleDelete={handleDelete}
                  key={report.id}
                  id={report.id}
                  article={{
                    slug: `/thread/${report.post?.threadId}/post/${report.post?.id}`,
                    name: report.post?.name ?? "Missing Name",
                  }}
                  reason={report.reason}
                  created={report.created}
                  owner={report.post?.owner ?? null}
                  reporter={report.owner}
                />
              )
            )}
          </ul>
          <hr />
          <div className="my-dato-l flex items-center justify-evenly">
            <Button
              onClick={() => setPage(data?.previousPage ?? 1)}
              disabled={data?.isFirstPage}
              type="button"
              buttonType="primary"
            >
              Prev
            </Button>

            <div>
              {data?.currentPage ?? 0} of {data?.currentPage ?? 0}
            </div>

            <Button
              onClick={() => setPage(data?.nextPage ?? 1)}
              disabled={data?.isLastPage}
              type="button"
              buttonType="primary"
            >
              Next
            </Button>
          </div>
        </>
      ) : null}
    </Panel>
  );
};
