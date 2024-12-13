import React, { useMemo, useEffect, useState, useCallback } from "react";
const PeerContext = React.createContext(null);
export const usePeer = () => {
  return React.useContext(PeerContext);
};
// final

function PeerProvider(props) {
  const [remoteStream, setRemoteStream] = useState();
  const [adminConnection, setAdminConnection] = useState(null);
  const [userConnection, setUserConnection] = useState(null);

  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      }),
    []
  );

  // create offer
  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return peer.localDescription;
  };

  const createAnswer = async (offer) => {
    setAdminConnection(peer.connectionState);
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return peer.localDescription;
  };

  const setRemoteAnswer = async (answer) => {
    setUserConnection(peer.connectionState);
    await peer.setRemoteDescription(answer);
    return true;
  };

// sending Video
const sendVideo = async (video) => {
  if (!video) {  return; }
  const tracks = await video.getTracks();
  const senders = peer.getSenders();

  for (const track of tracks) {
    const senderExists = senders.some(sender => sender.track && sender.track.id === track.id);

    if (!senderExists) {
      peer.addTrack(track, video);
    }
  }
};


  const handleSendVideo = useCallback(async (event) => {
    const video = await event.streams[0];
    console.log("GOT TRACKS!!", video[0]);
    setRemoteStream(video);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleSendVideo);
    return () => {
      peer.removeEventListener("track", handleSendVideo);
    };
  }, [peer, handleSendVideo, userConnection, adminConnection]);

  // close connection
  const disconnect = useCallback(() => {
    if (peer.connectionState !== "closed") {
      peer.close();
      setRemoteStream(null); // Optionally, reset other relevant state variables (setting, cons)
    }
  }, [peer]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        disconnect,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        sendVideo,
        remoteStream,
        adminConnection,
        userConnection,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
}

export default PeerProvider;
