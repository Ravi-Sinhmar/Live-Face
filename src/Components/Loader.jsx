import React from "react";

function Loader(props) {
  return (

    <div className="w-screen h-svh z-20 gap-4  flex-col bg-black fixed opacity-80 flex justify-center items-center">
      <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <radialGradient
          id="a4"
          cx=".66"
          fx=".66"
          cy=".3125"
          fy=".3125"
          gradientTransform="scale(1.5)"
        >
          <stop offset="0" stop-color="#FFFFFF"></stop>
          <stop offset=".3" stop-color="#FFFFFF" stop-opacity=".9"></stop>
          <stop offset=".6" stop-color="#FFFFFF" stop-opacity=".6"></stop>
          <stop offset=".8" stop-color="#FFFFFF" stop-opacity=".3"></stop>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"></stop>
        </radialGradient>
        <circle
          transform-origin="center"
          fill="none"
          stroke="url(#a4)"
          stroke-width="20"
          stroke-linecap="round"
          stroke-dasharray="200 1000"
          stroke-dashoffset="0"
          cx="100"
          cy="100"
          r="70"
        >
          <animateTransform
            type="rotate"
            attributeName="transform"
            calcMode="spline"
            dur="0.5"
            values="360;0"
            keyTimes="0;1"
            keySplines="0 0 1 1"
            repeatCount="indefinite"
          ></animateTransform>
        </circle>
        <circle
          transform-origin="center"
          fill="none"
          opacity=".2"
          stroke="#FFFFFF"
          stroke-width="20"
          stroke-linecap="round"
          cx="100"
          cy="100"
          r="70"
        ></circle>
      </svg>
     <p className="text-white w-4/5 text-center text-sm  rounded-md px-2 py-1">{props.children}</p>
    </div>
  );
}

export default Loader;
