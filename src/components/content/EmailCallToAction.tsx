import { StructuredText } from 'react-datocms';
import { HiOutlineChevronRight } from 'react-icons/hi';

import { markRules } from '@lib/StructuredTextRules';
import type { Color, StructuredContent } from '@lib/types';

interface EmailCallToActionProps {
    data: StructuredContent;
    background_color: Color | null;
}

export default function EmailCallToAction(props: EmailCallToActionProps){
    return (
        <div style={{ backgroundColor: props?.background_color?.hex ?? "rgb(63 98 18)" }} className='pt-3 pb-3 flex flex-col lg:flex-row h-max lg:h-52 items-center justify-center gap-5 text-white'>
            <div className="text-center w-3/5">
                <StructuredText customMarkRules={markRules} data={props.data}/>
            </div>
            <form className="flex gap-5 w-3/4 justify-center sm:w-2/5 from-white" action="/api/submit-email" method='post'>
                <input name="email" placeholder='Enter email' className="w-3/4 bg-transparent border-white border-x-0 border-t-0 ring-0 focus:ring-0 text-white placeholder:text-zinc-300" type="email" required/>
                <button type="submit" className='active:translate-x-1'>
                    <HiOutlineChevronRight className='text-white font-bold text-2xl'/>
                </button>
            </form>
        </div>
    );
}