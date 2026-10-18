# 🗺️ 2D Map Game - Unit Movement

A beginner-friendly 2D map game where you control a unit (blue square) on a 10x10 grid map. You can give directional orders (North, South, East, West) and watch the unit move one step at a time.

## 🎮 Features

- **10x10 Grid Map** - A visual grid-based game board
- **Unit Control** - Move a blue square in four directions
- **Button Controls** - Click directional buttons to move
- **Keyboard Support** - Use arrow keys for quick movement
- **Position Display** - See your current coordinates (X, Y)
- **Boundary Detection** - Can't move off the map
- **Reset Button** - Return to starting position

## 📁 Project Structure

```
map-game/
├── server.js           # Node.js server
├── package.json        # Project info
├── README.md          # This file
└── public/
    └── index.html     # The game (Canvas-based)
```

## 🚀 Quick Start

### 1. Start the Server
```bash
cd map-game
node server.js
```

### 2. Open in Browser
Go to: `http://localhost:3000`

### 3. Play!
- Click the direction buttons, OR
- Use arrow keys on your keyboard

## 🎯 How to Play

1. **See the blue square** in the middle of the 10x10 grid
2. **Click a direction button** (North, South, East, West)
3. **Watch the unit move** one step in that direction
4. **Check your position** displayed below the map
5. **Don't go off the map** - the game prevents illegal moves
6. **Click Reset** to return to the starting position

## 🧠 Understanding the Code

### Game Area - HTML Canvas

```html
<canvas id="gameCanvas" width="600" height="600"></canvas>
```

The canvas is a 600x600 pixel drawing area where we draw:
- Grid lines (light gray)
- The unit (blue square with border)

### The Map

- **Size:** 10x10 tiles
- **Tile size:** 60x60 pixels each
- **Coordinates:** (0-9, 0-9)

### Unit Position

```javascript
let unitX = 5;  // Column (0-9)
let unitY = 5;  // Row (0-9)
```

The unit starts at position (5, 5) - the middle of the map.

### Drawing the Map

```javascript
function drawMap() {
    // Clear canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    // Draw the unit (blue square)
}
```

Every time the unit moves, we:
1. Clear the canvas
2. Draw the grid
3. Draw the unit at its new position

### Movement Logic

```javascript
function moveUnit(direction) {
    if (direction === 'north') {
        unitY--;  // Move up
    } else if (direction === 'south') {
        unitY++;  // Move down
    } else if (direction === 'west') {
        unitX--;  // Move left
    } else if (direction === 'east') {
        unitX++;  // Move right
    }
    
    // Check if still on the map
    if (unitX < 0 || unitX >= 10 || unitY < 0 || unitY >= 10) {
        // Undo the move
    }
}
```

**Key Concepts:**
- **North = Y decreases** (move up on screen = smaller Y value)
- **South = Y increases** (move down on screen = larger Y value)
- **West = X decreases** (move left on screen = smaller X value)
- **East = X increases** (move right on screen = larger X value)

### Keyboard Controls

```javascript
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        moveUnit('north');
    }
    // ... etc for other arrow keys
});
```

## 🎨 Customization Ideas

### 1. Change Map Size
In `index.html`, find:
```javascript
const mapWidth = 10;   // Change to 15, 20, etc.
const mapHeight = 10;
```

### 2. Change Unit Starting Position
```javascript
let unitX = 5;  // Change starting column
let unitY = 5;  // Change starting row
```

### 3. Change Colors
In `index.html`, find:
```javascript
ctx.fillStyle = '#2196f3';  // Unit color (blue)
ctx.fillStyle = '#ddd';      // Grid color
ctx.fillStyle = '#ffffff';   // Background color
```

### 4. Add Multiple Units
Instead of one `unitX, unitY`, create arrays:
```javascript
let units = [
    {x: 2, y: 2, color: '#2196f3'},  // Blue unit
    {x: 8, y: 8, color: '#ff9800'},  // Orange unit
];
```

### 5. Add Obstacles/Barriers
Create a 2D array to mark blocked tiles:
```javascript
let obstacles = [
    [1, 1], [1, 2], [1, 3],  // Blocked positions
];

// Then check if position is blocked before moving
```

## 📊 Key Learning Points

### Coordinate Systems
- **2D grid:** Use X (horizontal) and Y (vertical)
- **Array indexing:** Start from 0, not 1
- **Canvas coordinates:** (0,0) is top-left

### Drawing with Canvas
- `ctx.fillRect()` - Draw filled rectangles
- `ctx.strokeRect()` - Draw rectangle borders
- `ctx.moveTo()` and `lineTo()` - Draw lines

### Game Loop Concepts
- Get input (button click or arrow key)
- Update state (change unit position)
- Render (redraw everything)

### Boundary Checking
Always validate that moves are legal:
```javascript
if (newX < 0 || newX >= mapWidth) {
    // Invalid move
}
```

## 🚀 Next Steps

### Level 1: Modify the Game
- Change map size
- Add multiple units
- Add obstacles
- Change colors and styling

### Level 2: Add Features
- **Score system** - Points for moving?
- **Pathfinding** - Command a unit to go to a specific tile
- **Multiple units** - Control different units
- **Save/Load** - Save position to server

### Level 3: Advanced
- **Enemies** - Add AI-controlled units that move randomly
- **Collision detection** - What happens when units collide?
- **Fog of war** - Only see areas near your unit
- **Multiplayer** - Two players controlling different units

## ❓ Troubleshooting

**Black screen?**
- Make sure the server is running
- Refresh the browser (Ctrl+R)
- Check browser console for errors (F12)

**Unit won't move?**
- Make sure you're clicking the button or using arrow keys
- Check browser console for error messages

**Can't connect to server?**
- Make sure Node.js is installed
- Make sure you're in the correct folder
- Make sure the server is running (check terminal)
- Try a different port if 3000 is in use

---

**Congratulations!** You've created a 2D game with graphics and movement! 🎉

What would you like to add next?
