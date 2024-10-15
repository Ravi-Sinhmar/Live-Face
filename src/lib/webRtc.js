

const peer = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.stunprotocol.org" }
    ]
  });

  export  default peer;