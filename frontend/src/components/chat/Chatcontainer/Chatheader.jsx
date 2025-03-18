import React from 'react'
import {Video,Circle} from 'lucide-react'
const Chatheader = () => {
    
    return (
            <header className='bg-blue-300 h-[70x] flex justify-around'>
                    <div className="bg-green-400 border rounded-full h-[50px] w-[50px] overflow-hidden">
                        
                    </div>
                    <div className="name and online flex flex-col bg-white w-[220px]">
                        <span className="namne">name</span>
                        <div className='flex alighn-center item-center gap-0.5'><Circle size={10} fill='lightgreen' strokeWidth={0} className='self-center' /> <span className='flex gap-1 '> Online</span></div>
                    </div>
                    <div className='call bg-gray-400 w-[60px]'>
                        <Video size={35} color='black' fill='white' strokeWidth={1} className='mx-auto my-auto'/>
                    </div>
            </header>    
    )
}

export default Chatheader;