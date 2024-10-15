import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactPlayer from "react-player";
import { useSearchParams } from "react-router-dom";
import { useFriend } from "./../Contexts/Friend";
import { usePeer } from "./../Contexts/Peer";
import { useNavigate } from "react-router-dom";
import Connecting from "./Connecting";

function JoinMeet() {
  const navigate = useNavigate();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [adminName, setAdminName] = useState(null);
  const [userName, setUserName] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [needWebSocket, setNeedWebSocket] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState(false);
  const [joined, setJoined] = useState(false);
  const [adminSocket, setAdminSocket] = useState(null);
  const [userSocket, setUserSocket] = useState(null);
  const [adminSocketStatus, setAdminSocketStatus] = useState(false);
  const [userSocketStatus, setUserSocketStatus] = useState(false);
  const [myVideo, setMyVideo] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRemoteAudioEnabled, setIsRemoteAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState("on");
  const [callStatus2, setCallStatus2] = useState(true);
  const [showSetting, setShowSetting] = useState(true);

  
  // contexts
  const {adminCon, setAdminCon,cons,audioOutput,setting,setSetting} = useFriend();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendVideo,
    remoteStream,disconnect
  } = usePeer();

  const handleContinue = () => {
    setSetting(true);
    setShowSetting(false);
    console.log("Constraints:", cons);
    // Proceed with using cons
  };



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




  const handleUserJoin = useCallback(() => {
    let tries = 0;  // Initialize your tries counter here
    console.log(tries)
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
    const loopWithDelay = async () => {
      while (tries < 4) {
        let uName = "A";
        setFullName(uName);
        uName = uName.toLowerCase().replace(/\s+/g, "");
        setUserName(uName);
        tries++;  // Increment tries
        await delay(500);  // Wait for 500ms
      }
      setJoined(true);
    };
  
    loopWithDelay();  // Start the loop
  }, []);

  


  const seeMeet = useCallback(() => {
    const ad = searchParams.get("adminName");
    const mId = searchParams.get("meetingId");
    setAdminName(ad);
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
            setNeedWebSocket(true);
            setAdmin(data.token);
            setUser(!data.token);

if(data.token){
  storeUserData(meetingId,adminCon);
};

          }
          if (data.status === "fail") {
          }
        })
        .catch((err) => console.log(err));
    }
  }, [searchParams,meetingId,adminCon,setAdminCon]);
  useEffect(() => {
    seeMeet();
  },[seeMeet]);


const startAdminSocket = useCallback(() => {
      if (needWebSocket && admin) {
        const newSocket = new WebSocket(
          `wss://facesyncbackend.onrender.com/?fullMeetId=${meetingId}__.ad`
        );
        setAdminSocket(newSocket);
      }
  }, [needWebSocket, admin, meetingId]);

  const startUserSocket = useCallback(() => {
    if (needWebSocket && user && joined) {
        const cleanName = userName.toLowerCase().replace(/\s+/g, "");
        const newSocket = new WebSocket(
          `wss://facesyncbackend.onrender.com/?fullMeetId=${meetingId}__.us`
        );
        setUserSocket(newSocket);
    }
  }, [needWebSocket, meetingId, userName, user,joined]);

  useEffect(() => {
    startUserSocket();
  }, [startUserSocket]);

  useEffect(() => {
    startAdminSocket();
  }, [startAdminSocket]);

  const handleAdminSocketStatus = () => {
    setAdminSocketStatus(true);
  };

  const handleUserSocketStatus = () => {
    setUserSocketStatus(true);
  };
  
  useEffect(() => {
    if (adminSocket !== null) {
      adminSocket.addEventListener("open", handleAdminSocketStatus);
    }
    if (userSocket !== null) {
      userSocket.addEventListener("open", handleUserSocketStatus);
    }
    return () => {
      if (adminSocket !== null) {
        adminSocket.removeEventListener("open", handleAdminSocketStatus);
      } else {
        return;
      }
      if (userSocket !== null) {
        userSocket.removeEventListener("open", handleUserSocketStatus);
      } else {
        return;
      }
    };
  }, [adminSocket, userSocket]);



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


  useEffect(() => {
    if(setting){
      getMyVideo();
    }
  }, [getMyVideo,setting]);


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

  useEffect(()=>{
if(adminSocketStatus){
  const wsMessage = {
    admin:true,
    cleanUserName: adminCon,
    fullUserName:"updateMe",
    cleanFriendName : "updateMe",
    fullFiendName:"updateMe",
  };
  const adminMessageListener =async (event)=>{
    const data = JSON.parse(event.data);
    // if Someone Reset or Refresh or Firsttime going on link

    if(callStatus === "off"){
  adminSocket.send(JSON.stringify({ ...wsMessage,type:"off",content: null}));
  adminSocket.close();
  removeUserData();
  navigate("/");
    };
    if(data.type === "off"){
      disconnect();
      setCallStatus2(false);
  adminSocket.close();
  removeUserData();
      navigate("/");
    }


 if (data.type === "userOn" || data.type === "askingOffer") {
  const offer = await createOffer();
  adminSocket.send(JSON.stringify({ ...wsMessage,type:"sendingOffer",content: offer}));
 };
//  Getting Anser
 if (data.type === "sendingAnswer") {
  await setRemoteAnswer(data.content);
 };

 //  neg Anser
 if (data.type === "negAnswer") {
  await setRemoteAnswer(data.content);
};
      };
      if(setting){
        adminSocket.send(JSON.stringify({ ...wsMessage,type:"adminOn"}));
      }
   // Listening for messages 
   adminSocket.addEventListener("message", adminMessageListener);
  return () => {
    adminSocket.removeEventListener("message", adminMessageListener);
  };

};

if(userSocketStatus && joined){
  const wsMessage = {
    admin:false,
    cleanUserName: userName,
    fullUserName:fullName,
    cleanFriendName :adminCon,
    fullFiendName:"updateMe",
  };
  const userMessageListener = async(event)=>{
    const data = JSON.parse(event.data);

    if(callStatus === "off"){
      userSocket.send(JSON.stringify({ ...wsMessage,type:"off",content: null}));
      userSocket.close();
      removeUserData();

      navigate("/");
        };
        if(data.type === "off"){
          disconnect();
          userSocket.close();
          removeUserData();
          navigate("/");
        }
    // If admin Reset or refresh
    if (data.type === "adminOn") {
    userSocket.send(JSON.stringify({ ...wsMessage,type:"askingOffer"}));
     };

     // If getting offer
     if (data.type === "sendingOffer") {
      alert("got sendingOffer");
      const answer = await createAnswer(data.content);
      userSocket.send(JSON.stringify({ ...wsMessage,type:"sendingAnswer", content: answer}));
       };

         // If neg need
      if (data.type === "negNeed") {
      const answer = await createAnswer(data.content)
      userSocket.send(JSON.stringify({ ...wsMessage,type:"negAnswer", content: answer}));
       };
            };
if(!joined || setting){
  userSocket.send(JSON.stringify({ ...wsMessage,type:"userOn"}));
}
  userSocket.addEventListener("message", userMessageListener);
return () => {
  userSocket.removeEventListener("message", userMessageListener);
};
}
  },[adminSocketStatus,userSocketStatus,adminCon,adminSocket,userSocket,userName,joined,fullName,createAnswer,createOffer,setRemoteAnswer,disconnect,callStatus,navigate,setting]);

  const handleNeg = useCallback(async () => {
    console.log("nego need");
    const wsMessage = {
      admin:true,
      cleanUserName: adminCon,
      fullUserName:"updateMe",
      cleanFriendName : "updateMe",
      fullFiendName:"updateMe",
    };
    const offer = await createOffer();
    adminSocket.send(JSON.stringify({ ...wsMessage,type:"negNeed",content: offer}));
  }, [adminCon,adminSocket,createOffer]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNeg);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNeg);
    };
  }, [handleNeg, peer]);

 useEffect(() => {
   if(myVideo && setting){
   sendVideo(myVideo);
   }
  }, [sendVideo, myVideo,setting]);



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
   setCallStatus("off");
   setCallStatus2(false);
   setTimeout(() => {
   disconnect();
   removeUserData();
   navigate("/");
   }, 1000);
  };

  useEffect(() => {
    if (!callStatus2 && myVideo) {
      // Stop all media tracks
      myVideo.getTracks().forEach(track => track.stop());
      // Clear the video source
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    }
  }, [callStatus2, myVideo]);

  const handleMore = useCallback(async () => {
    window.location.reload();
    setJoined(false);
  }, []);

  // JSX Code

  return (
    <React.Fragment>
     {showSetting ? (
        <Connecting  onContinue={handleContinue} />
      ):
        (<div className="w-svw h-svh bg-blm  flex justify-center items-center">
          <div className="bg-transparent ring-2 ring-black rounded-lg h-full w-full md:w-1/2 md:aspect-square  flex flex-col justify-between overflow-hidden relative px-2 pt-2">
            <video
              ref={localVideoRef}
              muted
              autoPlay
              playsInline
              className="absolute right-3 top-3 rounded-md  object-cover h-24 w-16 ring-1 ring-black"
            ></video>
            <div className=" flex flex-col justify-center items-center h-full">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full  ring-2 ring-black bg-blm rounded-md  object-cover  "
              ></video>
            </div>
            <div className="w-full bg-transparent  py-2 flex items-center justify-center">
              <div className="flex justify-between w-full rounded-md ring-2 ring-black items-center px-4 py-2 bg-blm h-fit ">
                <button
                  onClick={toggleMic}
                  className="flex flex-col text-sm items-center justify-center gap-1"
                >
                  <svg
                    className="size-8 p-1 rounded-full"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.40135 12.5C9.63354 12.9014 9.95606 13.244 10.3411 13.5M9.17071 4C9.58254 2.83481 10.6938 2 12 2C13.6569 2 15 3.34315 15 5L15 10.5"
                      stroke="#333333"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M6 11C6 14.3137 8.68629 17 12 17C12.4675 17 12.9225 16.9465 13.3592 16.8454M18 11C18 11.854 17.8216 12.6663 17.5 13.4017"
                      stroke="#333333"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="12"
                      y1="18"
                      x2="12"
                      y2="20"
                      stroke="#333333"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="10"
                      y1="21"
                      x2="14"
                      y2="21"
                      stroke="#333333"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="2.4137"
                      y1="2.03821"
                      x2="19.0382"
                      y2="19.5863"
                      stroke="#333333"
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
                    className="size-8 p-1 rounded-full"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
                    />
                  </svg>
                  Stop
                </button>
                {user || admin ? <button className="z-20 w-fit px-6 text-sm font-[400] flex text-center items-center justify-center py-2 rounded-full bg-blm ring-1 ring-blt shadow-md shadow-blt h-fit" onClick={!joined && !admin ? handleUserJoin : cutCall}>{!joined && user ? "Join" : "Disconnect"}</button> : null } 
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
                    className="size-8 p-1 rounded-full"
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
                  onClick={handleMore}
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
          </div>)}
    </React.Fragment>
  );
}
export default JoinMeet;
