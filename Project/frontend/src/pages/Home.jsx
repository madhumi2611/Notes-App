import React, { useEffect, useState } from 'react';
import NotesList from '../components/NotesList';
import api from '../api';
import "../styles/Home.css";

const Home = () => {
  const [username, setUsername] = useState(null);
  //changed for firebase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/user/profile/");
        setUsername(res.data.username);
      } catch (error) {
        console.error("No username returned:", error.response || error);
      }
    };
    fetchProfile();
  }, []);
  
  return (
    <div>
      <h1>Welcome, {username ? username : 'Loading...'}</h1>
      <div>
      <NotesList />
    </div>
    </div>

  );
};

export default Home;
