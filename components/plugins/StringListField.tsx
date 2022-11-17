import { TextInput, Button } from 'datocms-react-ui';
import { FaPlus, FaTrash } from "react-icons/fa";
import { useState, useEffect } from 'react';

export default function StringListField({ onChange, value, label }: any){
    const [nextValue,setNextValue] = useState<string>("");
    const [values,setValues] = useState<string[]>(value ?? []);

    useEffect(()=>{
        onChange(values);
    },[values]);

    const addValue = () => {
        if(!nextValue) return;

        setValues((data)=>{
            return [...data,nextValue];
        });

        setNextValue("");
    }

    const dropValue = (value: string) => {
        setValues((data)=>{
            return data.filter(c=>c!==value);
        });
    }

    return (
        <div>
            { label ? <h6 className="mb-2">{label}</h6> : null}
            <div className='flex gap-1'>
                <TextInput value={nextValue} onChange={(value)=>setNextValue(value)}/>
                <Button buttonType="primary" onClick={addValue}>
                    <FaPlus/>
                </Button>
            </div>
            <ul className="mt-4">
                { values.map((value,i)=>(
                    <li key={i} className="p-2 flex items-center">
                        <span className="mr-auto">{value}</span> 
                        <Button buttonSize="xxs" buttonType="negative" onClick={()=>dropValue(value)}>
                            <FaTrash/>
                        </Button>
                    </li>
                )) }
            </ul>
        </div>
    );
}