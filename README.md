# OnTrack (Web App)

_Owner: Jillian Sands (jesands21@gmail.com)_

## Motivation

Even as a lifelong Maryland resident, the D.C. metro can be daunting to navigate! This project aims to facilitate the process of riding the WMATA metro by creating a web app with [their APIs](https://developer.wmata.com/docs/services/).

## Usage

- The site is deployed at [ontrack-tkib.onrender.com](https://ontrack-tkib.onrender.com/). You may experience a long loading period on the initial render, as the backend is deployed separately.
- The app can be pulled down and ran locally with the following process:
  - The first time you run the project, run `npm install` in both the root of the project and the `/app` directory
  - To run both the frontend and backend concurrently, simply run `npm start` from the route of the project and view the website at http://localhost:3000
  - To run only the backend, run `npm run server` and view at http://localhost:4444
  - To run only the frontend, run `npm run client` and view at http://localhost:3000

## Tech Stack

This project originally utilized JavaScript, CSS, MongoDB, Node.js, and Express. Later, I added React to complete the MERN stack and refactored most of the Javascript files to Typescript.

## Future Iterations

- Implement mobile styles
- Integrate Google Maps API to find closest metro station to users, rather than manual entry
- Integrate the WMATA "Trip Planner" endpoints to allow users another way to plan their metro ride
- Find a way to fetch the most current map to visualize modifications to metro routes during construction (currently, this has to be manually updated)
