import { FaUserPlus, FaUserTag } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";

interface OptionsProps {
  setPageState: (value: "edit" | "select" | "options") => void;
}

const Options = ({ setPageState }: OptionsProps) => {
  return (
    <div>
      <div className="flex justify-center">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Select an option
        </h3>
      </div>
      <Separator className="my-2" />
      <div className="flex w-full justify-center gap-4">
        <button
          className="w-30 h-30 mx-4 flex flex-col items-center justify-center rounded-sm border border-[var(--border-color)] px-4 shadow-lg hover:border-[var(--darker-border-color)] hover:bg-gray-50"
          onClick={() => setPageState("edit")}
        >
          <div className="px-2 pt-2">
            <FaUserPlus className="h-10 w-10" />
          </div>
          <span className="py-1">Create New</span>
        </button>

        <button
          className="w-30 h-30 mx-4 flex flex-col items-center justify-center rounded-sm border border-[var(--border-color)] px-4 shadow-lg hover:border-[var(--darker-border-color)] hover:bg-gray-50"
          onClick={() => setPageState("select")}
        >
          <div className="px-2 pt-2">
            <FaUserTag className="h-10 w-10" />
          </div>
          <span className="py-1">Use Existing</span>
        </button>
      </div>
    </div>
  );
};

export default Options;
