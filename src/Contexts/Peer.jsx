import React, {  useEffect, useState, useCallback } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => {
  return React.useContext(PeerContext);
}

function PeerProvider(props) {
  const [remoteStream, setRemoteStream] = useState();
  const [ReConnect, setReConnect] = useState(false); // State for reconnection
  
  const initializePeer = () => {
    return new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  };

  const [peer, setPeer] = useState(initializePeer);

  useEffect(() => {
    if (ReConnect) {
      peer.close();
      const newPeer = initializePeer();
      setPeer(newPeer);
      setRemoteStream(null);
      setReConnect(false);
    }
  }, [ReConnect]);

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    console.log("state of web setremote offer", peer.connectionState);
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setRemoteAnswer = async (answer) => {
    console.log("state of web setremote answer", peer.connectionState);
    await peer.setRemoteDescription(answer);
    return true;
  };

  const sendVideo = async (video) => {
    const tracks = video.getTracks();
    for (const track of tracks) {
      peer.addTrack(track, video);
    }
  };

  const handleSendVideo = useCallback(async (event) => {
    const video = await event.streams;
    console.log("GOT TRACKS!!", video[0]);
    setRemoteStream(video[0]);
  }, []);

  useEffect(() => {
    peer.addEventListener('track', handleSendVideo);
    return () => {
      peer.removeEventListener('track', handleSendVideo);
    };
  }, [peer, handleSendVideo]);

  const disconnect = useCallback(() => {
    if (peer.connectionState !== "closed") {
      peer.close();
      setRemoteStream(null);
    }
  }, [peer]);

  return (
    <PeerContext.Provider value={{ peer, disconnect, createOffer, createAnswer, setRemoteAnswer, sendVideo, remoteStream, setReConnect , ReConnect }}>
      {props.children}
    </PeerContext.Provider>
  );
}

export default PeerProvider;
