const Skeleton: React.FC = () => {
  return (
    <div className="shadow animate-in fade-in">
      <div className="relative h-56 w-full animate-pulse">
        <span className="inline-block h-full min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base text-neutral-50 opacity-50"></span>
      </div>
      <div className="p-2">
        <h1 className="font-bold">
          <span className="inline-block min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base text-neutral-50 opacity-50"></span>
        </h1>
        <span className="text-xs text-gray-800">
          <span className="inline-block min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base text-neutral-50 opacity-50"></span>
        </span>
        <div className="mt-4 flex w-full justify-between">
          <div className="text-gray-700 hover:text-gray-600">
            <span className="inline-block min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base text-neutral-50 opacity-50"></span>
          </div>
          <span className="inline-block min-h-[1em] w-full flex-auto cursor-wait bg-gray-700 align-middle text-base text-neutral-50 opacity-50"></span>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
