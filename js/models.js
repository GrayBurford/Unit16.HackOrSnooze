//LEGEND:
//Class Story: getHostName
//Class StoryList: getStories, addStory
//Class User: signup, login, loginViaStoredCredentials

"use strict"; //indicates code should be executed in "strict mode" which doesn't let you use undeclared variables.
const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

//Story: a single story in the system
class Story {
  //Make instance of Story from data object about story: {title, author, url, username, storyId, createdAt}
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  //Parses hostname out of URL and returns it
  getHostName() {
    return new URL(this.url).host;
  }
}

//List of Story instances: used by UI to show story lists in DOM
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  // Generate a new StoryList. It:
  // - calls the API
  // - builds an array of Story instances
  // - makes a single StoryList instance out of that
  // - returns the StoryList instance
  static async getStories() {
    //`static` indicates getStories is not an instance method. It's a method called on the class directly. Why doesn't it make sense for getStories to be an instance method?
    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    }); // Diff syntax: const response = await axios.get(`${BASE_URL}/stories`)

    // turn plain old story objects from API into instances of Story class
    // console.log(response.data.stories);
    const stories = response.data.stories.map(story => new Story(story));
    // console.log(stories);

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  // Adds story data to API, makes a Story instance, adds it to story list.
  // - user - the current instance of User who will post the story
  // - obj of {title, author, url}
  // Returns the new Story instance
  // test this using: let newStory = await storyList.addStory(currentUser,
  // {title: "Test", author: "Me", url: "http://meow.com"});
  // newStory instanceof Story; //should be true
    async addStory( user, { title, author, url } ) {
    const token = user.loginToken;
    const response = await axios({
      method: 'post',
      url: `${BASE_URL}/stories`,
      data: { 
        token, 
        story: { 
          title, author, url 
        } 
      }
    });
    // {
    //   "token": "YOUR_TOKEN_HERE",
    //   "story": {
    //     "author": "Matt Lane",
    //     "title": "The best story ever",
    //     "url": "http://google.com"
    //   }
    // }
    const usersNewStory = new Story(response.data.story);
    this.stories.unshift(usersNewStory);
    user.ownStories.unshift(usersNewStory);
    // console.log(usersNewStory);
    return usersNewStory;
  }

  //Delete story from API and remove from story list
  //user: current User instance; storyId: ID of story to remove
  async removeStory (user, storyId) {
    const token = user.loginToken;
    await axios({
      url : `${BASE_URL}/stories/${storyId}`,
      method : "DELETE",
      data : { token : user.loginToken}
    });
    //filter out story whose ID to remove
    this.stories = this.stories.filter(s => s.storyId !== storyId);
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
    user.favorites = user.favorites.filter(s => s.storyId !== storyId);
  }
}

// User: a user in the system (only used to represent the current user)
class User {
  // Make user instance from obj of user data and a token:
  // - {username, name, createdAt, favorites[], ownStories[]}
  // - token
  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  // Register new user in API, make User instance & return it:
  // - username: a new username; password: a new password; name: user's full name
  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  // Login user with API, make User instance & return it
  // - username: existing user's username; password: existing user's password
  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  // When we already have user credentials (token & username), we can log them in automatically. This function does that.
  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavorite (story) {
    this.favorites.push(story);
    await this.addOrDeleteFavorite("add", story);
  }

  async deleteFavorite(story) {
    this.favorites = this.favorites.filter(s => s.storyId !== story.storyId);
    await this.addOrDeleteFavorite("remove", story);
  }

  async addOrDeleteFavorite (newState, story) {
    const method = newState === "add" ? "POST" : "DELETE";
    const token = this.loginToken;
    await axios({
      url : `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method : method,
      data : { token }
    });
  }

  isFavorite (story) {
    return this.favorites.some(s => (s.storyId === story.storyId));
  }

}
