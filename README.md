# LevelUp
A web application that allows users to discover video games, share reviews, record play sessions, and manage a personalized game library. 

## ✍️ Authors
Jordan Ellison and Mishell Cardenas Espinosa 

## 🔗 Class Link
CS 5610 Web Development - Northeastern Univeristy 
https://johnguerra.co/classes/webDevelopment_online_spring_2026/

## 🎯 Project Objective
LevelUp is a web application designed to solve common challenges faced by modern gamers, such as managing  backlogs, deciding what to play next, tracking progress across multiple stages of a game, and finding meaningful, trustworthy reviews. 

With digital game libraries growing rapidly and recommendations often scattered across platforms, players frequently struggle to stay organized and make informed decisions. LevelUp centralizes these needs by allowing users to discover video games, share ratings and written reviews, record play sessions, and manage a personalized game library. Core features include organizing games by status (e.g., playing, completed, dropped, backlog), logging hours and session details, and browsing community reviews. By combining discovery, tracking, and community interaction into a single platform, LevelUp transforms fragmented gaming workflows into a streamlined and personalized experience.

LevelUp was built with Node.js, Express, MongoDB, and vanilla JavaScript to offer users a smooth, interactive experience that efficiently manages game data, reviews, and personal library updates in real time.

## 🌐 Deployed Website  
https://levelup-zp2s.onrender.com/index.html

## 📂 Design Document 
https://docs.google.com/document/d/1VkaJHrDlkYFw7t_eqTJhEdR4glzGYyPgvGcKgdL8D34/edit?usp=sharing

## 📊  Presentation Slides 
https://docs.google.com/presentation/d/1UVTaACZoyDrF8beThUPCOn0vRj4dh_NedHy_3n_y7VM/edit?usp=sharing

## How to use LevelUp
### Getting Started
**Sign In**
1. Simply type your desired username

**Browsing Games**
1. On the home page use the search bar to look for specific games
2. View all games and their average ratings on the home page (use "prev"/"next" to move arround the catalog)
4. Click on any game to see detailed information

### Adding Game Reviews
1. After clicking on a game, click on the reviews pill to open the reviews page for that specific game
2. To add a new review hit the "plus" button on the bottom right corner
3. To edit a specific review hit the edit button and change the desired info
4. To delet a review hit the delete button
   
### User Library
1. Click on the "My library" button on the nav bar at the top of the page
2. The games specific to the user will pop up
3. Add a new game to the library by hitting the "plus" button on the bottom right corner
4. Edit the information of a specific game by clicking on it
5. Go to the user's journal for that specific game by hittin the "Open Journal" button after clicking on the respective game
6. Delete a game from the user's library by hitting the delete button

### User Journal
1. Log a current session by filling in the info on the fields provided
2. Save the new entry by hitting the "Add entry" button
3. Check previous entries on the Past Entries section
4. Return to the user's library by hitting the "Back to Library" button on the nav bar at the top

### Logout
1. Logout from LevelUp by hitting the "Logout" button on the nav bar at the top

## 📸 Screenshots
<img width="1495" height="808" alt="Screenshot 2026-02-19 at 22 26 07" src="https://github.com/user-attachments/assets/5a6432d9-802b-4337-8d72-7794a93f9964" />

<img width="1495" height="808" alt="Screenshot 2026-02-19 at 22 22 14" src="https://github.com/user-attachments/assets/e5f00354-5957-45e2-88af-8622e46b3802" />

<img width="1495" height="808" alt="Screenshot 2026-02-19 at 22 23 21" src="https://github.com/user-attachments/assets/0d8c2764-3846-4bf3-beac-bfa29164f21c" />

<img width="1495" height="808" alt="Screenshot 2026-02-19 at 22 23 40" src="https://github.com/user-attachments/assets/a396b883-493a-4084-af3a-595cc5e0f5c2" />

<img width="1495" height="808" alt="Screenshot 2026-02-19 at 22 25 17" src="https://github.com/user-attachments/assets/3de0a7a3-6f11-451f-863c-5d32cc30c4ad" />

<img width="1495" height="808" alt="Screenshot 2026-02-19 at 22 25 28" src="https://github.com/user-attachments/assets/665ceb5a-6cc5-4272-8577-b7fef27ba085" />

<img width="1495" height="808" alt="Screenshot 2026-02-19 at 22 25 56" src="https://github.com/user-attachments/assets/8af2e53d-2eeb-40e4-a503-a5d9f2511c76" />

<img width="1495" height="808" alt="Screenshot 2026-02-19 at 23 24 33" src="https://github.com/user-attachments/assets/ffbf1ab3-f3d8-4208-9db4-d691c11b8b54" />


## 🛠️ Tech Requirements
Backend:
- Node.js
- Express.js
- dotenv

Frontend 
- HTML5
- CSS
- JavaScript (Vanilla)
- Bootstrap

Development 
- Git & GitHub
- EDLint
- Prettier

Deployment
- Render
- MongoDB Atlas

## 💨 Install & Run Locally
1. Clone the repo:

```bash
git clone https://github.com/mishell-cardenas/LevelUp-app.git
cd LevelUp-app
```

2. Install dependencies:
   
In root folder:
```bash
npm install
```

In backend folder:
```bash
cd backend
npm install
```

Additionally, on the backend folder create an .env file with:
```bash
MONGO_URI=your_mongodb_atlas_connection_string
PORT=3000
```

3. Run the server

```bash
cd backend
npm start
```














