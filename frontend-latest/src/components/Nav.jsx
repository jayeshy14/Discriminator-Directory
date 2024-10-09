import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import dropDownIcon from '../assets/drop-down.png'

function Nav() {
  const [dropdownHidden, setDropdownHidden] = useState(true);
  const toggleDropdown = () => {
    setDropdownHidden(!dropdownHidden);
  };

  return (
    <>
      <div class="fixed z-10 backdrop-blur-sm">
        <section class="relative mx-auto w-screen">

          <nav class="flex justify-between text-white w-screen px-24 md:px-5">
            <div class="xl:px-12 md:px-2 py-6 flex w-full md:justify-between md:items-center">
              <a class="text-3xl font-bold font-heading">
                Ignitus Networks
              </a>
              <ul class="hidden md:flex px-4 mr-20 font-semibold font-heading space-x-7">
                <Link className='no-underline text-gray-200 hover:font-bold' as={Link} to="/">
                  <li>Home</li>   </Link>
                <Link className='no-underline text-gray-200' as={Link} to="/upload">
                  <li>Upload Discriminator</li>   </Link>
                <Link className='no-underline text-gray-200' as={Link} to="/query-discriminators">
                  <li>Query Discriminators</li>   </Link>
                <Link className='no-underline text-gray-200' as={Link} to="/query-instructions">
                  <li>Query Instructions</li>   </Link>
              </ul>
              <div className="flex justify-end ">
                <div class="md:hidden relative">
                  <button
                    id="dropdown-button"
                    class="text-gray-200 focus:outline-none"
                    onClick={toggleDropdown}
                  >
                    <img src={dropDownIcon} alt="Dropdown" class="w-6 h-6 mx-10" />
                  </button>
                  <ul id="dropdown-menu" class={`absolute ${dropdownHidden ? "hidden" : ""} bg-gray-800 text-gray-200 w-40 mt-2 rounded-lg shadow-lg`} onClick={toggleDropdown}>
                    <Link className=' hover:bg-gray-700 no-underline text-gray-200' as={Link} to="/">
                      <li className='pl-2 pb-1 pt-1'>Home</li>   </Link>
                    <Link className=' hover:bg-gray-700 no-underline text-gray-200' as={Link} to="/upload">
                      <li className='pl-2 pb-1'>Upload Discriminator</li>   </Link>
                    <Link className=' hover:bg-gray-700 no-underline text-gray-200' as={Link} to="/query-discriminators">
                      <li className='pl-2 pb-1'>Query Discriminators</li>   </Link>
                    <Link className=' hover:bg-gray-700 no-underline text-gray-200' as={Link} to="/query-instructions">
                      <li className='pl-2 pb-1'>Query Instructions</li>   </Link>
                  </ul>
                </div>
              </div>
            </div>


          </nav>

        </section>
      </div>


    </>
  )
}

export default Nav