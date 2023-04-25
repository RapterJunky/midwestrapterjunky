type Props = {
  tags: string[];
};

const TagList: React.FC<Props> = ({ tags }) => {
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="rounded-sm bg-emerald-400 p-1 text-xs text-white"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export default TagList;
