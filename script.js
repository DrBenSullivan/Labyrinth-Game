// Arrays to store goal-tiles to be reached (ToDo) and goal-tiles reached (Done)
const ToDo = ['sp0', 'sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6', 'sp7', 'sp8'],
      Done = [],
      // Object to store possible moves for each tile
      PossibleMovesByTile = {
          sp0: [['right', 'down'], ['cor0', 'cor2']],
          sp1: [['left', 'right', 'down'], ['cor0', 'cor1', 'cor3']],
          sp2: [['left', 'down'], ['cor1', 'cor4']],
          sp3: [['up', 'right', 'down'], ['cor2', 'cor5', 'cor7']],
          sp4: [['up', 'left', 'right', 'down'], ['cor3', 'cor5', 'cor6', 'cor8']],
          sp5: [['up', 'left', 'down'], ['cor4', 'cor6', 'cor9']],
          sp6: [['up', 'right'], ['cor7', 'cor10']],
          sp7: [['up', 'left', 'right'], ['cor8', 'cor10', 'cor11']],
          sp8: [['up', 'left'], ['cor9', 'cor11']]
      };

// Object to store buttons and methods to disable/enable them
const Buttons = {
    dirUp: document.querySelector("#up"),
    dirLeft: document.querySelector("#left"),
    dirRight: document.querySelector("#right"),
    dirDown: document.querySelector("#down"),
    upDisable: () => { Buttons.dirUp.disabled = true; },
    leftDisable: () => { Buttons.dirLeft.disabled = true; },
    rightDisable: () => { Buttons.dirRight.disabled = true; },
    downDisable: () => { Buttons.dirDown.disabled = true; },
    disableAll: () => { Buttons.upDisable(); Buttons.leftDisable(); Buttons.rightDisable(); Buttons.downDisable(); },
    resetAll: () => { Buttons.dirUp.disabled = false; Buttons.dirLeft.disabled = false; Buttons.dirRight.disabled = false; Buttons.dirDown.disabled = false; }
};

// Function to set event listeners for directional button clicks
const setButtonListeners = () => {
    ['Up', 'Left', 'Right', 'Down'].forEach(direction => {
        if (Buttons[`dir${direction}`]) {
            Buttons[`dir${direction}`].addEventListener("click", () => {
                movePlayer(direction);
                refreshTiles(player.xCartCoord, player.yCartCoord);
            });
        }
    });
};

// Functions for converting pixel coordinates to cartesian coordinates and RNG
const xPxToCart = x => (x - 8) / 64,
      xCartToPx = x => (64 * x) + 8,
      yPxToCart = y => (y - 28) / 64,
      yCartToPx = y => (y * 64) + 28,
      rand = max => Math.floor(Math.random() * max);

// Functions to get player location variables
const getX = () => parseInt(window.getComputedStyle(player).getPropertyValue("left")),
      getY = () => parseInt(window.getComputedStyle(player).getPropertyValue("top")),
      // Function to get tile based on cartesian coordinates
      getTile = cartCoords => {
          const SpacesCoords = ['0,0', '1,0', '2,0', '0,1', '1,1', '2,1', '0,2', '1,2', '2,2'];
          return `sp${SpacesCoords.indexOf(cartCoords)}`;
      };

// Function to update tile styles
const updateOccupiedTile = currentTileId => {
    const currentTile = document.getElementById(currentTileId);
    currentTile.classList.add("occupied");
};

// Function to refresh tiles
const refreshTiles = (x, y) => {
    const previousTileId = player.occupiedTile;
    const previousTile = document.getElementById(previousTileId);
    if (previousTile) {
        previousTile.classList.remove("occupied");
    }
    player.cartCoords = `${x},${y}`;
    player.occupiedTile = getTile(player.cartCoords);
    document.getElementById(player.occupiedTile).classList.add("occupied");
    checkIfGoalTile(player.occupiedTile);
    changeBlockedCorridors(previousTileId);
    refreshButtons(player.occupiedTile);
};

// Functions to convert new cartesian co-ordinates into pixel values and apply them to player token
const changeXCoord = newXCart => {
    const newXPx = xCartToPx(newXCart);
    player.style.left = `${newXPx}px`;
    player.xPxCoord = newXPx;
    player.xCartCoord = newXCart;
};

const changeYCoord = newYCart => {
    const newYPx = yCartToPx(newYCart);
    player.style.top = `${newYPx}px`;
    player.yPxCoord = newYPx;
    player.yCartCoord = newYCart;
};

// Function to change cartesian coordinates depending on direction clicked
const movePlayer = direction => {
    switch (direction) {
        case "Up":
            player.yCartCoord--;
            changeYCoord(player.yCartCoord);
            break;
        case "Left":
            player.xCartCoord--;
            changeXCoord(player.xCartCoord);
            break;
        case "Right":
            player.xCartCoord++;
            changeXCoord(player.xCartCoord);
            break;
        case "Down":
            player.yCartCoord++;
            changeYCoord(player.yCartCoord);
            break;
    }
};

// Function to randomise a goal tile, update its style, remove its Id from ToDo and push it to Done
const generateRandomGoal = () => {
    let goal;
    while (goal === player.occupiedTile || !ToDo.includes(goal)) {
        let randomIndex = rand(ToDo.length);
        goal = ToDo[randomIndex];
    }
    const goalTile = document.getElementById(goal);
    goalTile.classList.add("goal");
};

// Function to check if the current tile is a goal tile, update its style. 
const checkIfGoalTile = currentTile => {
    const goalTile = document.querySelector(".goal").getAttribute("id");
    if (currentTile !== goalTile) {
        return;
    }
    const doneTile = document.getElementById(currentTile);
    doneTile.classList.replace("goal", "done");
    const goalIdIndex = ToDo.indexOf(currentTile);
    Done.push(ToDo.splice(goalIdIndex, 1));
    // Check if all goals reached (game end)
    if (Done.length === 9){
        Buttons.disableAll();
        document.getElementById("victory").style.visibility = "visible";
    } else {
        generateRandomGoal();
    }
};

// Function to block a random corridor adjacent to the previous tile and unblock another
const changeBlockedCorridors = previousTile => {
    // Sort corridors adjacent to the previous tile into blocked and blockable
    const AdjacentCorridors = PossibleMovesByTile[previousTile][1];
    const AllBlockedCorridors = Array.from(document.getElementsByClassName("blocked"), corridor => corridor.getAttribute("id"));
    const AdjacentBlockedCorridors = AdjacentCorridors.filter(corridor => AllBlockedCorridors.includes(corridor));
    const AdjacentBlockableCorridors = AdjacentCorridors.filter(corridor => !AllBlockedCorridors.includes(corridor));

    // If there were adjacent blocked corridors, randomise which will be unblocked
    if (AdjacentBlockedCorridors.length !== 0) {
        let randomIndex = rand(AdjacentBlockedCorridors.length);
        const corridorToUnblock = AdjacentBlockedCorridors[randomIndex];
        document.getElementById(corridorToUnblock).classList.remove("blocked");
    }

    // Randomizse which Blockable tile is blocked
    let randomIndex = rand(AdjacentBlockableCorridors.length);
    const corridorToBlock = AdjacentBlockableCorridors[randomIndex];
    document.getElementById(corridorToBlock).classList.add("blocked");
};

// Disable buttons depending on player location
const refreshButtons = currentTile => {
    Buttons.resetAll();
    const AllBlockedCorridors = Array.from(document.getElementsByClassName("blocked"), corridor => corridor.getAttribute("id"));
    const CurrentPossibleMoves = PossibleMovesByTile[currentTile][0];
    const AdjacentCorridors = PossibleMovesByTile[currentTile][1];
    const Directions = ['up', 'left', 'right', 'down'];

    //Store number of directions disabled in a constant to determine if game lost
    let blockedMoves = 0;
    Directions.forEach(direction => {
        if (!CurrentPossibleMoves.includes(direction)) {
            Buttons[`${direction}Disable`]();
            blockedMoves++;
        }
    });
    AdjacentCorridors.forEach(corridor => {
        if (AllBlockedCorridors.includes(corridor)) {
            const index = AdjacentCorridors.indexOf(corridor);
            const direction = CurrentPossibleMoves[index];
            Buttons[`${direction}Disable`]();
            blockedMoves++;
        }
    });

    //Check game not won already
    if (Done.length === 9) {
        return;
    //If not, loss
    } else if (blockedMoves === 4) {
        document.getElementById("loss").style.visibility = "visible";
    }
};

// Assign player element
const player = document.getElementById("player");

// Player initialisation function
player.start = () => {
    player.xPxCoord = getX();
    player.yPxCoord = getY();
    player.xCartCoord = xPxToCart(player.xPxCoord);
    player.yCartCoord = yPxToCart(player.yPxCoord);
    player.cartCoords = `${player.xCartCoord},${player.yCartCoord}`;
    player.occupiedTile = getTile(player.cartCoords);
    updateOccupiedTile(player.occupiedTile);
};

// Start game on start-button click
document.addEventListener("DOMContentLoaded", () => {
    const startButton = document.getElementById("enter");
    startButton.addEventListener("click", () => {
        const intro = document.getElementById("intro");
        intro.remove();
        player.start();
        generateRandomGoal();
        setButtonListeners();
    });
    // Restart game on button click on outcome panels
    const victoryButton = document.getElementById("reset-win");
    victoryButton.addEventListener("click", () => reset("victory"));
    const deathButton = document.getElementById("reset-loss");
    deathButton.addEventListener("click", () => reset("death"));
});

// Reset function after game ended
const reset = outcome => {
    if (outcome === "victory") {
        document.getElementById("victory").style.visibility = "hidden";
    }
    if (outcome === "death") {
        document.getElementById("loss").style.visibility = "hidden";
    }

    ToDo.length = 0;
    ToDo.push('sp0', 'sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sp6', 'sp7', 'sp8');
    Done.length = 0;
    
    player.xPxCoord = 72;
    player.style.left = `${player.xPxCoord}px`;
    player.xCartCoord = xPxToCart(player.xPxCoord);
    player.yPxCoord = 92;
    player.style.top = `${player.yPxCoord}px`;
    player.yCartCoord = yPxToCart(player.yPxCoord);
    player.cartCoords = `${player.xCartCoord},${player.yCartCoord}`;
    player.occupiedTile = getTile(player.cartCoords);

    for (let i = 0; i <= 8; i++){
        document.getElementById(`sp${i}`).setAttribute("class", "space");
    }
    for (let i = 0; i <= 11; i++){
        document.getElementById(`cor${i}`).setAttribute("class", "corridor");
    }

    updateOccupiedTile(player.occupiedTile);
    generateRandomGoal();
    Buttons.resetAll();
};
