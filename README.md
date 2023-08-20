# OnTrack (Web App)

_Owner: Jillian Sands (jesands21@gmail.com)_

## Motivation

Even as a lifelong Maryland resident, the D.C. metro can be daunting to navigate! This projects aims to facilitate the process of riding the WMATA metro by creating a web app with their APIs.

## Usage

- This app can be pulled down and ran locally with the following process:
  - The first time you run the project, run `npm install`
  - To run both the frontend and backend concurrently, simply run `npm start` from the route of the project and view the website at http://localhost:3000
  - To run only the backend, run `npm run server` and view at http://localhost:4444
  - To run only the frontend, run `npm run client` and view at http://localhost:3000
- Alternatively, the site is deployed at [https://ontrack-3p50.onrender.com/](https://ontrack-3p50.onrender.com/)

## Tech Stack

This project originally utilized JavaScript, CSS, MongoDB, Node.js, and Express. Later, I added React to complete the MERN stack and refactored most of the Javascript files to Typescript.

## Resources

- Source API: [https://developer.wmata.com/docs/services/](https://developer.wmata.com/docs/services/)

## Future Iterations

- Implement mobile styles
- Integrate Google Maps API to find closest metro station to users, rather than manual entry
- Integrating the WMATA "Trip Planner" endpoints to allow users another way to plan their metro ride
- Finding a way to fetch the most current map of the metro routes to visualize the modifications to the routes during construction (currently, this has to be manually updated)
