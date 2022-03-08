//LEGEND:
// navAllStories(), navLoginClick(), updateNavOnLogin()

"use strict";

//Handling navbar clicks and updating navbar
//Show main list of all stories when click site name
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

//Show login/signup on click on "login"
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

//When a user first logins in, update the navbar to reflect that.
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

//function to show story submit form
function submitStory (e) {
  console.debug("submitStory", e); //why write this?
  hidePageComponents();
  $allStoriesList.show();
  //or, $loginForm.hide(); $signupForm.hide();
  $submitStoryForm.show();
}

$body.on("click", "#nav-submit", submitStory);

//function when you click My Stories
function clickMyStories (e) {
  console.debug("clickMyStories", e);
  hidePageComponents();
  addUserStories();
  $ownStories.show();
}
// $body.on("click", "#user-own-stories", clickMyStories);
$body.on("click", "#nav-my-stories", clickMyStories);

//function when you click Favorites
function clickFavorites (e) {
  console.debug("clickFavorites", e);
  hidePageComponents();
  addUserFavoriteToPage();
}
// $body.on("click", "#user-story-favorites", clickFavorites);
$body.on("click", "#nav-favorites", clickFavorites);

//function when you click Profile
function clickProfile (e) {
  console.debug("clickProfile", e);
  hidePageComponents();
  $userProfile.show();
}
$navUserProfile.on("click", clickProfile);

function updateNavOnLogin () {
  console.debug("updateNavOnLogin");
  $(".nav-left").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}