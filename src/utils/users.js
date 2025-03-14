const users = [];

//adduser
const addUser = ({ id, username, room }) => {
  if (!room || !username) {
    return {
      error: "username and room are required!",
    };
  }
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: "Username already in use!",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

//remove user
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index != -1) {
    const user = users.splice(index, 1)[0];
    return user;
  }
};

//getuser
const getUser = (id) => {
  console.log(users);
  return users.filter((user) => {
    if (user.id === id) {
      return user;
    }
  })[0];
};

//get users in room
const getUsersInRoom = (room) => {
  return users.filter((user) => {
    if (user.room === room) {
      return user;
    }
  });
};

export { addUser, removeUser, getUser, getUsersInRoom };
