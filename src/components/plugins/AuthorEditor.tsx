import { type RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import Image from "next/image";
import { FaPlusCircle, FaEdit } from "react-icons/fa";
import { Canvas } from "datocms-react-ui";
import { useMemo } from "react";

interface AuthorItem {
  avatar: string | null;
  name: string;
  social: { link: string; user: string } | null;
  id: string;
}

const Author = ({
  data,
  updateField,
}: {
  updateField: (
    editing: boolean,
    parameters?: Record<string, any>
  ) => Promise<void>;
  data: AuthorItem;
}) => {
  return (
    <div className="group relative p-2">
      <div className="flex h-full items-center justify-center gap-1">
        <div className="relative h-12 w-12">
          <Image
            sizes="100vw"
            className="rounded-full object-cover object-center"
            src={data.avatar ?? "https://api.lorem.space/image/car?w=48&h=48"}
            alt="author image"
            fill
          />
        </div>
        <div className="ml-1 flex flex-col">
          <h4 className="font-sans font-bold">{data.name}</h4>
          <span className="text-blue-600">{data.social?.user}</span>
        </div>
      </div>
      <button
        className="absolute right-0 top-0 hidden h-full w-full items-center justify-center gap-1 rounded bg-gray-200 bg-opacity-90 group-hover:flex"
        onClick={() => updateField(true, data)}
      >
        <FaEdit className="h-8 w-8" />
      </button>
    </div>
  );
};

export default function AuthorEditor({
  ctx,
}: {
  ctx: RenderFieldExtensionCtx;
}) {
  const data = ctx.formValues[ctx.fieldPath];
  const value = useMemo<AuthorItem[]>(
    () => JSON.parse(data as string) ?? [],
    [data]
  );

  const setField = async (content: AuthorItem[]) =>
    ctx.setFieldValue(ctx.fieldPath, JSON.stringify(content));

  const updateField = async (
    editing: boolean,
    parameters?: Record<string, any>
  ) => {
    const data = (await ctx.openModal({
      id: "editAuthor",
      title: editing ? "Edit Author" : "Add Author",
      parameters,
    })) as AuthorItem | { type: "delete"; id: string } | undefined;
    if (!data) return;

    if ("type" in data) {
      const nextData = value.filter((value) => value.id !== data.id);
      await setField(nextData);
      return;
    }

    if (editing) {
      const nextData = value.filter((value) => value?.id !== data.id);
      nextData.push(data);
      await setField(nextData);
      return;
    }

    value.push(data);
    await setField(value);
  };

  return (
    <Canvas ctx={ctx}>
      <div className="flex flex-wrap gap-2 divide-x">
        {value.map((item, i) => (
          <Author updateField={updateField} key={i} data={item} />
        ))}
        <button
          className="group flex w-16 flex-col items-center justify-center gap-1 p-2"
          onClick={() => updateField(false)}
        >
          <FaPlusCircle className="h-8 w-8 transition-colors duration-200 group-hover:text-green-600" />
          <span>Add</span>
        </button>
      </div>
    </Canvas>
  );
}
