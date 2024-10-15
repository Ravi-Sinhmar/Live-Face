import React , {useCallback, useEffect, useRef} from "react";
import { usePeer } from "./../Contexts/Peer";
function Setting({localVideoRef}) {
    const audioInputEl = useRef(null);
    const audioOutputEl =useRef(null);
    const videoInputEl =useRef(null);
    const {setSetting,setCons} = usePeer();
    const getStream = useCallback(async () => {
        try{
         await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      }catch(err){
          console.log(err)
      }},[]);
      useEffect(()=>{
          getStream();
      },[getStream]);
    const getDevices = useCallback(async()=>{
        try{
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log(devices)
            setCons({video:true,audio:true});
            devices.forEach(d=>{
                const option = document.createElement('option') //create the option tag
                option.value = d.deviceId
                option.text = d.label
                //add the option tag we just created to the right select
                if(d.kind === "audioinput"){
                    audioInputEl.current.appendChild(option)    
                }else if(d.kind === "audiooutput"){
                    audioOutputEl.current.appendChild(option)    
                }else if(d.kind === "videoinput"){
                    videoInputEl.current.appendChild(option)    
                }
            })
        }catch(err){
            console.log(err);
        }
    },[setCons]);
    
    useEffect(()=>{
        getDevices();
    },[getDevices])
    const changeAudioInput = async(e)=>{
        //changed audio input!!!
        const deviceId = e.target.value;
        console.log("changed audio input");
        const newConstraints = {
            audio: {deviceId: {exact: deviceId}},
            video: true,
        };
        setCons(newConstraints);

    }
    const changeAudioOutput = async(e)=>{
        alert(localVideoRef);
      await localVideoRef.current.setSinkId(e.target.value);
        console.log("Changed audio device!")
    }
    
    const changeVideo = async(e)=>{
        //changed video input!!!
        const deviceId = e.target.value;
        console.log("changed Vid input");
        alert("vid change")
        const newConstraints = {
            audio: true,
            video: {deviceId: {exact: deviceId}},
        }
        setCons(newConstraints);
    }
    
    return(

        // Final Code 
      <div className="w-svw h-svh flex items-center justify-center">
        <div className="flex flex-col w-full   md:w-1/4  h-full bg-blt py-5  pb-12 px-2 justify-between items-center gap-10">
        <div className="flex flex-col items-center w-full gap-8">
        <button onClick={() => {
  setSetting("ok");
}}  className="flex  items-center w-full  rounded-md  ">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="h-8 w-8 text-blm  p-2 font-[500] bg-blf  rounded-full">
      <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
    </svg>
            
            </button>
       <div className="flex flex-col gap-3 w-full justify-between ">
         <label className=" font-[500] text-blf">Audio Input(Mic)</label>
         <select onChange={changeAudioInput} ref={audioInputEl} className=" text-blt px-2  ring-1 ring-gray-500 bg-blg rounded-md w-full text-sm  py-3 "  id="audio-input">
          
         </select>
       </div>
       {/* Sound Output */}
       <div className="flex flex-col gap-3 w-full justify-between ">
         <label className="text-blf font-[500] ">Sound Output(Speaker)</label>
         <select onChange={changeAudioOutput} ref={audioOutputEl} className=" text-blt px-2  ring-1 ring-gray-500 bg-blg rounded-md w-full text-sm  py-3 "  id="audio-input">
          
         </select>
       </div>
 
       {/* Camera Type */}
       <div className="flex flex-col gap-3 w-full justify-between ">
         <label className="text-blf font-[500]">Camera Type</label>
         <select onChange={changeVideo} ref={videoInputEl} className=" text-blt px-2  ring-1 ring-gray-500 bg-blg rounded-md w-full text-sm  py-3 "  id="audio-input">
    
         </select>
       </div>
     
     </div>
     <button onClick={() => {
  setSetting("ok");
}} className="bg-blf text-blm shadow-sm shadow-black w-full py-2 rounded-full text-lg">Continue</button>
    </div>
    </div>
    )
}

export default Setting;
