import { FaUserTag, FaUserPlus } from 'react-icons/fa';

interface OptionsProps {
    setEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setSelect: React.Dispatch<React.SetStateAction<boolean>>
}

const Options = ({ setEdit, setSelect }: OptionsProps) => {
    return (
        <div className='w-full justify-center flex gap-4 '>
            <button className="h-30 w-30 mx-4 px-4 flex justify-center flex-col items-center shadow-xl hover:bg-gray-50 rounded-sm" onClick={() => setEdit(true)}>
                <FaUserPlus className='h-10 w-10' />
                <span className="mt-2">Create New</span>
            </button>

            <button className="h-30 w-30 mx-4 px-4 flex justify-center flex-col items-center shadow-xl hover:bg-gray-50 rounded-sm" onClick={() => setSelect(true)}>
                <FaUserTag className='h-10 w-10' />
                <span className="mt-2">Use Existing</span>
            </button>
        </div>
    );
}

export default Options;