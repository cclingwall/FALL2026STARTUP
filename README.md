### Pitch Royale

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
- **Service** - Service will handle score submissions, user authentication, and call a free, third-party music API to fetch daily trivia.
- **DB/Login** - Registers and logs in users, and saves player stats and high scores in MongoDB.
- **WebSocket** - Broadcasts events between players, such as live score updates and pop-up notifications when someone achieves a high streak. Link to potential API (https://opentdb.com/api_config.php)

## 🚀 Specification Deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [x] I completed the prerequisites for this deliverable (Git commit requirement)
- [x] Proper use of Markdown
- [x] A concise and compelling elevator pitch
- [x] Description of key features
- [x] Description of how you will use each technology including your 3rd party API and use of WebSocket
- [x] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Rented EC2 server** - I did not complete this part of the deliverable.
- [ ] **Leased domain name** - I did not complete this part of the deliverable.
- [ ] **Server accessible** from my domain: [https://yourdomainnamehere.click](https://yourdomainnamehere.click) - I did not complete this part of the deliverable.

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **HTML pages** - I did not complete this part of the deliverable.
- [ ] **Proper HTML element usage** - I did not complete this part of the deliverable.
- [ ] **Links** - I did not complete this part of the deliverable.
- [ ] **Text** - I did not complete this part of the deliverable.
- [ ] **3rd party API placeholder** - I did not complete this part of the deliverable.
- [ ] **Images** - I did not complete this part of the deliverable.
- [ ] **Login placeholder** - I did not complete this part of the deliverable.
- [ ] **DB data placeholder** - I did not complete this part of the deliverable.
- [ ] **WebSocket placeholder** - I did not complete this part of the deliverable.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Visually appealing colors and layout. No overflowing elements.** - I did not complete this part of the deliverable.
- [ ] **Use of a CSS framework** - I did not complete this part of the deliverable.
- [ ] **All visual elements styled using CSS** - I did not complete this part of the deliverable.
- [ ] **Responsive to window resizing using flexbox and/or grid display** - I did not complete this part of the deliverable.
- [ ] **Use of a imported font** - I did not complete this part of the deliverable.
- [ ] **Use of different types of selectors including element, class, ID, and pseudo selectors** - I did not complete this part of the deliverable.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Bundled using Vite** - I did not complete this part of the deliverable.
- [ ] **Components** - I did not complete this part of the deliverable.
- [ ] **Router** - I did not complete this part of the deliverable.

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I did not complete this part of the deliverable.

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
