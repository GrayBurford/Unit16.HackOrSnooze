//LEGEND:
// getAndShowStoriesOnStart(), generateStoryMarkup(), putStoriesOnPage()

"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

//Get and show stories when site first loads
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

//A render method to render HTML for an individual Story instance
//- story: an instance of Story
//Returns the markup for the story.
function generateStoryMarkup(story, showDeleteButton = false) {
  console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser); //if user, show stars before story
  return $(`
      <li id="${story.storyId}">
      ${showDeleteButton ? addDeleteButton() : ""}
        ${showStar ? whatKindOfStar(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
  `);
}

//adds delete trash can button before story markup
function addDeleteButton () {
  return `
    <span class="trash-can">
      <i class="fas fa-trash-alt"></i>
    </span>`;
}

//adds 1 of 2 types of stars to story markup
function whatKindOfStar (story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `<span class="star">
            <i class="${starType} fa-star"></i>
          </span>`;
}

//Gets list of stories from server, generates their HTML, and puts on page
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//deletes a story
async function deleteStory (e) {
  console.debug("deleteStory");
  const $closestLi = $(e.target).closest("li");
  const storyId = $closestLi.attr("id");
  await storyList.removeStory(currentUser, storyId)
  // re-generate story list
  await addUserStories();
}
$ownStories.on("click", ".trash-can", deleteStory);

//function to submit a new story
async function submitNewStoryForm (e) {
  console.debug(submitNewStoryForm); //logs this function was called
  e.preventDefault(); //prevent form submit auto-refresh of page

  const title = $('#create-title').val();
  const author = $('#create-author').val();
  const url = $('#create-url').val();
  const user = currentUser.username;
  const storyObject = { title, url, author, user}
  console.log(storyObject);

  //can't call StoryList class PascalCased... must be camelCase?
  const newStory = await storyList.addStory(currentUser, storyObject);
  // const newStory = await new StoryList([]).addStory(currentUser, storyObject);

  $('#create-title').val(''); //empty user inputs
  $('#create-author').val('');
  $('#create-url').val('');

  const $story = generateStoryMarkup(newStory);
  $allStoriesList.prepend($story);

  $submitStoryForm.hide(); //hides form to add new story
}

$submitStoryForm.on("submit", submitNewStoryForm);

//puts User's own stories on page under My Stories
function addUserStories() {
  console.debug("addUserStories");
  $ownStories.empty();
  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h5>You don't have any stories yet!</h5>");
  } else {
    for (let each of currentUser.ownStories) {
      let $story = generateStoryMarkup(each, true);
      $ownStories.append($story);
    }
  }
  // for (let each of currentUser.ownStories) {
  //   let $story = generateStoryMarkup(each, true);
  //   $ownStories.append($story);
  // }
  $ownStories.show();
}

//puts User's favorites on page under Favorites
function addUserFavoriteToPage () {
  console.debug("addUserFavoriteToPage");
  $userFavoritedStories.empty();
  if (currentUser.favorites.length === 0) {
    $userFavoritedStories.append("<h5>You haven't favorited any stories!</h5>");
  } else {
    for (let each of currentUser.favorites) {
      const $story = generateStoryMarkup(each);
      $userFavoritedStories.append($story);
    }
  }
  // for (let each of currentUser.favorites) {
  //   const $story = generateStoryMarkup(each);
  //   $userFavoritedStories.append($story);
  // }
  $userFavoritedStories.show();
}

//handle favorite/unfavorite star click on a story
async function handleStarClick (e) {
  console.debug("handleStarClick");
  const $target = $(e.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  //check if story is already a fav by checking presence of star
  if ($target.hasClass("fas")) { 
    //means it is a fav; now remove from fav list and change star
    await currentUser.deleteFavorite(story);
    $target.closest("i").toggleClass("fas far");
  } else {
    //story is not a favorite, so add instead of remove
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("fas far");
  }
}

$allThreeStoriesList.on("click", ".star", handleStarClick);