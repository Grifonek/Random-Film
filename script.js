import config from "./config.js";

const main = document.querySelector(".main");
const randomMovieBtn = document.querySelector(".main-generate");
const movies = document.querySelector(".movies");
const moviesContainer = document.querySelector(".movies-container");
const moreSpecs = document.querySelector(".main-specifications");
const specs = document.querySelector(".specs");
const genresField = document.querySelector(".select-field");
const generateOneMovie = document.querySelector(".left-btn");
const generateThreeMovies = document.querySelector(".right-btn");
const ratingField = document.querySelector("#rating");

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": config.API_KEY,
    "X-RapidAPI-Host": config.API_HOST,
  },
};

let randomFilm;

const fetchMovies = async () => {
  const limit = 50;
  let totalMovies = [];
  let allGenres = [];

  try {
    while (totalMovies.length < 250) {
      const url = `https://moviesdatabase.p.rapidapi.com/titles/random?list=top_rated_english_250&limit=${limit}`;

      const response = await fetch(url, options);
      const data = await response.json();

      // Check if the response contains results
      if (data.results && data.results.length > 0) {
        totalMovies = totalMovies.concat(data.results);
      } else {
        console.log("No more movies to fetch.");
        break;
      }
    }

    const moviesNameArray = totalMovies.map((e) => e.titleText.text);

    const randomNum = Math.floor(Math.random() * moviesNameArray.length);
    randomFilm = moviesNameArray[randomNum];

    // delete this function because i can use url with base_info above and display it instantly
    const renderGenreAndImg = async () => {
      try {
        const url = `https://moviesdatabase.p.rapidapi.com/titles?info=base_info&year=${totalMovies[randomNum].releaseYear.year}&list=top_rated_english_250`;
        const response = await fetch(url, options);
        const data = await response.json();

        const matchedMovie = data.results.find(
          (result) => result.id === totalMovies[randomNum].id
        );
        if (matchedMovie) {
          allGenres = matchedMovie.genres.genres.map((genre) => genre.text);

          const html = `
          <article class="movie" style="background-image: url('${
            matchedMovie.primaryImage.url
          }')">
            <div class="movie-data">
              <h3 class="movie-name">${randomFilm}</h3>
              <p class="movie-genre">🎬${allGenres.join(", ")}</p>
              <p class="movie-rating">🌍 Rating: ${
                matchedMovie.ratingsSummary.aggregateRating !== "null"
                  ? matchedMovie.ratingsSummary.aggregateRating
                  : "No rating available"
              }</p>
            </div>
          </article>
        `;
          moviesContainer.insertAdjacentHTML("afterbegin", html);
        } else {
          console.log("No matching movie found in data.results.");
        }
      } catch (error) {
        console.error(error);
      }
    };
    renderGenreAndImg();
  } catch (error) {
    console.error(error);
  }
};

let movieFetchingInProgress = false; // Initialize flag variable for randomMovieBtn button

randomMovieBtn.addEventListener("click", async () => {
  // Check if movie fetching process is already in progress
  if (movieFetchingInProgress) {
    return; // Exit early if movie fetching is already in progress
  }

  // Set the flag variable to true to indicate that movie fetching is in progress
  movieFetchingInProgress = true;

  try {
    // Fetch movies and display them
    await fetchMovies();

    // Hide the main section and display the movies section
    main.style.display = "none";
    movies.style.display = "";
  } catch (error) {
    console.error("An error occurred during movie fetching:", error);
  } finally {
    // Reset the flag variable after the movie fetching process is complete
    movieFetchingInProgress = false;
  }
});

// randomMovieBtn.addEventListener("click", async () => {
//   await fetchMovies();

//   main.style.display = "none";
//   movies.style.display = "";
// });

const selectingGenres = async () => {
  const url = `https://moviesdatabase.p.rapidapi.com/titles/utils/genres`;
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    const genresArray = [...data.results].slice(1);

    genresArray.forEach((e) =>
      genresField.insertAdjacentHTML(
        "beforeend",
        `<option value="${e}">${e}</option>`
      )
    );
  } catch (error) {
    console.error(error);
  }
};

moreSpecs.addEventListener("click", () => {
  selectingGenres();
  main.style.display = "none";
  specs.style.display = "";
});

const lowestRatedMovies = async () => {
  const selectedGenre = genresField.value;

  let limit = 10;
  let moviesArr = [];
  let allGenres = [];
  let url;

  try {
    if (selectedGenre !== "none") {
      url = `https://moviesdatabase.p.rapidapi.com/titles/random?list=top_rated_lowest_100&info=base_info&limit=${limit}&genre=${selectedGenre}`;
    } else {
      url = `https://moviesdatabase.p.rapidapi.com/titles/random?list=top_rated_lowest_100&info=base_info&limit=${limit}`;
    }

    while (limit <= 100) {
      // Set the desired number of API calls
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        moviesArr = moviesArr.concat(data.results);
        limit += 10;
      } else {
        console.log("No more movies to fetch.");
        break;
      }
    }

    const randomNum = Math.floor(Math.random() * moviesArr.length);
    let randomFilmLowest = moviesArr[randomNum];

    allGenres = randomFilmLowest.genres.genres.map((genre) => genre.text);

    const render = async () => {
      specs.style.display = "none";
      movies.style.display = "";

      const html = `
      <article class="movie" style="background-image: url('${
        randomFilmLowest.primaryImage.url
      }')">
        <div class="movie-data">
          <h3 class="movie-name">${randomFilmLowest.titleText.text}</h3>
          <p class="movie-genre">🎬${allGenres.join(", ")}</p>
          <p class="movie-rating">🌍 Rating: ${
            randomFilmLowest.ratingsSummary.aggregateRating !== "null"
              ? randomFilmLowest.ratingsSummary.aggregateRating
              : "No rating available"
          }</p>
        </div>
      </article>
    `;
      moviesContainer.insertAdjacentHTML("afterbegin", html);
    };
    render();

    director(randomFilmLowest.id);
  } catch (error) {
    alert("Film with these specification do not exist. 🤷‍♂️");
    console.error(error);
  }
};

const highestRatedMovies = async () => {
  const selectedGenre = genresField.value;

  let limit = 50;
  let moviesArr = [];
  let allGenres = [];
  let url;

  try {
    if (selectedGenre !== "none") {
      url = `https://moviesdatabase.p.rapidapi.com/titles/random?list=top_rated_english_250&info=base_info&limit=${limit}&genre=${selectedGenre}`;
    } else {
      url = `https://moviesdatabase.p.rapidapi.com/titles/random?list=top_rated_english_250&info=base_info&limit=${limit}`;
    }

    while (limit <= 250) {
      const response = await fetch(url, options);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        moviesArr = moviesArr.concat(data.results);
        limit += 50;
      } else {
        console.log("No more movies to fetch.");
        break;
      }
    }

    const randomNum = Math.floor(Math.random() * moviesArr.length);
    const randomFilmHighest = moviesArr[randomNum];

    allGenres = randomFilmHighest.genres.genres.map((genre) => genre.text);

    const render = async () => {
      specs.style.display = "none";
      movies.style.display = "";

      const html = `
      <article class="movie" style="background-image: url('${
        randomFilmHighest.primaryImage.url
      }')">
        <div class="movie-data">
          <h3 class="movie-name">${randomFilmHighest.titleText.text}</h3>
          <p class="movie-genre">🎬${allGenres.join(", ")}</p>
          <p class="movie-rating">🌍 Rating: ${
            randomFilmHighest.ratingsSummary.aggregateRating !== "null"
              ? randomFilmHighest.ratingsSummary.aggregateRating
              : "No rating available"
          }</p>
        </div>
      </article>
    `;
      moviesContainer.insertAdjacentHTML("afterbegin", html);
    };
    render();

    director(randomFilmHighest.id);
  } catch (error) {
    alert("Film with these specification do not exist. 🤷‍♂️");
    console.error(error);
  }
};

let movieGenerationInProgress = false; // Initialize flag variable

generateOneMovie.addEventListener("click", async () => {
  // Check if movie generation process is already in progress
  if (movieGenerationInProgress) {
    return; // Exit early if movie generation is already in progress
  }

  // Set the flag variable to true to indicate that movie generation is in progress
  movieGenerationInProgress = true;

  // Disable the button to prevent multiple clicks
  generateOneMovie.disabled = true;

  try {
    if (ratingField.value === "lowest") {
      await lowestRatedMovies();
    } else if (ratingField.value === "highest") {
      await highestRatedMovies();
    }
  } catch (error) {
    console.error("An error occurred during movie generation:", error);
  } finally {
    // Reset the flag variable and re-enable the button after the movie generation process is complete
    movieGenerationInProgress = false;
    generateOneMovie.disabled = false;
  }
});

let movieGenerationInProgressThree = false; // Initialize flag variable for generateThreeMovies button

generateThreeMovies.addEventListener("click", async () => {
  // Check if movie generation process is already in progress
  if (movieGenerationInProgressThree) {
    return; // Exit early if movie generation is already in progress
  }

  // Set the flag variable to true to indicate that movie generation is in progress
  movieGenerationInProgressThree = true;

  // Disable the button to prevent multiple clicks
  generateThreeMovies.disabled = true;

  try {
    // Generate three movies based on the selected rating
    if (ratingField.value === "lowest") {
      await lowestRatedMovies();
      await lowestRatedMovies();
      await lowestRatedMovies();
    } else if (ratingField.value === "highest") {
      await highestRatedMovies();
      await highestRatedMovies();
      await highestRatedMovies();
    }
  } catch (error) {
    console.error("An error occurred during movie generation:", error);
  } finally {
    // Reset the flag variable and re-enable the button after the movie generation process is complete
    movieGenerationInProgressThree = false;
    generateThreeMovies.disabled = false;
  }
});

// generateOneMovie.addEventListener("click", () => {
//   if (ratingField.value === "lowest") {
//     lowestRatedMovies();
//   } else if (ratingField.value === "highest") {
//     highestRatedMovies();
//   }
// });

// generateThreeMovies.addEventListener("click", () => {
//   if (ratingField.value === "lowest") {
//     lowestRatedMovies();
//     lowestRatedMovies();
//     lowestRatedMovies();
//   } else if (ratingField.value === "highest") {
//     highestRatedMovies();
//     highestRatedMovies();
//     highestRatedMovies();
//   }
// });

const director = async (id) => {
  const url = `https://moviesdatabase.p.rapidapi.com/titles/${id}?info=creators_directors_writers`;

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    // console.log(data);
  } catch (error) {
    console.error(error);
  }
};
