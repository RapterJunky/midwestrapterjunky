import {
  Button,
  Dropdown,
  DropdownMenu,
  DropdownOption,
  DropdownSeparator,
} from "datocms-react-ui";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import update from "immutability-helper";
import type { KeyedMutator } from "swr";
import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import type { Paginate } from "@/types/page";
import type { User } from "./index";

const UserItem: React.FC<{
  mutate: KeyedMutator<Paginate<User>>;
  rowName: string;
  rowId: string;
  rowBanned: 0 | 1 | 2;
  ctx: RenderPageCtx;
}> = ({ mutate, rowBanned, rowId, rowName, ctx }) => {
  const banUser = async () => {
    try {
      await mutate<Paginate<User>>(
        async (current) => {
          if (!current) throw new Error("No data to update.");

          const idx = current.result.findIndex((item) => item.id === rowId);
          if (idx === -1) throw new Error("Unable to find user index");

          const response = await AuthFetch("/api/plugin/users", {
            method: "PATCH",
            json: {
              id: rowId,
              ban: !rowBanned ? 1 : 0,
            },
          });

          const user = (await response.json()) as User;

          return update(current, {
            result: { [idx]: { $set: user } },
          });
        },
        {
          revalidate: false,
          rollbackOnError: true,
        },
      );
      ctx
        .notice(
          `Successfully ${!rowBanned ? "soft banned" : "unbanned"
          } user ${rowName}`,
        )
        .catch((e) => console.error(e));
    } catch (error) {
      ctx
        .alert(`Failed to ${!rowBanned ? "soft banned" : "unbanned"} user`)
        .catch((e) => console.error(e));
    }
  };

  const hardBan = async () => {
    try {
      await mutate<Paginate<User>>(
        async (current) => {
          if (!current) throw new Error("No data to update.");

          const idx = current.result.findIndex((item) => item.id === rowId);
          if (idx === -1) throw new Error("Unable to find user index");

          const response = await AuthFetch("/api/plugin/users", {
            method: "PATCH",
            json: {
              id: rowId,
              ban: !rowBanned ? 2 : 0,
            },
          });

          const user = (await response.json()) as User;

          return update(current, {
            result: { [idx]: { $set: user } },
          });
        },
        {
          revalidate: false,
          rollbackOnError: true,
        },
      );
      ctx
        .notice(`Successfully hard banned user ${rowName}`)
        .catch((e) => console.error(e));
    } catch (error) {
      ctx.alert("Failed to hard banned user").catch((e) => console.error(e));
    }
  };

  const deleteAccount = async () => {
    try {
      const sure = await ctx.openConfirm({
        title: "Confirm Deletion",
        content: `Are you sure you want to delete ${rowName}'s account. Deleting this account will remove all topics and comments that ${rowName} has created.`,
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

      if (!sure) return;

      await mutate<Paginate<User>>(
        async (current) => {
          if (!current) throw new Error("No data to update.");

          const user = current.result.findIndex((item) => item.id === rowId);
          if (user === -1) throw new Error("Unable to find user index.");

          await AuthFetch(`/api/plugin/users?id=${rowId}`, {
            method: "DELETE",
          });

          return update(current, {
            result: { $splice: [[user, 1]] },
          });
        },
        { revalidate: false, rollbackOnError: true },
      );
    } catch (error) {
      console.error(error);
      ctx.alert("Failed to delete account.").catch((e) => console.error(e));
    }
  };

  return (
    <td className="w-28 border p-1">
      <Dropdown
        renderTrigger={({ open, onClick }) => (
          <Button
            buttonSize="xxs"
            buttonType="primary"
            onClick={onClick}
            rightIcon={
              open ? (
                <FaChevronUp style={{ fill: "var(--light-color)" }} />
              ) : (
                <FaChevronDown style={{ fill: "var(--light-color)" }} />
              )
            }
          >
            Actions
          </Button>
        )}
      >
        <DropdownMenu alignment="right">
          <div className="group group-[>div>button_&]:block">
            <DropdownOption red={!rowBanned} onClick={banUser}>
              <div className="font-semibold">
                {!rowBanned ? "Soft ban" : "Unban"} account
              </div>
              <div className="text-sm tracking-tighter text-neutral-500 group-hover:text-inherit">
                {!rowBanned
                  ? "Stop user from posting new topics and comments."
                  : "Unban user"}
              </div>
            </DropdownOption>
          </div>
          <div className="group group-[>div>button_&]:block">
            {!rowBanned ? (
              <DropdownOption red={!rowBanned} onClick={hardBan}>
                <div className="font-semibold">
                  {!rowBanned ? "Hard ban" : "Unban"} account
                </div>
                <div className="text-sm tracking-tighter text-neutral-500 group-hover:text-inherit">
                  {!rowBanned ? "Stop user from login." : "Unban user"}
                </div>
              </DropdownOption>
            ) : null}
          </div>
          <DropdownSeparator />
          <DropdownOption red onClick={deleteAccount}>
            <div className="font-semibold">Delete account</div>
          </DropdownOption>
        </DropdownMenu>
      </Dropdown>
    </td>
  );
};

export default UserItem;
