import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactPlayer from "react-player";
import { useSearchParams } from "react-router-dom";
import { useFriend } from "./../Contexts/Friend";
import { usePeer } from "./../Contexts/Peer";

function JoinMeet() {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [adminName, setAdminName] = useState(null);
  const [userName, setUserName] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [handShake, setHandShake] = useState(true);
  const [needWebSocket, setNeedWebSocket] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [finalOffer, setFinalOffer] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState(false);
  const [joined, setJoined] = useState(false);
  const [adminSocket, setAdminSocket] = useState(null);
  const [userSocket, setUserSocket] = useState(null);
  const [adminSocketStatus, setAdminSocketStatus] = useState(false);
  const [userSocketStatus, setUserSocketStatus] = useState(false);
  const [myVideo, setMyVideo] = useState(null);
 
  // contexts
  const {adminCon, setAdminCon } = useFriend();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAnswer,
    sendVideo,
    remoteStream,
  } = usePeer();

  const handleInputChange = (event) => {
    let uName = event.target.value;
    setFullName(uName);
    uName = uName.toLowerCase().replace(/\s+/g, "");
    setUserName(uName);
  };


  const seeMeet = useCallback(() => {
    const ad = searchParams.get("adminName");
    const mId = searchParams.get("meetingId");
    setAdminName(ad);
    setAdminCon(ad);
    setMeetingId(mId);
    if (adminName && meetingId) {
      const content = { adminName, meetingId };
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
          }
          if (data.status === "fail") {
          }
        })
        .catch((err) => console.log(err));
    }
  }, [searchParams,setAdminCon,adminName,meetingId]);
  useEffect(() => {
    seeMeet();
  },[seeMeet]);


const startAdminSocket = useCallback(() => {
      if (needWebSocket && admin) {
        const newSocket = new WebSocket(
          `wss://facesyncbackend.onrender.com/?fullMeetId=${adminName}${meetingId}&deviceName=${adminName}`
        );
        setAdminSocket(newSocket);
      }
  }, [needWebSocket, admin, adminName, meetingId]);

  const startUserSocket = useCallback(() => {
    if (needWebSocket && user && joined) {
        const cleanName = userName.toLowerCase().replace(/\s+/g, "");
        const newSocket = new WebSocket(
          `wss://facesyncbackend.onrender.com/?fullMeetId=${cleanName}${meetingId}&deviceName=${userName}`
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
      const video = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
  
      setMyVideo(video);
      console.log('Video tracks:', video.getVideoTracks());
      console.log('Audio tracks:', video.getAudioTracks());
  
      // Set the video source to the `videoRef`
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = video;
      
        

      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }, []);
  useEffect(() => {
    getMyVideo();
  }, [getMyVideo]);


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
 if (data.type === "userOn" || data.type === "askingOffer") {
  const offer = await createOffer();
  setFinalOffer(offer);
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


  adminSocket.send(JSON.stringify({ ...wsMessage,type:"adminOn"}));
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
    // If admin Reset or refresh
    if (data.type === "adminOn") {
    userSocket.send(JSON.stringify({ ...wsMessage,type:"askingOffer"}));
     };

     // If getting offer
     if (data.type === "sendingOffer") {
      const answer = await createAnswer(data.content);
      userSocket.send(JSON.stringify({ ...wsMessage,type:"sendingAnswer", content: answer}));
       };

         // If neg need
     if (data.type === "negNeed") {
      const answer = await createAnswer(data.content)
      userSocket.send(JSON.stringify({ ...wsMessage,type:"negAnswer", content: answer}));
       };
            };

  userSocket.send(JSON.stringify({ ...wsMessage,type:"userOn"}));
  userSocket.addEventListener("message", userMessageListener);
return () => {
  userSocket.removeEventListener("message", userMessageListener);
};
}
  },[adminSocketStatus,userSocketStatus,adminCon,adminSocket,userSocket,userName,joined,fullName,createAnswer,createOffer,setRemoteAnswer]);

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
    if (handShake) {
      sendVideo(myVideo);
    }
  }, [handShake, sendVideo, myVideo]);

  return (
    <React.Fragment>
      {true ? (



        <div className="bg-blf w-screen h-screen flex flex-col justify-between overflow-hidden">
          <video ref={localVideoRef} muted autoPlay playsInline className="absolute right-2 top-2 rounded-md object-cover h-24 w-16"></video>
        <div className="flex flex-col justify-center items-center h-full">
        <video ref={remoteVideoRef} muted autoPlay playsInline className="rounded-md object-cover h-full "></video>
        {user ? (<React.Fragment> <input
                value={userName}
                onChange={handleInputChange}

                placeholder="Your name please"
                className="border border-blt rounded-md py-2 bg-blm"
                type="text"
              />
              <button onClick={()=>{setJoined(true)}} >JOIN</button>
        
            </React.Fragment>
          ) : null}
          
        </div>
        <div className="flex justify-between items-center px-10 py-4 bg-blm rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
</svg>

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
</svg>

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
</svg>


        </div>
        </div>
      ) : null}
      
    </React.Fragment>
  );
}
export default JoinMeet;
