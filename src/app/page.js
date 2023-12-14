"use client"

import { Card, CardContent, CardMedia, CircularProgress, Grid, Paper, TextField, Typography } from '@mui/material'
import styles from './page.module.css'
import { Fragment, useEffect, useState } from 'react'
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Home() {

  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  function updateUsers(data) {
    setUsers(data);
  }

  function handleUserNameChange(event) {
    const value = event.target.value;
    setUserName(value);
  }

  function handleLoading(data) {
    setLoading(data)
  }

  return (
    <main className={styles.main}>
      <Header updateUsers={updateUsers} handleUserNameChange={handleUserNameChange} userName={userName} loading={loading} handleLoading={handleLoading} />
      <Body users={users} userName={userName} loading={loading} />
    </main>
  )
}


function SearchBar(props) {
  const { updateUsers, handleUserNameChange, userName, loading, handleLoading } = props;

  useEffect(() => {
    const fetchUserData = async () => {
      if (userName.trim() === '') {
        updateUsers([]);
        return;
      }
      try {
        handleLoading(true);
        const response = await axios.get(`https://api.github.com/search/users?q=${userName}&sort=followers&per_page=5`);
        const users = response.data.items;
        let detailedUsersData = []

        if (users.length > 0) {
          detailedUsersData = await Promise.all(
            users.map(async (user) => {
              const userDetails = await axios.get(`https://api.github.com/users/${user.login}`);
              return userDetails.data;
            })
          );
        }

        updateUsers(detailedUsersData);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          text: "Something went wrong, please try again."
        })
        console.error('Error fetching data:', error);
      } finally {
        handleLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchUserData, 1000);

    return () => clearTimeout(timeoutId);
  }, [userName]);

  return <Grid container direction={'row'} >
    <TextField
      fullWidth id="users-search-bar"
      name="userName"
      value={userName}
      onChange={handleUserNameChange}
      variant="outlined"
      placeholder="Start typing user name here..."
      focused
      InputProps={{
        classes: {
          notchedOutline: styles['red-outline'],
          focused: styles['red-focused'],
        },
        endAdornment: (
          <Fragment>
            {loading && <CircularProgress color='secondary' size={20} />}
          </Fragment>
        ),
      }}
    />

  </Grid>
}

function Header(props) {
  const { updateUsers, handleUserNameChange, userName, loading, handleLoading } = props;

  return <div className={styles.fullWidth}  >

    <Typography variant='h3' align='center' color="#ef3e3a" marginBottom={'40px'} >Teleparty Users Search</Typography>
    <SearchBar updateUsers={updateUsers} handleUserNameChange={handleUserNameChange} userName={userName} handleLoading={handleLoading} loading={loading} />
  </div >
}

function Body(props) {
  const { users, userName, loading } = props;
  return <Grid container direction={'row'} justifyContent={'space-evenly'} marginTop={"40px"} >
    {
      Array.isArray(users) && users.length > 0 ?
        users.map((user, index) => {
          return <UserCard key={index} user={user} />
        }) : <ShowMessage usersCount={users.length} userName={userName} loading={loading} />
    }
  </Grid>
}

function UserCard(props) {
  const { user } = props;

  return <Card key={user.id} style={{ margin: '10px', width: '200px' }}>
    <CardMedia
      component="img"
      height="140"
      image={user.avatar_url}
      alt={user.login}
    />
    <CardContent>
      <Typography variant="h6" component="div">
        {user.login}
      </Typography>
      <Typography color="textSecondary">
        Followers: {user.followers}
      </Typography>
      <a href={user.html_url} target="_blank" rel="noopener noreferrer">
        View Profile
      </a>
    </CardContent>
  </Card>
}

function ShowMessage(props) {
  const { usersCount, userName, loading } = props;
  console.log(usersCount, userName)
  return (
    (!loading && usersCount === 0 && userName.trim() !== '') ?
      <Typography >No user found!!</Typography> :
      <Fragment />
  )
}