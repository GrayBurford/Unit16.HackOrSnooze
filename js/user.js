//LEGEND:
//login(), signup(), logout(), checkForRememberedUser(), saveUserCredentialsInLocalStorage(), updateUIOnUserLogin()

"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

//User login/signup/login
//Handle login form submission. If login ok, sets up the user instance
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab username and password from user input
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

//Handle signup form submission
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

//Handle click of logout button: remove  credentials from localStorage and refresh
function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

//Storing/recalling previously-logged-in-user with localStorage
//If there are user credentials in local storage, use those to log in
//that user. This is meant to be called on page load, just once.
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

//Sync current user info to localStorage
//We store  username/token in localStorage so when the page is refreshed
//(or the user revisits the site later), they will still be logged in.
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

//General UI stuff about users
//When a user signs up or registers, we want to set up the UI for them:
// - show the stories list
// - update nav bar options for logged-in user
// - generate the user profile part of the page
function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");
  hidePageComponents();
  putStoriesOnPage(); //re-display stories (so that "favorite" stars appear)
  $allStoriesList.show();
  updateNavOnLogin();
  generateUserProfile();
}

function generateUserProfile () {
  console.debug("generateUserProfile");
  $("#profile-name").text(currentUser.name);
  $("#profile-username").text(currentUser.username);
  $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
}

// {
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkdyYXlCdXJmb3JkIiwiaWF0IjoxNjQ0MjcwMTEwfQ.vx8rGlMhej2BQ8nDRhuRbj4atUhrAkpdEw4QykW6mD0",
//   "user": {
//       "createdAt": "2022-01-28T19:16:35.908Z",
//       "favorites": [
//           {
//               "author": "Elie Schoppik",
//               "createdAt": "2022-02-07T00:00:48.422Z",
//               "storyId": "95703cf6-e901-4f21-8458-7243dfd53e72",
//               "title": "Google!",
//               "updatedAt": "2022-02-07T00:00:48.422Z",
//               "url": "https://www.google.com",
//               "username": "ji"
//           }
//       ],
//       "name": "Gray",
//       "stories": [],
//       "updatedAt": "2022-02-07T00:40:50.071Z",
//       "username": "GrayBurford"
//   }
// }

// {
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkdyYXlDYWx2aW4iLCJpYXQiOjE2NDM4NDYwODB9.tb6e29pVFe_gLKbJhsTSdVXrFFTfdlCWWJSw2JXM7gg",
//   "user": {
//       "createdAt": "2022-02-02T23:54:40.122Z",
//       "favorites": [],
//       "name": "Gray-Calvin",
//       "stories": [],
//       "updatedAt": "2022-02-02T23:54:40.122Z",
//       "username": "GrayCalvin"
//   }
// }