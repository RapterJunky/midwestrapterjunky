import { type RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import Image from "next/image";
import { FaPlusCircle, FaEdit, FaTrash } from "react-icons/fa";
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
  drop
}: {
  updateField: (
    editing: boolean,
    parameters?: Record<string, any>
  ) => Promise<void>;
  data: AuthorItem;
  drop: (id: string) => void
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
      <div className="absolute right-0 top-0 hidden h-full w-full gap-1 rounded bg-gray-200 bg-opacity-90 group-hover:flex divide-x divide-gray-600 py-2">
        <button className="w-full h-full flex justify-center items-center text-gray-700 hover:text-gray-600" onClick={() => updateField(true, data)}>
          <FaEdit className="h-8 w-8" />
        </button>
        <button className="h-full w-full flex justify-center items-center text-red-600 hover:text-red-500" onClick={() => drop(data.id)}>
          <FaTrash className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
};

export default function AuthorEditorExtension({
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

  const drop = async (id: string) => {
    const nextData = value.filter((value) => value.id !== id);
    await setField(nextData);
  }

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

    if ("type" in data) return drop(data.id);

    if (editing) {
      const nextData = value.filter((value) => value?.id !== data.id);
      nextData.push(data);
      await setField(nextData);
      return;
    }

    const exists = value.some(value => value.id === data.id)
    if (exists) {
      ctx.alert(`Author ${data.name} has already been selected!`);
      return;
    }

    value.push(data);
    await setField(value);
  };

  return (
    <Canvas ctx={ctx}>
      <div className="flex flex-wrap gap-2 divide-x">
        {value.map((item, i) => (
          <Author drop={drop} updateField={updateField} key={i} data={item} />
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
