const SkeletonComment: React.FC = () => {
  return (
    <li className="flex w-full animate-pulse gap-1 py-2">
      <div>
        <span className="inline-block h-9 w-9 flex-auto cursor-wait rounded-full bg-current align-middle text-base text-neutral-700 opacity-50"></span>
      </div>
      <div className="flex w-full flex-col gap-2">
        <div className="mb-1 flex justify-between gap-2">
          <span className="inline-block h-4 w-36 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
          <span className="inline-block h-4 w-36 cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
        </div>
        <span className="inline-block h-28 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
      </div>
    </li>
  );
};

export default SkeletonComment;
