import { StructuredText } from 'react-datocms';
import { HiOutlineChevronRight} from 'react-icons/hi';

import { rules } from '../../lib/StructuredTextRules';

interface EmailCallToActionProps {
    data: any
    background_color: { hex: string } | null;
}

export default function EmailCallToAction(props: EmailCallToActionProps){
    return (
        <div style={{ backgroundColor: props?.background_color?.hex ?? "rgb(63 98 18)" }} className='pt-3 pb-3 flex flex-col lg:flex-row h-max lg:h-52 items-center justify-center gap-5 text-white'>
            <div className="text-center w-3/5">
                <StructuredText customNodeRules={rules} data={props.data}/>
            </div>
            <form className="flex gap-5 w-2/5" action="/api/submit-email-call-to-action" method='POST'>
                <input placeholder='Enter email' className="w-3/4 bg-transparent border-b outline-none focus:border" type="email" required/>
                <button type="submit" className='active:translate-x-1'>
                    <HiOutlineChevronRight className='text-white font-bold text-2xl'/>
                </button>
            </form>
        </div>
    );
}