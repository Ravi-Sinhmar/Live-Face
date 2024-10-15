import React, { useState, useCallback } from "react";
import { useFriend } from "./../Contexts/Friend";
import Loader from "./Loader";
import { useNavigate } from 'react-router-dom';
import { RandomString } from "../JavaScriptFun/RandomString";
function StartMeet() {
 const [isClick, setIsClick] = useState(false);
 const [adminName, setAdminName] = useState('');
 const [isLoading,setIsLoading] = useState(false);

 const navigate = useNavigate();
 const {setAdminCon } = useFriend();


// click on start instant meeting
const startMeet = useCallback(()=>{
  console.log("StartMeet Click");
  setIsClick(true);
},[]);

const handleInputChange = (event) => {
  setAdminName(event.target.value);
  setAdminCon(event.target.value);
};

const saveMeet = useCallback(()=>{
  setIsLoading(true);
  console.log("saveMeetCallback");
  const meetId = RandomString(6);
    console.log("fetch request sent",adminName,meetId);
    const content = {adminName:adminName,meetingId:meetId}
    fetch(`https://facesyncbackend.onrender.com/saveMeet`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content)
    }).then(data=>data.json()).then((data)=>{
      setIsLoading(false);
if(data.status === 'success'){
  const cleanName = adminName.toLowerCase().replace(/\s+/g, "");
  navigate(`/meeting/?adminName=${cleanName}&meetingId=${meetId}`)}
    }).catch(err=>console.log(err));
},[adminName,navigate]);
  return (
    <React.Fragment>
{ isLoading ? <Loader className="bg-blf">It might take 2 minutes on first time load , so please have paticence</Loader> : null}

    <div className=" font-rob flex flex-col h-svh w-full items-center justify-center gap-4 pb-9">
      <div className="flex flex-col  items-center gap-4">
        <img
          className="w-40 aspect-square "
          src="/images/welcome.png"
          alt="Welcome"
        />
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl font-[500] text-blf">Face Sync</h1>
          <p className="text-gray-500 font-[400] text-center w-10/12">{!isClick ? "Connect, Laugh, and Create moments. Anytime, Anywhere with Love😚":"Enter name, Generate link, Share Link with friend and roast him/her😎"}</p>
        </div>
      </div>
     
      {!isClick && (
        <button onClick={startMeet} className="bg-blf text-white rounded-full py-2 w-4/5 font-[500] text-lg mt-6">Start Instant Meeting</button>
      )}
        
       {isClick && (
        <div className="w-full flex flex-col justify-center items-center gap-4 pb-10 ">
         <input value={adminName}
         onChange={handleInputChange} className=" border-[1px] border-blf w-4/5 py-2 px-3 bg-gray-100 rounded-full mt-8" placeholder="Your name please" type="text" />
        <button onClick={saveMeet} className="bg-blf text-white rounded-full py-2 w-4/5 font-[500] text-lg">Generate Link</button>
        </div>
      )}
    </div>
    </React.Fragment>
  );
}
export default StartMeet;

 
   