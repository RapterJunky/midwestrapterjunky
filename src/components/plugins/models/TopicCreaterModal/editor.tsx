import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { type LexicalEditor } from "lexical";
import { useMemo, useRef } from "react";
import RootEditor from "@/components/pages/community/editor/RootEditor";
import { LinkNode } from "@lexical/link";
import { ImageNode } from "@/components/pages/community/editor/nodes/ImageNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  Button,
  Dropdown,
  DropdownGroup,
  DropdownMenu,
  DropdownOption,
  FieldGroup,
  FormLabel,
  SwitchField,
  TextField,
} from "datocms-react-ui";
import TagInput from "@/components/pages/community/editor/TagInput";
import { Controller, useForm } from "react-hook-form";

type FormState = {
  notifications: boolean;
  category: string;
  userId: string;
  title: string;
  tags: string[];
};

const Editor: React.FC = () => {
  const { handleSubmit, control, setError, clearErrors } = useForm<FormState>();
  const editorRef = useRef<LexicalEditor>(null);
  const editorConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: "editor",
      onError(error) {
        console.error(error);
        throw error;
      },
      nodes: [
        LinkNode,
        ListItemNode,
        ListNode,
        HeadingNode,
        QuoteNode,
        ImageNode,
      ],
      theme: {
        text: {
          strikethrough: "line-through",
          underline: "underline",
          underlineStrikethrough: "underline line-through",
        },
        root: "select-text whitespace-pre-wrap break-words px-2 block relative min-h-[400px] flex-1 md:min-h-[700px] outline-none",
      },
    }),
    [],
  );

  const onSubmit = () => {};

  return (
    <form className="flex" onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full">
        <RootEditor
          ref={editorRef}
          height="min-h-[400px] flex-1 md:min-h-[700px]"
          editorConfig={editorConfig}
        />
      </div>
      <div className="flex flex-col gap-2 p-2">
        <FieldGroup>
          <Controller
            control={control}
            name="userId"
            rules={{ required: { message: "A user is required", value: true } }}
            render={() => (
              <div>
                <FormLabel htmlFor="user">User</FormLabel>
                <Dropdown
                  renderTrigger={({ onClick }) => (
                    <Button
                      buttonSize="s"
                      fullWidth
                      type="button"
                      onClick={onClick}
                    >
                      User
                    </Button>
                  )}
                >
                  <DropdownMenu>
                    <DropdownGroup name="Categoies">
                      <DropdownOption>Option 1</DropdownOption>
                    </DropdownGroup>
                  </DropdownMenu>
                </Dropdown>
              </div>
            )}
          />
          <Controller
            rules={{
              required: { message: "A category is required", value: true },
            }}
            control={control}
            name="category"
            render={() => (
              <div>
                <FormLabel htmlFor="category">Category</FormLabel>
                <Dropdown
                  renderTrigger={({ onClick }) => (
                    <Button
                      buttonSize="s"
                      fullWidth
                      type="button"
                      onClick={onClick}
                    >
                      Category
                    </Button>
                  )}
                >
                  <DropdownMenu>
                    <DropdownGroup name="Categoies">
                      <DropdownOption>Option 1</DropdownOption>
                    </DropdownGroup>
                  </DropdownMenu>
                </Dropdown>
              </div>
            )}
          />
          <Controller
            control={control}
            rules={{
              required: { message: "A title is required", value: true },
            }}
            name="title"
            render={({ field, fieldState }) => (
              <TextField
                required
                id="title"
                error={fieldState.error?.message}
                value={field.value}
                onChange={field.onChange}
                placeholder="Topic Title"
                name="title"
                label="Title"
                hint="A title for a topic"
              ></TextField>
            )}
          />
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                onBlur={field.onBlur}
                value={field.value ?? []}
                onChange={field.onChange}
                vailidate={(tag, tags) => {
                  if (!tag.length || tag.length < 3) {
                    setError("tags", {
                      message: "The minium length for a tag is 3.",
                      type: "minLength",
                    });
                    return false;
                  }
                  if (tag.length > 12) {
                    setError("tags", {
                      message: "The maxium length for a tag is 12.",
                      type: "maxLength",
                    });
                    return false;
                  }

                  if (tags.includes(tag)) {
                    setError("tags", {
                      message: `The tag "${tag}" is already in the list.`,
                      type: "pattern",
                    });
                    return false;
                  }

                  clearErrors("tags");

                  return true;
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="notifications"
            render={({ field, fieldState }) => (
              <SwitchField
                name="debugMode"
                id="debugMode"
                error={fieldState.error?.message}
                label="Notifications"
                hint="Allow sending notifications to you by email about events on your post."
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup className="mt-auto">
          <Button type="submit" fullWidth buttonType="primary">
            Submit
          </Button>
        </FieldGroup>
      </div>
    </form>
  );
};

export default Editor;
