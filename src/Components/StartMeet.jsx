import React, { useState, useCallback, useRef } from "react";
import { useFriend } from "../Contexts/Friend";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
import { RandomString } from "../JavaScriptFun/RandomString";
function StartMeet() {
  const [isClick, setIsClick] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLink, setIsLink] = useState(null);
  const [smallLink, setSmallLink] = useState(null);

  const navigate = useNavigate();
  const { setAdminCon } = useFriend();
  const linkRef = useRef(null);

  // click on start instant meeting
  const startMeet = useCallback(() => {
    console.log("StartMeet Click");
    setIsClick(true);
  }, []);

  const handleInputChange = (event) => {
    setAdminName(event.target.value);
    setAdminCon(event.target.value.toLowerCase().replace(/\s+/g, ""));
  };

  const saveMeet = useCallback(() => {
    setIsLoading(true);
    console.log("saveMeetCallback");
    const meetId = RandomString(6);
    console.log("fetch request sent", adminName, meetId);
    const content = { adminName: adminName, meetingId: meetId };
    fetch(`https://facesyncbackend.onrender.com/saveMeet`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    })
      .then((data) => data.json())
      .then((data) => {
        setIsLoading(false);
        if (data.status === "success") {
          const cleanName = adminName.toLowerCase().replace(/\s+/g, "");
          setSmallLink(`/meeting?adminName=${cleanName}&meetingId=${meetId}`);
          setIsLink(
            `https://live-face.vercel.app/meeting?adminName=${cleanName}&meetingId=${meetId}`
          );
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [adminName]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(linkRef.current.value);
      navigate(smallLink); // Replace with your actual route
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <React.Fragment>
      {isLoading ? (
        <Loader className="bg-blf">
          It might take 2 minutes on first time load , so please have paticence
        </Loader>
      ) : null}

      <div className=" font-rob flex flex-col h-svh w-full items-center justify-center gap-2 pb-9">
        <div className="flex flex-col  items-center gap-4">
          <img
            className="w-40 aspect-square "
            src="/images/welcome.png"
            alt="Welcome"
          />
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-3xl font-[500] text-blf">Face Sync</h1>
            <p className="text-gray-500 font-[400] text-center w-10/12">
              {!isClick
                ? "Connect, Laugh, and Create moments. Anytime, Anywhere with Love😚"
                : isLink
                ? "Copy and Share the link with your friend :"
                : "Enter name, Generate link, Share Link with friend and roast him/her😎"}
            </p>
          </div>
        </div>

        {!isClick && (
          <button
            onClick={startMeet}
            className="bg-blf text-white rounded-full py-2 w-4/5 font-[500] text-lg mt-6"
          >
            Start Instant Meeting
          </button>
        )}

        {isLink !== null ? (
          <div className="px-2 py-1 rounded-lg gap-2  flex flex-col items-center justify-center ">
            <h3 className="text-lg text-blm px-2 rounded-md font-[500]">
              Copy & Share
            </h3>
            <div className="flex items-center justify-center gap-2">
              <input
                className="bg-blm w-11/12 px-2 py-2 text-sm rounded-md ring-1 "
                ref={linkRef}
                type="text"
                value={isLink}
                readOnly
                style={{
                  marginRight: "10px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
              <button
                className="bg-blf  px-4 py-2 text-sm rounded-md text-blm"
                onClick={copyToClipboard}
              >
                Copy
              </button>
            </div>
          </div>
        ) : null}

        {isClick && !isLink ? (
          <div className="w-full flex flex-col justify-center items-center gap-4 pb-10 ">
            <input
              value={adminName}
              onChange={handleInputChange}
              className=" border-[1px] border-blf w-4/5 py-2 px-3 bg-gray-100 rounded-full mt-8"
              placeholder="Your name please"
              type="text"
            />
            <button
              onClick={saveMeet}
              className="bg-blf text-white rounded-full py-2 w-4/5 font-[500] text-lg"
            >
              Generate Link
            </button>
          </div>
        ) : null}
      </div>
    </React.Fragment>
  );
}
export default StartMeet;
