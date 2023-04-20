import { useState } from 'react';
import { HiX } from 'react-icons/hi';

type Props = {
    max?: number
    setError: (type: string, message: string) => void,
    value: string[];
    clearError: () => void,
    onChange: (value: string[]) => void;
}

const TagBtn: React.FC<{ removeButtonText: string; name: string; onDelete: () => void }> = ({ removeButtonText, name, onDelete }) => {
    return (
        <button className="flex items-center gap-1 py-1 px-3 border shadow-sm rounded-sm bg-neutral-100" type="button" title={removeButtonText} onClick={onDelete}>
            <span>{name}</span>
            <HiX />
        </button>
    );
}

///https://github.com/i-like-robots/react-tags/blob/main/lib/ReactTags.js
const TagInput: React.FC<Props> = ({ setError, value, onChange, clearError, max }) => {
    const [tags, setTags] = useState<string[]>(value);
    const [query, setQuery] = useState<string>("");
    return (
        <div className="border flex gap-2 p-1 border-neutral-400">
            <div className='flex flex-wrap gap-2'>
                {tags.map((tag, i) => (
                    <TagBtn key={i} name={tag} removeButtonText={`Remove tag '${tag}'`} onDelete={() => {
                        setTags((current) => current.filter(value => value !== tag));
                        clearError();
                    }} />
                ))}
                <div>
                    <input className="appearance-none py-2 px-3 w-full focus:outline-none" value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)} onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();

                            const tag = query;
                            const exists = tags.includes(tag);
                            const minLength = tag.length < 3;
                            const maxLength = tag.length > 12;
                            const maxItems = !!max ? tag.length - 1 > max : false

                            if (exists || minLength || maxLength || maxItems) {
                                setError(exists ?
                                    "pattern" :
                                    minLength ? "minLength" : maxItems ? "max" : "maxLength",
                                    exists ? "Tag already exists." :
                                        minLength ? "Tag must be longer then 3 characters." : maxItems ? `There can only be ${max} tags` :
                                            "Tag must be less then 12 characters");
                                return;
                            }

                            const state = [...tags, tag];
                            onChange(state);
                            setTags(state);
                            setQuery("");
                            clearError();
                        }
                    }} aria-autocomplete='list' placeholder="Add new tag" role="combobox" enterKeyHint="enter" />
                </div>
            </div>
        </div>
    );
}

export default TagInput;