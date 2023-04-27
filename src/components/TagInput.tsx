import { useState } from "react";
import HiX from "@components/icons/HiX";

type Props = {
  max?: number;
  setError: (type: string, message: string) => void;
  value: string[];
  clearError: () => void;
  onChange: (value: string[]) => void;
  className?: string;
};

const TagBtn: React.FC<{
  removeButtonText: string;
  name: string;
  onDelete: () => void;
}> = ({ removeButtonText, name, onDelete }) => {
  return (
    <button
      className="flex items-center gap-1 rounded-sm border bg-neutral-100 px-3 py-1 shadow-sm"
      type="button"
      title={removeButtonText}
      onClick={onDelete}
    >
      <span>{name}</span>
      <HiX />
    </button>
  );
};

/**
 * @see https://github.com/i-like-robots/react-tags/blob/main/lib/ReactTags.js
 * */
const TagInput: React.FC<Props> = ({
  setError,
  value,
  onChange,
  clearError,
  max,
  className = "",
}) => {
  const [tags, setTags] = useState<string[]>(value);
  const [query, setQuery] = useState<string>("");
  return (
    <div className={`flex gap-2 p-1 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <TagBtn
            key={i}
            name={tag}
            removeButtonText={`Remove tag '${tag}'`}
            onDelete={() => {
              setTags((current) => current.filter((value) => value !== tag));
              clearError();
            }}
          />
        ))}
        <div>
          <input
            className="w-full appearance-none px-3 py-2 focus:outline-none"
            value={query}
            onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                const tag = query;
                const exists = tags.includes(tag);
                const minLength = tag.length < 3;
                const maxLength = tag.length > 12;
                const maxItems = !!max ? tag.length - 1 > max : false;

                if (exists || minLength || maxLength || maxItems) {
                  setError(
                    exists
                      ? "pattern"
                      : minLength
                        ? "minLength"
                        : maxItems
                          ? "max"
                          : "maxLength",
                    exists
                      ? "Tag already exists."
                      : minLength
                        ? "Tag must be longer then 3 characters."
                        : maxItems
                          ? `There can only be ${max} tags`
                          : "Tag must be less then 12 characters"
                  );
                  return;
                }

                const state = [...tags, tag];
                onChange(state);
                setTags(state);
                setQuery("");
                clearError();
              }
            }}
            aria-autocomplete="list"
            placeholder="Add new tag"
            enterKeyHint="enter"
          />
        </div>
      </div>
    </div>
  );
};

export default TagInput;
