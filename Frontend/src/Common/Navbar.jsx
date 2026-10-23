import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext';

const Navbar = () => {
  const {user,isAuthenticated} = useAuth();
  return (
    <header>
   <div className="logo">budget Tracker </div>
   <nav>
    <div>
      <Link className='link' to='/' >dashboard</Link></div>
    <div>
      <Link  className='link' to='/budget'>budget</Link></div>
    <div>
      <Link className='link' to='/create-budget'>create budget</Link>
      </div>
   </nav>
    <div className = "auth">
      {isAuthenticated?(
        <>
        welcome back,{user?.userName}
       <Link className="link" to="/sign-out">
        Signout
        </Link>
        </>
      ):(
        <>
        {" "}
        <div> <Link className='link' to='/signin'>SignIn</Link></div>
        <div> <Link className='link' to='/signup'>SignUp</Link></div>
</>
      )}
    </div>
   </header>
  ) 
}

export default Navbar