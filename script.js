// Assign buttons to constants.
const upButton = document.getElementById("up"),
      downButton = document.getElementById("down"),
      leftButton = document.getElementById("left"),
      rightButton = document.getElementById("right");

// Event listener for button clicks
document.addEventListener("DOMContentLoaded", () => {
    upButton.addEventListener("click", () => {
        goUp();
        refreshTiles(player.xCartCoord, player.yCartCoord);
    });
    downButton.addEventListener("click", () => {
        goDown();
        refreshTiles(player.xCartCoord, player.yCartCoord);
    });
    leftButton.addEventListener("click", () => {
        goLeft();
        refreshTiles(player.xCartCoord, player.yCartCoord);
    });
    rightButton.addEventListener("click", () => {
        goRight();
        refreshTiles(player.xCartCoord, player.yCartCoord);
    });
});

// Constants for converting pixel coordinates to cartesian coordinates
const xPxToCart = (x) => (x - 8) / 64,
      xCartToPx = (x) => (64 * x) + 8,
      yPxToCart = (y) => (y - 28) / 64,
      yCartToPx = (y) => (y * 64) + 28;

// Functions to obtain coordinates
const getFirstX = () => parseInt(window.getComputedStyle(player).getPropertyValue("left")),
      getFirstY = () => parseInt(window.getComputedStyle(player).getPropertyValue("top")),
      getX = () => parseInt(window.getComputedStyle(player).getPropertyValue("left")),
      getY = () => parseInt(window.getComputedStyle(player).getPropertyValue("top")),
      getCoords = (x, y) => `${xPxToCart(x)},${yPxToCart(y)}`,
      getTile = (cartCoords) => {
          const SpacesCoords = ['0,0', '1,0', '2,0', '0,1', '1,1', '2,1', '0,2', '1,2', '2,2'];
          const index = SpacesCoords.indexOf(cartCoords);
          return `sp${index}`;
      };

// Function to update tiles
const updateTiles = (inputId) => {
    const Tiles = document.getElementsByClassName("occupied");
    if (Tiles.length>0) {
        Tiles[0].classList.remove("occupied");
    }
    const currentTile = document.getElementById(inputId);
    currentTile.classList.add("occupied");
    player.occupiedTile = currentTile;
};

// Function to refresh tiles and set button states
const refreshTiles = (x, y) => {
    setButtons(x, y);
    const coords = `${x},${y}`;
    player.cartCoords = coords;
    const tileId = getTile(coords);
    updateTiles(tileId);
};

// Function to set button states based on player position
const setButtons = (x, y) => {
    leftButton.disabled = x === 0;
    rightButton.disabled = x === 2;
    upButton.disabled = y === 0;
    downButton.disabled = y === 2;
};

// Movement functions
const changeXCoord = (newXCart) => {
    let newXPx = xCartToPx(newXCart);
    player.style.left = `${newXPx}px`;
    player.xPxCoord = newXPx;
    player.xCartCoord = newXCart;
};

const changeYCoord = (newYCart) => {
    let newYPx = yCartToPx(newYCart);
    player.style.top = `${newYPx}px`;
    player.yPxCoord = newYPx;
    player.yCartCoord = newYCart;
};

const goUp = () => {
    const newYCoord = player.yCartCoord - 1;
    changeYCoord(newYCoord);
};

const goDown = () => {
    const newYCoord = player.yCartCoord + 1;
    changeYCoord(newYCoord);
};

const goLeft = () => {
    const newXCoord = player.xCartCoord - 1;
    changeXCoord(newXCoord);
};

const goRight = () => {
    const newXCoord = player.xCartCoord + 1;
    changeXCoord(newXCoord);
};

// Assign player element.
const player = document.getElementById("player");

// Initial setup
player.start = () => {
    player.xPxCoord = getX();
    player.yPxCoord = getY();
    player.xCartCoord = xPxToCart(player.xPxCoord);
    player.yCartCoord = yPxToCart(player.yPxCoord);
    player.cartCoords = getCoords(player.xPxCoord, player.yPxCoord);
    player.occupiedTile = getTile(player.cartCoords);
    updateTiles(player.occupiedTile);
};

player.start();