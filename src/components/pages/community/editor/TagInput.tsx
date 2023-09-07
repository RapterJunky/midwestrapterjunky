"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  onBlur: () => void;
  vailidate: (tag: string, tags: string[]) => boolean;
};

const TagInput: React.FC<Props> = ({ onBlur, onChange, value, vailidate }) => {
  const [isKeyReleased, setIsKeyReleased] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const onDrop = (from: number, to: number) => {
    const copy = [...value];
    const copyTo = copy[to];
    const copyFrom = copy[from];
    if (!copyTo || !copyFrom) return;
    copy.splice(from, 1, copyTo);
    copy.splice(to, 1, copyFrom);

    onChange(copy);
  };

  const addTag = () =>
    setInputValue((currentValue) => {
      const tag = currentValue.trim();
      const vaild = vailidate(tag, value);
      if (!vaild) return tag;
      onChange([...value, tag]);
      return "";
    });

  const removeTag = (idx: number) => {
    if (idx === -1) {
      const tags = [...value];
      const pop = tags.pop();
      onChange(tags);
      setInputValue(pop ?? "");
      return;
    }
    const removed = value.filter((_, i) => i !== idx);
    onChange(removed);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-2">
        {value.map((tag, i) => (
          <Badge
            role="button"
            className="cursor-pointer"
            draggable
            aria-label={`Remove tag ${tag}`}
            onClick={() => removeTag(i)}
            onDragStart={(ev) => ev.dataTransfer.setData("index", i.toString())}
            onDrop={(ev) => {
              ev.preventDefault();
              const fromIndex = parseInt(ev.dataTransfer.getData("index"));
              onDrop(fromIndex, i);
            }}
            onDragOver={(ev) => ev.preventDefault()}
            key={i}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(ev) => setInputValue(ev.target.value)}
          onKeyUp={() => setIsKeyReleased(true)}
          onKeyDown={(ev) => {
            if (
              ev.key === "," ||
              (ev.key === "Enter" && inputValue.trim().length)
            ) {
              ev.preventDefault();
              addTag();
            }
            if (ev.key === "Backspace" && !inputValue.length && value.length && isKeyReleased) {
              ev.preventDefault();
              removeTag(-1);
              setIsKeyReleased(false);
            }
          }}
          enterKeyHint="enter"
          spellCheck
          placeholder="Enter tag"
          data-automation="input"
          aria-label="Press enter to add new tag"
        />
        <Button
          type="button"
          onClick={addTag}
          onBlur={onBlur}
          aria-label="Add item to tag list"
          size="icon"
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
};

export default TagInput;
