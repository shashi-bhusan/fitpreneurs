import React, { useEffect, useState } from 'react';
import { CgProfile } from 'react-icons/cg';
import Dropdown from 'react-bootstrap/Dropdown';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

import Notifications from './Notifications';

const MyNavbar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    if (localStorage.removeItem('token')) {
      localStorage.removeItem('token');
    }
    window.location.href = '/login';
  };

  const [userName, setUserName] = useState('');
  const [role, setRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token'); // assuming you store the token in localStorage
    if (token) {
      const decoded = jwtDecode(token);
      setUserName(decoded.name); // Extract the name from the decoded token
      setRole(decoded.role);
    }
  }, []);

  
  return (
    <>
      <nav className="flex justify-between items-center bg-[#574898] px-6 py-2">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          {/* <a className="font-[600] text-[2rem]">beenaIT</a> */}

          <img src="/Logo.png" alt="Logo" className="h-12" />

          {/* 
        <a className="ml-16">
          <p className="text-[1.8rem] text-black font-[700]">
            Welcome, <span className="text-white font-[400]">{userName} ({role})</span>
          </p>
        </a> */}
        </div>
        <div className="flex items-center justify-evenly gap-4 relative">
          <Notifications/>

          <Dropdown>
            <Dropdown.Toggle
              as="a"
              id="dropdown-basic"
              className="p-0 m-0 flex items-center cursor-pointer text-white"
              style={{ backgroundColor: 'transparent', border: 'none' }}
            >
              <div className="rounded-full overflow-hidden mr-2">
                <img
                  src="/personal-trainer.gif"
                  alt="Description of GIF"
                  className="h-7"
                />
              </div>
              {/* <CgProfile size={30} className="cursor-pointer text-white mr-2 capitalize" /> */}
              <p className="hidden md:block">
                {userName} ({role})
              </p>
            </Dropdown.Toggle>

            <Dropdown.Menu className="bg-[#574898] mt-1">
              <Dropdown.Item
                href="#/action-1"
                className="hover:bg-stone-800 hover:bg-opacity-10 text-white block md:hidden"
                onClick={() => navigate('/')}
              >
                Dashboard
              </Dropdown.Item>
              <Dropdown.Item
                href="#/action-1"
                className="hover:bg-stone-800 hover:bg-opacity-10 text-white"
                onClick={() => navigate('/profile')}
              >
                Profile
              </Dropdown.Item>
              <Dropdown.Item
                href="#/action-2"
                className="hover:bg-stone-800 hover:bg-opacity-10 text-white"
                onClick={handleLogout}
              >
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </nav>
    </>
  );
};

export default MyNavbar;
