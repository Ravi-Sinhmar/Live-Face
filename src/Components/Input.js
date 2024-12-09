import React, { useEffect, useRef,useCallback } from "react";


function Input(){

    const localVideoRef = useRef(null);
    const localVideoRef2 = useRef(null);
    
    const getMyVideo = useCallback(async () => {
   
        try {
          const video = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    
          console.log('Video tracks:', video.getVideoTracks());
          console.log('Audio tracks:', video.getAudioTracks());
      
          // Set the video source to the `videoRef`
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = video;
            localVideoRef2.current.srcObject = video;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
        }
      }, []);
    
    
      useEffect(() => {
          getMyVideo();

      }, [getMyVideo]);

    return (
        <React.Fragment className="flex justify-center items-center h-svh w-svw">
         {false ? (
            // <Connecting />
            <h1>Hlo</h1>
          ):
            (<div className="flex justify-center bg-blm  items-center w-svw h-svh">
            <div className="w-svw h-svh bg-blm  flex justify-center items-center sm:w-10/12  md:w-3/5 lg:w-2/5 md:aspect-square">
              <div className="bg-transparent ring-4 ring-blf rounded-lg h-full w-full flex flex-col justify-between overflow-hidden relative px-2 pt-2">
                <video
                 ref={localVideoRef2}
                  muted
                  autoPlay
                  playsInline
                  className="absolute right-4 top-4 rounded-md  object-cover h-28 w-20  sm:h-32 sm:w-24  ring-2 ring-blm"
                ></video>
                {/* <button onClick={checkRemoteVideoPlaying} className="absolute z-20 flex items-center justify-center text-center bg-blf h-14 w-14 rounded-full text-white p-1.5 right-4 bottom-24"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 flex items-center text-center justify-center">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg></button> */}
    
                <div className="flex flex-col justify-center items-center h-full">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full md:aspect-square  ring-2 ring-blt bg-blm rounded-md  object-cover  "
                  ></video>
                </div>
                <div className="w-full bg-transparent  py-2 flex items-center justify-center">
                  <div className="flex justify-between w-full rounded-md ring-2 ring-black items-center px-4 py-2 bg-blm h-fit ">
                    <button
                      
                      className="flex flex-col text-sm items-center justify-center gap-1"
                    >
                      <svg
                         className= {true ?  "size-8 p-1 bg-blf text-blm rounded-full" : "size-8 p-1 text-blt rounded-full" }   
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.40135 12.5C9.63354 12.9014 9.95606 13.244 10.3411 13.5M9.17071 4C9.58254 2.83481 10.6938 2 12 2C13.6569 2 15 3.34315 15 5L15 10.5"
                          stroke={true ? "#FBFBFC" : "#444752"}
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M6 11C6 14.3137 8.68629 17 12 17C12.4675 17 12.9225 16.9465 13.3592 16.8454M18 11C18 11.854 17.8216 12.6663 17.5 13.4017"
                          stroke={true ? "#FBFBFC" : "#444752"}
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <line
                          x1="12"
                          y1="18"
                          x2="12"
                          y2="20"
                          stroke={true ? "#FBFBFC" : "#444752"}
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <line
                          x1="10"
                          y1="21"
                          x2="14"
                          y2="21"
                          stroke={true ? "#FBFBFC" : "#444752"}
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <line
                          x1="2.4137"
                          y1="2.03821"
                          x2="19.0382"
                          y2="19.5863"
                          stroke={true ? "#FBFBFC" : "#444752"}
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                      </svg>
                      <p>Mute</p>
                    </button>
    
                    <button
                     
                      className="flex flex-col text-sm items-center justify-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className= {true ?  "size-8 p-1 bg-blf text-blm rounded-full" : "size-8 p-1 text-blt rounded-full" }   
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
                        />
                      </svg>
                      Stop
                    </button>
                    {true? <button className="z-20 w-fit bg-blf text-blm px-6 text-sm font-[400] flex text-center items-center justify-center py-2 rounded-full  ring-1 ring-blt shadow-md shadow-blt h-fit">Join</button> : null } 
                    <button
                   
                      className="flex flex-col text-sm items-center justify-center gap-1"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className= {true ?  "size-8 p-1 bg-blf text-blm rounded-full" : "size-8 p-1 text-blt rounded-full" }   
    
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                        />
                      </svg>
                      Silence
                    </button>
    
                    <button
                      
                      className="flex flex-col text-sm items-center justify-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="size-8 p-1 rounded-full"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                        />
                      </svg>
                      More
                    </button>
                  </div>
                </div>
              </div>
              </div>   </div>) }
        </React.Fragment>
      );
}


export default Input;