import { FaUserTag, FaUserPlus } from "react-icons/fa";

interface OptionsProps {
  setEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setSelect: React.Dispatch<React.SetStateAction<boolean>>;
}

const Options = ({ setEdit, setSelect }: OptionsProps) => {
  return (
    <div className="flex w-full justify-center gap-4 ">
      <button
        className="w-30 h-30 mx-4 flex flex-col items-center justify-center rounded-sm px-4 shadow-xl hover:bg-gray-50"
        onClick={() => setEdit(true)}
      >
        <FaUserPlus className="h-10 w-10" />
        <span className="mt-2">Create New</span>
      </button>

      <button
        className="w-30 h-30 mx-4 flex flex-col items-center justify-center rounded-sm px-4 shadow-xl hover:bg-gray-50"
        onClick={() => setSelect(true)}
      >
        <FaUserTag className="h-10 w-10" />
        <span className="mt-2">Use Existing</span>
      </button>
    </div>
  );
};

export default Options;
