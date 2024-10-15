import React from "react";
import { useFriend } from "./../Contexts/Friend";
function UserInput() {

   // contexts
   const {setUserName,setFullName ,fullName,setLive,setJoined} = useFriend();

  const handleInputChange = (event) => {
    let uName = event.target.value;
    setFullName(uName);
    uName = uName.toLowerCase().replace(/\s+/g, "");
    setUserName(uName);
  };

  return (
    <div className="w-svw h-svh flex items-center justify-center">
      <div className="flex flex-col w-full   md:w-1/4  h-full bg-blt py-5  pb-12 px-2 justify-between items-center gap-4">
          <label>Your name</label>
          <input
            value={fullName}
            onChange={handleInputChange}
            className=" border-[1px] border-blf w-4/5 py-2 px-3 bg-gray-100 rounded-full mt-8"
            placeholder="Your name please"
            type="text"
          />
          <button
            className="bg-blf text-white rounded-full py-2 w-4/5 font-[500] text-lg mt-6"
            onClick={() => {
              setJoined(true);
              setLive(true);
            }}
          >
            JOIN
          </button>
        
      </div>
    </div>
  );
}

export default UserInput;
