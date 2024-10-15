/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,ejs,ts,jsx,tsx}"],
    
    theme: {
      extend: {
        fontFamily: {
          pop: ["Poppins"],
          rob: ["Roboto"],
          nut: ["Nunito+Sans"],
        },
        fontWeight: {
          weight: ['100','200',"300", "400", "500", "600", "700", "800", "900"],
        },
        colors:{
  blm:'#FBFBFC',
  blf:'#337ABE',
  blg:'#F3F5F6',
  blt:'#444752',
  blb:'#E4E4E4',
  blh:'#F1F6FB',
  blin:'#DFAD34',
  ble:'#D4260E',
  
  
        },
      },
    },
    plugins: [],
  };
  