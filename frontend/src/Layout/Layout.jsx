import React from 'react';
import SideBar from './Components/SideBar';
import MyNavbar from './Components/MyNavbar';

const Layout = ({ Maincontent }) => {
  return (
    <div className="flex flex-col min-h-screen bg-stone-800">
      <div className=''>
        <MyNavbar />
      </div>
      
      <div className="flex flex-1">
        <div className='hidden md:block'>
           <SideBar/>
        </div>
       
        <div className="flex-1 border-l-4 border-l-stone-700 bg-cover bg-center bg-stone-800" style={{ backgroundImage: 'url("bg-whole.png")'}}>
          
          <div className='backdrop-blur-sm h-full'>
            <Maincontent />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Layout;
