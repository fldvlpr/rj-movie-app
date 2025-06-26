import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovieList, setTrendingMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchTrendingMovies = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const endpoint = `${API_BASE_URL}/trending/movie/day?language=en-US`;
      const response = await fetch(endpoint, API_OPTIONS);

      console.log(`log1: ${response.ok}`);
      if (!response.ok) {
        throw new Error("Failed to fetch trending movies.");
      }

      const data = await response.json();
      console.log(`log2: ${data}`);
      if (data.response === "False") {
        console.error(`Error fetching trending movies: ${error}`);
        setTrendingMovieList([]);
        return;
      }

      console.log(`log3: ${data.results}`);
      setTrendingMovieList(data.results || []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovies = async (query = "") => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      console.log(`log1: ${response.ok}`);
      if (!response.ok) {
        throw new Error("Failed to fetch movies.");
      }

      const data = await response.json();
      console.log(`log2: ${data}`);
      if (data.response === "False") {
        setErrorMessage("Failed to fetch movies.");
        setMovieList([]);
        return;
      }

      console.log(`log3: ${data.results}`);
      setMovieList(data.results || []);
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies, please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without The Hassle.
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovieList.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul className="flex overflow-x-auto gap-4 py-4">
              {trendingMovieList.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={movie.title}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
