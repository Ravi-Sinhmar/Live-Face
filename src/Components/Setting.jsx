import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFriend } from "../Contexts/Friend";
import Loader from "./Loader";

function Setting({ onContinue }) {
  const audioInputEl = useRef(null);
  const audioOutputEl = useRef(null);
  const videoInputEl = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setCons, setAudioOutput } = useFriend();
  const getStream = useCallback(async () => {
    try {
      const permission = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (permission) {
        setIsLoading(true);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);
  useEffect(() => {
    getStream();
  }, [getStream]);
  const getDevices = useCallback(async () => {
    if (isLoading) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (devices) {
          setIsLoading(false);
        }
        setCons({ video: true, audio: true });
        console.log(devices);
        devices.forEach((d) => {
          const option = document.createElement("option"); //create the option tag
          option.value = d.deviceId;
          option.text = d.label;
          //add the option tag we just created to the right select
          if (d.kind === "audioinput") {
            audioInputEl.current.appendChild(option);
          } else if (d.kind === "audiooutput") {
            audioOutputEl.current.appendChild(option);
          } else if (d.kind === "videoinput") {
            videoInputEl.current.appendChild(option);
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  }, [setCons, isLoading]);
  useEffect(() => {
    getDevices();
  }, [getDevices]);
  const changeAudioInput = async (e) => {
    //changed audio input!!!
    const deviceId = e.target.value;
    console.log("changed audio input");
    const newConstraints = {
      audio: { deviceId: { exact: deviceId } },
      video: true,
    };
    setCons(newConstraints);
  };
  const changeAudioOutput = async (e) => {
    console.log(e.target.value);
    await setAudioOutput(e.target.value);
    console.log("Changed audio device!");
  };

  const changeVideo = async (e) => {
    //changed video input!!!
    const deviceId = e.target.value;
    console.log("changed Vid input");

    const newConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };
    setCons(newConstraints);
  };

  return (
    <React.Fragment>
      {isLoading ? (
        <Loader className="bg-blf">
          It might take 2 minutes on first time load , so please have paticence
        </Loader>
      ) : null}
      <div className="flex  justify-center bg-blm  items-center w-svw h-svh">
        <div className="w-svw h-svh bg-blm  px-4 flex flex-col  justify-around items-center sm:w-10/12  md:w-3/5 lg:w-2/5 md:aspect-square">
          <div className="flex flex-col items-center w-full gap-8">
            <button
              onClick={onContinue}
              className="flex  items-center w-full  rounded-md  "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="h-8 w-8 text-blm  p-2 font-[500] bg-blf  rounded-full"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
                />
              </svg>
            </button>
            <div className="flex flex-col gap-3 w-full justify-between ">
              <label className=" font-[500] text-blf">Audio Input(Mic)</label>
              <select
                onChange={changeAudioInput}
                ref={audioInputEl}
                className=" text-blt px-2  ring-1 ring-gray-500 bg-blg rounded-md w-full text-sm  py-3 "
                id="audio-input"
              ></select>
            </div>
            {/* Sound Output */}
            <div className="flex flex-col gap-3 w-full justify-between ">
              <label className="text-blf font-[500] ">
                Sound Output(Speaker)
              </label>
              <select
                onChange={changeAudioOutput}
                ref={audioOutputEl}
                className=" text-blt px-2  ring-1 ring-gray-500 bg-blg rounded-md w-full text-sm  py-3 "
                id="audio-input"
              ></select>
            </div>

            {/* Camera Type */}
            <div className="flex flex-col gap-3 w-full justify-between ">
              <label className="text-blf font-[500]">Camera Type</label>
              <select
                onChange={changeVideo}
                ref={videoInputEl}
                className=" text-blt px-2  ring-1 ring-gray-500 bg-blg rounded-md w-full text-sm  py-3 "
                id="audio-input"
              ></select>
            </div>
          </div>
          <button
            onClick={onContinue}
            className="bg-blf text-blm shadow-sm shadow-black w-full py-2 rounded-full text-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Setting;
