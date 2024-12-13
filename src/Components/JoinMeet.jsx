import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useFriend } from "./../Contexts/Friend";
import { usePeer } from "./../Contexts/Peer";
import { useNavigate } from "react-router-dom";
import { useSocket } from "./../Contexts/Socket"
import Setting from "./Setting";


function JoinMeet() {
  const socket = useSocket();
  const navigate = useNavigate();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const [meetingId, setMeetingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState(false);
  const [myVideo, setMyVideo] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRemoteAudioEnabled, setIsRemoteAudioEnabled] = useState(true);
  const [showSetting, setShowSetting] = useState(true);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [needTrack,setNeedTrack] = useState(false);
  const [doneTrack,setDoneTrack] = useState(false);


  
  // contexts
  const {adminCon, setAdminCon,cons,audioOutput} = useFriend();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendVideo,
    remoteStream,disconnect,adminConnection,userConnection
  } = usePeer();

 



const getUserData = () => {
  const id = localStorage.getItem('userId');
  const name = localStorage.getItem('userName');
  return { id, name };
};

const storeUserData = (id, name) => {
  localStorage.setItem('userId', id);
  localStorage.setItem('userName', name);
};

const removeUserData = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
};


  const seeMeet = useCallback(() => {
    const mId = searchParams.get("meetingId");
    setMeetingId(mId);
    const {id ,name} = getUserData();
    if(id === mId){
      setAdminCon(name);
    };
    if (adminCon && meetingId) {
      const content = { adminName:adminCon, meetingId:meetingId };
      fetch(`https://facesyncbackend.onrender.com/seeMeet`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      })
        .then((data) => data.json())
        .then((data) => {
          if (data.status === "success") {
         
            setAdmin(data.token);
            setUser(!data.token);
            if(!data.token){
              socket.emit("room:join", { email:"us@gmail.com", room:'1' });
              
            };
if(data.token){
  socket.emit("room:join", { email:"ad@gmail.com", room:'1' });
  storeUserData(meetingId,adminCon);
};

          }
          if (data.status === "fail") {
          }
        })
        .catch((err) => console.log(err));
    }
  }, [searchParams,meetingId,adminCon,setAdminCon,socket]);
  useEffect(() => {
    seeMeet();
  },[seeMeet]);

  const getMyVideo = useCallback(async () => {
    try {
      const video = await navigator.mediaDevices.getUserMedia(cons);
      setMyVideo(video);
      console.log('Video tracks:', video.getVideoTracks());
      console.log('Audio tracks:', video.getAudioTracks());
  
      // Set the video source to the `videoRef`
      if (localVideoRef.current) {
        if(audioOutput !== ""){
          await localVideoRef.current.setSinkId(audioOutput);
        }
        localVideoRef.current.srcObject = video;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, [cons,audioOutput]);


  const handleContinue = () => {
    setShowSetting(false);
    getMyVideo();
    console.log("Constraints:", cons);
    // Proceed with using cons
  };

 

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room && id ${id}`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const offer = await createOffer();
      socket.emit("user:call", { to: remoteSocketId, offer }); // 1st messsge , 4th Message , 8th-> test
  }, [remoteSocketId,socket,createOffer]);


  useEffect(() => {
    const autoClickHandler = async () => {
      try {
        // First Click will be by User [call:user , call:accepted, nego:needed]
        if (user && needTrack && doneTrack && userConnection !== 'connected' ) {
          await handleCallUser();
        }else if(userConnection === 'connected'){
         console.log("User Connected");
        }
      } catch (error) {
        console.error("Error during auto click:", error);
      }
    };
  
    autoClickHandler(); // Call the async function
  }, [handleCallUser, userConnection, needTrack, doneTrack, user]);
  

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      console.log(`Incoming Call`, from, offer);
      const ans = await createAnswer(offer);

      socket.emit("call:accepted", { to: from, ans }); // 2nd message , 5th Message , 9th ->testing
      sendVideo(myVideo);
    },
    [socket,createAnswer,sendVideo,myVideo]
  );



  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      setRemoteAnswer(ans);
      console.log("Call Accepted!");
      setRemoteSocketId(from);
      sendVideo(myVideo);
    },
    [sendVideo,myVideo,setRemoteAnswer]
  );

  
  const handleNegoNeeded = useCallback(async () => {
    const offer = await createOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId }); //3rd Message ,  // 6th Message
  
  }, [remoteSocketId, socket,createOffer]);

  useEffect(() => {
   peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
     peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded,peer]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await createAnswer(offer);
      setRemoteSocketId(from);
      setNeedTrack(true);
      socket.emit("peer:nego:done", { to: from, ans }); // 7th Message
      setDoneTrack(true);

    },
    [socket,createAnswer]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await setRemoteAnswer(ans);
  }, [setRemoteAnswer]);



  const handleDisconnect = useCallback(async ({ from }) => {
    setTimeout(() => {
      disconnect();
      removeUserData();
      navigate("/");
      }, 1000);
   }, []);
  

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on('cut',handleDisconnect);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("cut", handleDisconnect);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
    handleDisconnect
  ]);



// To reset the video stream when constraints change
useEffect(() => {
  if (myVideo && localVideoRef.current) {
    localVideoRef.current.srcObject = myVideo;
  }
}, [myVideo, cons]);


  const getRemoteVideo = useCallback(()=>{
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  },[remoteStream]);

  useEffect(()=>{
    getRemoteVideo();
  },[getRemoteVideo]);

 


   // NavButton Functions..........
   const toggleMic = () => {
    if (myVideo) {
      const audioTrack = myVideo.getAudioTracks()[0];
      audioTrack.enabled = !isMicEnabled;
      setIsMicEnabled(!isMicEnabled);
    }
  };

  const toggleVideo = () => {
    if (myVideo) {
      const videoTrack = myVideo.getVideoTracks()[0];
      videoTrack.enabled = !isVideoEnabled;
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleRemoteAudio = () => {
    if (remoteStream) {
      const audioTrack = remoteStream.getAudioTracks()[0];
      audioTrack.enabled = !isRemoteAudioEnabled;
      setIsRemoteAudioEnabled(!isRemoteAudioEnabled);
    }
  };

  const cutCall = async() => {
   socket.emit("cut", {to:remoteSocketId});
   setTimeout(() => {
   disconnect();
   removeUserData();
   navigate("/");
   }, 1000);
  };


  // JSX Code

  return (
    <React.Fragment>

     {showSetting ? (
        <Setting  onContinue={handleContinue} />
      ):
        
        (<div className="flex justify-center bg-blm  items-center w-svw h-svh">
        <div className="w-svw h-svh bg-blm  flex justify-center items-center sm:w-10/12  md:w-3/5 lg:w-2/5 md:aspect-square">
        <div className="bg-transparent ring-4 ring-blf rounded-lg h-full w-full flex flex-col justify-between overflow-hidden relative px-2 pt-2">
          
            <video
              ref={localVideoRef}
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
                ref={remoteVideoRef}
                autoPlay
                playsInline
                 className="w-full h-full md:aspect-square  ring-2 ring-blt bg-blm rounded-md  object-cover"
              ></video>
            </div>
            <div className="w-full bg-transparent  py-2 flex items-center justify-center">
            <div className="flex justify-between w-full rounded-md ring-2 ring-black items-center px-4 py-2 bg-blm h-fit ">
                <button
                  onClick={toggleMic}
                  className="flex flex-col text-sm items-center justify-center gap-1"
                >
                  <svg
                     className= {!isMicEnabled ?  "size-8 p-1 bg-blf text-blm rounded-full" : "size-8 p-1 text-blt rounded-full" }   
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.40135 12.5C9.63354 12.9014 9.95606 13.244 10.3411 13.5M9.17071 4C9.58254 2.83481 10.6938 2 12 2C13.6569 2 15 3.34315 15 5L15 10.5"
                      stroke={!isMicEnabled ? "#FBFBFC" : "#444752"}
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M6 11C6 14.3137 8.68629 17 12 17C12.4675 17 12.9225 16.9465 13.3592 16.8454M18 11C18 11.854 17.8216 12.6663 17.5 13.4017"
                      stroke={!isMicEnabled ? "#FBFBFC" : "#444752"}
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="12"
                      y1="18"
                      x2="12"
                      y2="20"
                      stroke={!isMicEnabled ? "#FBFBFC" : "#444752"}
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="10"
                      y1="21"
                      x2="14"
                      y2="21"
                      stroke={!isMicEnabled ? "#FBFBFC" : "#444752"}
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="2.4137"
                      y1="2.03821"
                      x2="19.0382"
                      y2="19.5863"
                      stroke={!isMicEnabled ? "#FBFBFC" : "#444752"}
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  <p>Mute</p>
                </button>

                <button
                  onClick={toggleVideo}
                  className="flex flex-col text-sm items-center justify-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className= {!isVideoEnabled ?  "size-8 p-1 bg-blf text-blm rounded-full" : "size-8 p-1 text-blt rounded-full" }   
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
                    />
                  </svg>
                  Stop
                </button>
                <button
                  onClick={toggleRemoteAudio}
                  className="flex flex-col text-sm items-center justify-center gap-1"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className= {!isRemoteAudioEnabled ?  "size-8 p-1 bg-blf text-blm rounded-full" : "size-8 p-1 text-blt rounded-full" }   
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                    />
                  </svg>
                  Silence
                </button>
                 <button className="z-10 w-fit bg-blf text-blm px-6 text-sm font-[400] flex text-center items-center justify-center py-2 rounded-full  ring-1 ring-blt shadow-md shadow-blt h-fit" onClick={userConnection !== 'connected' && !admin ? handleCallUser : cutCall}>{userConnection !== 'connected' && !admin ? "Join" : "Disconnect"}</button>
               

            
              </div>
            </div>
          </div>
          </div>
          </div>
          
        )}
    </React.Fragment>
  );
}
export default JoinMeet;