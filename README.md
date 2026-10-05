### Pitch Royale
curtislingwall.click

[My Notes](notes.md)

**Pitch Royale is a web-based ear training game where you learn to identify notes and chords. When you start a round, the computer plays a sound, and you click a piano key or chord button on your screen to guess what you just heard. Getting correct answers earns you points, builds a streak, and moves your name up a leaderboard saved to your account. Pop-up feeds will show when other live players hit milestones, and show daily music trivia. Later versions will include both single and multi-player options.**

### Elevator pitch

Imagine you're at a party, relishing in all the glory that comes from being the star of the party. Then, your friend John (who has perfect pitch) walks in. Suddenly, someone in the room taps their finger on the wall. 

"What note was that?" they ask.

"D flat," John replies. 

Now, you are no longer the star of the party, John is.

Want to take it back? Try Pitch Royale.

### Design

![Design image](Sketchup.jpeg)

![Design image](mockupDesign.png)


```mermaid
sequenceDiagram
    actor You
    participant Website
    participant Server
    participant OtherPlayers

    You->>Website: Clicks "Play Sound"
    Website->>You: Plays a note (e.g., D flat)
    You->>Website: Clicks the "Db" key
    Website->>You: Shows green flash (+1 Streak)
    Website->>Server: Sends score update (Streak: 5)
    Server->>Server: Saves new score to Database
    Server-->>OtherPlayers: Broadcasts "You reached a 5-note streak!"
```

### Key features

Piano & Sound Player - Plays a randomized musical note (Play notes from browser), The user interacts by clicking a piano key to guess what note it was.

Stats & Streak Tracking - Tracks current winning streak, highest score, and overall guess accuracy over time. Stored for each user. Secure login over HTTPS.

Leaderboard & Notifications - Shows a ranked list of top players, with pop-ups when someone hits a high streak.

Daily Music Trivia - A fun fact box on the screen that pulls in a music fact or tip from another website each day.

AI Breakdown - An AI Breakdown of a user's progress and tips to improve.

### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - HTML for the piano keys, control buttons, score displays, and navigation in the menu.
- **CSS** - Styles the app with a dark theme, animates key presses, and adjusts the layout to both mobile and computer screens.
- **React** - React for user interaction, game state (current streak, played notes, game mode), and sound playback using browser audio.
- **Service** - Service will handle score submissions, user authentication, and call a free, third-party music API to fetch daily trivia. Link to potential API (https://opentdb.com/api_config.php)
- **DB/Login** - Registers and logs in users, and saves player stats and high scores in MongoDB.
- **WebSocket** - Broadcasts events between players, such as live score updates and pop-up notifications when someone achieves a high streak. 

## 🚀 Specification Deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] I completed the prerequisites for this deliverable (Git commit requirement) - Project work is tracked in Git.
- [x] Proper use of Markdown - Added headings, lists, links, images, and a Mermaid diagram.
- [x] A concise and compelling elevator pitch - Introduced Pitch Royale with a short story.
- [x] Description of key features - Listed the ear-training game, stats, leaderboard, trivia, and AI breakdown.
- [x] Description of how you will use each technology including your 3rd party API and use of WebSocket - Explained planned use of HTML, CSS, React, services, MongoDB, and WebSockets.
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references. - Embedded two design sketches.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] **Rented EC2 server**
- [X] **Leased domain name** 
- [X] **Server accessible** from my domain: [https://yourdomainnamehere.click](https://yourdomainnamehere.click) - Not completed yet.

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits) - Added the project GitHub link and committed the work.
- [X] **HTML pages** - Built the home, game, and leaderboard views.
- [X] **Proper HTML element usage** - Used semantic headers, sections, navigation, forms, tables, and buttons.
- [X] **Links** - Added site navigation, account actions, and the project GitHub link.
- [X] **Text** - Added game instructions, account labels, trivia, and leaderboard content.
- [X] **3rd party API placeholder** - Added a space for the future daily-trivia API response.
- [X] **Images** - Added design sketches and music-themed page imagery.
- [X] **Login placeholder** - Added username and password fields with a login button.
- [X] **DB data placeholder** - Added sample leaderboard and player-stat data.
- [X] **WebSocket placeholder** - Added a sample live-activity feed.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits) - Added the project GitHub link and committed the work.
- [X] **Visually appealing colors and layout. No overflowing elements.** - Created a dark burgundy-and-gold theme with responsive page layouts.
- [X] **Use of a CSS framework** - Imported Bootstrap for layout and components.
- [X] **All visual elements styled using CSS** - Styled the header, navigation, panels, forms, game controls, and tables.
- [X] **Responsive to window resizing using flexbox and/or grid display** - Used Bootstrap's responsive grid plus flexbox and CSS grid.
- [X] **Use of a imported font** - Loaded Great Vibes, Montserrat, and Playfair Display from Google Fonts.
- [X] **Use of different types of selectors including element, class, ID, and pseudo selectors** - Used element, class, ID, hover, and focus selectors.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [X] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits) - Simon deployment still needs confirmation.
- [X] **Bundled using Vite** - Added Vite dev and build scripts.
- [X] **Components** - Split the app into home, play, and scores React components.
- [X] **Router** - Added routes for home, play, scores, and a not-found page.

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I sdid not complete this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.
- [ ] **Supports registration, login, logout, and restricted endpoint** - I did not complete this part of the deliverable.
- [ ] **Uses BCrypt to hash passwords** - I did not complete this part of the deliverable.

## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
