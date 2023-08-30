import { useState } from "react";
import HiPlus from "./icons/HiPlus";
import HiX from "./icons/HiX";

type Props = {
  id?: string;
  value: string[];
  name: string;
  classOverride?: {
    button?: string;
    input?: string;
  };
  onChange: (tags: string[]) => void;
  onBlur: () => void;
  vailidate: (tag: string, tags: string[]) => boolean;
};

type TagProps = {
  name: string;
  idx: number;
  onDelete: () => void;
  onDrop: (from: number, to: number) => void;
};

const Tag: React.FC<TagProps> = ({ name, onDelete, idx, onDrop }) => {
  return (
    <span
      onDragStart={(ev) => ev.dataTransfer.setData("index", idx.toString())}
      onDrop={(ev) => {
        ev.preventDefault();
        const fromIndex = parseInt(ev.dataTransfer.getData("index"));
        onDrop(fromIndex, idx);
      }}
      onDragOver={(ev) => ev.preventDefault()}
      className="flex cursor-move items-center justify-center gap-2 border border-neutral-500 px-2.5 py-2 font-bold"
      draggable
    >
      <div className="flex flex-col items-center justify-center">{name}</div>
      <button
        onClick={onDelete}
        className="flex h-full flex-col items-center justify-center text-lg font-bold text-red-500"
        type="button"
        aria-label={`Remove tag ${name}`}
      >
        <HiX />
      </button>
    </span>
  );
};

const TagInput: React.FC<Props> = ({
  vailidate,
  value,
  onBlur,
  onChange,
  name,
  classOverride,
  id,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isKeyReleased, setIsKeyReleased] = useState<boolean>(false);

  const handleDrag = (from: number, to: number) => {
    const copy = [...value];

    const copyTo = copy[to];
    const copyFrom = copy[from];

    if (!copyTo || !copyFrom) return;

    copy.splice(from, 1, copyTo);
    copy.splice(to, 1, copyFrom);

    onChange(copy);
  };

  const handleAddTag = () => {
    setInputValue((nextTag) => {
      const tag = nextTag.trim();

      const vaild = vailidate(tag, value);
      if (!vaild) return tag;
      onChange([...value, tag]);
      return "";
    });
  };

  const handleDeletion = (index: number) => {
    const tags = [...value];

    if (index === -1) {
      const poppedTag = tags.pop();
      onChange(tags);
      setInputValue(poppedTag ?? "");
      return;
    }

    const removed = value.filter((_i, i) => i !== index);
    onChange(removed);
  };

  const handleAddOnKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || (e.key === "Enter" && inputValue.trim().length)) {
      e.preventDefault();
      handleAddTag();
    }
    if (
      e.key === "Backspace" &&
      !inputValue.length &&
      value.length &&
      isKeyReleased
    ) {
      e.preventDefault();
      handleDeletion(-1);
      setIsKeyReleased(false);
    }
  };
  return (
    <div className="flex flex-wrap gap-1">
      {value.map((tag, i) => (
        <Tag
          onDrop={handleDrag}
          idx={i}
          name={tag}
          key={i}
          onDelete={() => handleDeletion(i)}
        />
      ))}
      <div className="flex">
        <input
          data-cy="tag-input-field"
          id={id}
          enterKeyHint="enter"
          name={name}
          spellCheck
          onKeyUp={() => setIsKeyReleased(true)}
          onKeyDown={handleAddOnKey}
          onBlur={onBlur}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          type="text"
          className={classOverride?.input ?? "h-full border-r-0"}
          placeholder="Press enter to add new tag"
          aria-label="Press enter to add new tag"
          data-automation="input"
        />
        <button
          onClick={handleAddTag}
          type="button"
          className={
            classOverride?.button ??
            "inline-block rounded-r-sm bg-primary px-3 py-2 text-lg font-medium uppercase leading-normal text-white transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
          }
          title="Add tag to list"
          aria-label="Add item to tag list"
        >
          <HiPlus />
        </button>
      </div>
    </div>
  );
};

export default TagInput;
