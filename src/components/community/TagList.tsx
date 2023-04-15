type Props = {
    tags: string[]
}

const TagList: React.FC<Props> = ({ tags }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, i) => (
                <span key={i} className="p-1 text-xs bg-emerald-400 text-white rounded-sm">{tag}</span>
            ))}
        </div>
    );
}

export default TagList;