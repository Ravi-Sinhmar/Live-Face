import React, { useEffect, useState, useCallback } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => {
  return React.useContext(PeerContext);
}

function PeerProvider(props) {
  const [remoteStream, setRemoteStream] = useState();
  const [peer, setPeer] = useState(null);
  const [iceConnectionState, setIceConnectionState] = useState('');
  const [connectionState, setConnectionState] = useState('');

  const initializePeer = () => {
    const newPeer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });

    // Log various WebRTC events
    newPeer.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
      } else {
        console.log('All ICE candidates have been sent');
      }
    });

    newPeer.addEventListener('connectionstatechange', () => {
      console.log('Connection state change:', newPeer.connectionState);
      setConnectionState(newPeer.connectionState);
    });

    newPeer.addEventListener('iceconnectionstatechange', () => {
      console.log('ICE connection state change:', newPeer.iceConnectionState);
      setIceConnectionState(newPeer.iceConnectionState);
    });

    newPeer.addEventListener('signalingstatechange', () => {
      console.log('Signaling state change:', newPeer.signalingState);
    });

    newPeer.addEventListener('icegatheringstatechange', () => {
      console.log('ICE gathering state change:', newPeer.iceGatheringState);
    });

    return newPeer;
  };

  useEffect(() => {
    const peer = initializePeer();
    setPeer(peer);
  }, []);

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    console.log("state of web setRemote offer", peer.connectionState);
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setRemoteAnswer = async (answer) => {
    console.log("state of web setRemote answer", peer.connectionState);
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
    if (peer) {
      peer.addEventListener('track', handleSendVideo);
      return () => {
        peer.removeEventListener('track', handleSendVideo);
      };
    }
  }, [peer, handleSendVideo]);

  const disconnect = useCallback(() => {
    if (peer && peer.connectionState !== "closed") {
      peer.close();
      setRemoteStream(null); // Optionally, reset other relevant state variables (setting, cons)
    }
  }, [peer]);

  return (
    <PeerContext.Provider value={{ peer, disconnect, createOffer, createAnswer, setRemoteAnswer, sendVideo, remoteStream, iceConnectionState, connectionState }}>
      {props.children}
    </PeerContext.Provider>
  );
}

export default PeerProvider;
