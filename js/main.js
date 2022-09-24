/**
 * floors: {
 *    1: {
 *      up: true/false,
 *      down: true/false,
 *    }
 * }
 */
const state = {
  lifts: [],
  floors: {},
};

function createLiftDoors(id) {
  const liftDoorLeft = document.createElement("div");
  const liftDoorRight = document.createElement("div");

  liftDoorLeft.dataset.liftDoor = `lift-left-${id}`;
  liftDoorRight.dataset.liftDoor = `lift-right-${id}`;

  liftDoorLeft.classList.add("lift-doors");
  liftDoorRight.classList.add("lift-doors");

  return { liftDoorLeft, liftDoorRight };
}

function openLiftDoors(liftID) {
  const liftLeftDoor = document.querySelector(
    `[data-lift-door="lift-left-${liftID}"]`
  );
  const liftRightDoor = document.querySelector(
    `[data-lift-door="lift-right-${liftID}"]`
  );
  liftLeftDoor.style.transform = "translateX(-4rem)";
  liftRightDoor.style.transform = "translateX(+4rem)";
}

function closeLiftDoors(liftID) {
  const liftLeftDoor = document.querySelector(
    `[data-lift-door="lift-left-${liftID}"]`
  );
  const liftRightDoor = document.querySelector(
    `[data-lift-door="lift-right-${liftID}"]`
  );
  liftLeftDoor.style.transform = "translateX(0)";
  liftRightDoor.style.transform = "translateX(0)";
}

/**
 * Returns a new lift with followinig details
 * @params id: number
 * @returns 
 * `{   
 *      currentFloor: integer,
        currentDirection: "up" | "down",
        currentState: "idle" | "running",
        id: number
    }`
*/
function generateLift(id) {
  const lift = document.createElement("div");

  lift.classList.add("lift");
  lift.dataset.liftNo = id;
  lift.style.left = `${15 + id * 12}rem`;

  const { liftDoorLeft, liftDoorRight } = createLiftDoors(id);

  lift.appendChild(liftDoorLeft);
  lift.appendChild(liftDoorRight);

  state.lifts.push({
    currentLevel: 0,
    idle: true,
    currentDirection: null, //up, down, null
    destination: null,
    queue: [],
    id,
  });

  return lift;
}

function generateLifts(numOfLifts) {
  // getting the ground floor and adding the lift to it
  const groundFloor = document.querySelector(`[data-level="0"]`);

  // generating lifts
  for (let i = 0; i < numOfLifts; i++) {
    const lift = generateLift(i);

    groundFloor.append(lift);
  }

  console.log(state);
}

/**
 * @params floor: level of floor
 * @returns return a DOM element for the floor
 */
function generateFloor(level, highestLevel) {
  const floor = document.createElement("div");
  const floorPartition = document.createElement("div");
  const btnsContainer = document.createElement("div");
  const downButton = document.createElement("button");
  const upButton = document.createElement("button");

  btnsContainer.className = "btns-container";

  upButton.innerText = "U";
  upButton.classList.add("lift-btns");
  upButton.dataset.level = level;
  upButton.dataset.mode = "up";

  downButton.innerText = "D";
  downButton.classList.add("lift-btns");
  downButton.classList.add("down-btn");
  downButton.dataset.level = level;
  downButton.dataset.mode = "down";

  if (level >= 0 && level !== highestLevel - 1 && level < highestLevel) {
    btnsContainer.appendChild(upButton);
  }

  if (level <= highestLevel - 1 && level !== 0) {
    btnsContainer.appendChild(downButton);
  }

  floorPartition.classList.add("floor-partition");
  floor.classList.add("floor-container");

  floor.appendChild(btnsContainer);
  floor.appendChild(floorPartition);
  floor.dataset.level = level;
  return floor;
}

/**
 * @returns generated DOM elements for the floor
 */
function generateFloors(numOfFloors) {
  const floors = document.createElement("div");
  floors.className = "floors-container";
  floors.addEventListener("click", callLift);

  for (let i = numOfFloors - 1; i >= 0; i--) {
    const floor = generateFloor(i, numOfFloors);
    floors.appendChild(floor);
  }

  return floors;
}

function callNearestLift(mode, destination) {
  const liftDestination = Number(destination);
  const length = state.lifts.length;
  let alreadyAllocated = false;
  let liftID = null;
  let nearestDistance = Number.MAX_VALUE;
  let liftFloor = null;
  let doNothing = false;

  if (
    state.floors[destination] === undefined ||
    !state.floors[destination][mode]
  ) {
    if (state.floors[destination] === undefined) {
      state.floors[destination] = {};
    }
    state.floors[destination][mode] = true;
    for (let i = 0; i < length; i++) {
      const distance = Math.abs(state.lifts[i].currentLevel - liftDestination);
      console.log(
        !state.lifts[i].idle,
        state.lifts[i].currentDirection === mode,
        Number(destination),
        Number(state.lifts[i].destination)
      );
      if (
        !state.lifts[i].idle &&
        state.lifts[i].currentDirection === mode &&
        mode === "up" &&
        Number(destination) < Number(state.lifts[i].destination) &&
        Number(destination) > Number(state.lifts[i].currentLevel)
      ) {
        console.log(`adding to ${i} lift new destination`);
        state.lifts[i].queue.push(Number(destination));
        alreadyAllocated = true;
        break;
      } else if (
        !state.lifts[i].idle &&
        state.lifts[i].currentDirection === mode &&
        mode === "down" &&
        Number(destination) > Number(state.lifts[i].destination) &&
        Number(destination) < Number(state.lifts[i].currentLevel)
      ) {
        state.lifts[i].queue.push(Number(destination));
        alreadyAllocated = true;
        break;
      } else if (
        state.lifts[i].idle &&
        distance < nearestDistance &&
        !state.lifts[i].currentDirection &&
        !state.lifts[i].destination
      ) {
        nearestDistance = distance;
        liftID = i;
        liftFloor = state.lifts[i].currentLevel;
      }
    }

    // console.log(`${liftID} ${liftFloor} calling nearest lift`);
    if (liftID !== null && allocateLift !== false) {
      // console.log("Entering lift idle update");
      // console.log(`${liftID} ${liftFloor} calling nearest lift`);
      state.lifts[liftID].idle = false;
      state.lifts[liftID].destination = destination;
      // console.log(
      //   state.lifts[liftID].destination,
      //   destination,
      //   "from setting floor"
      // );
    }
  } else {
    doNothing = true;
  }

  // return the id of the lift
  return { liftID, liftFloor, alreadyAllocated, doNothing };
}

function deallocateLift(mode, destination) {
  state.floors[destination][mode] = false;
}

// external response - calling from outside the lift
function callLift(event) {
  if (event.target.tagName === "BUTTON") {
    const { level, mode } = event.target.dataset;
    // console.log(level, mode);
    allocateLift(level, mode);
  }
}

function moveLiftUp(lift, level, liftID, mode) {
  let isPaused = false;
  const timer = setInterval(() => {
    if (!isPaused) {
      if (state.lifts[liftID].currentLevel <= Number(level)) {
        lift.classList.add("lift-transition");
        lift.style.transform = `translateY(${
          -state.lifts[liftID].currentLevel * 11
        }rem)`;
        console.log(
          state.lifts[liftID].currentLevel,
          level,
          state.lifts[liftID].destination
        );
        if (
          state.lifts[liftID].currentLevel === Number(level) ||
          state.lifts[liftID].queue.includes(
            Number(state.lifts[liftID].currentLevel)
          )
        ) {
          isPaused = true;
          setTimeout(() => openLiftDoors(liftID), 2000);
          setTimeout(() => {
            closeLiftDoors(liftID);
            isPaused = false;
          }, 5000);
        }
        state.lifts[liftID].currentLevel++;
      } else {
        state.lifts[liftID].currentLevel = Number(level);
        state.lifts[liftID].idle = true;
        state.lifts[liftID].destination = null;
        state.lifts[liftID].currentDirection = null;
        state.lifts[liftID].queue = [];
        deallocateLift(mode, level);
        // console.log(state.lifts);
        clearInterval(timer);
      }
    }
  }, 500);
}

function moveLiftDown(lift, level, liftID, mode) {
  let isPaused = false;

  const timer = setInterval(() => {
    if (!isPaused) {
      console.log(
        state.lifts[liftID].queue.includes(
          Number(state.lifts[liftID].currentLevel)
        ),
        Number(state.lifts[liftID].currentLevel),
        "opening on this floor or not while going down"
      );
      if (
        state.lifts[liftID].currentLevel === Number(level) ||
        state.lifts[liftID].queue.includes(
          Number(state.lifts[liftID].currentLevel)
        )
      ) {
        isPaused = true;
        setTimeout(() => openLiftDoors(liftID), 2000);
        setTimeout(() => {
          closeLiftDoors(liftID);

          isPaused = false;
        }, 5000);
      }
      if (state.lifts[liftID].currentLevel > level) {
        lift.classList.add("lift-transition");
        lift.style.transform = `translateY(${
          -(state.lifts[liftID].currentLevel - 1) * 11
        }rem)`;
        state.lifts[liftID].currentLevel--;
      } else {
        state.lifts[liftID].currentLevel = Number(level);
        state.lifts[liftID].idle = true;
        state.lifts[liftID].destination = null;
        state.lifts[liftID].currentDirection = null;
        state.lifts[liftID].queue = [];
        deallocateLift(mode, level);
        // console.log(state.lifts);
        clearInterval(timer);
      }
    }
  }, 500);
}

// Lift Manager allocating the lifts
function allocateLift(level, mode) {
  const { liftID, liftFloor, alreadyAllocated, doNothing } = callNearestLift(
    mode,
    level
  );
  const lift = document.querySelector(`[data-lift-no="${liftID}"]`);

  if (lift && !alreadyAllocated && !doNothing) {
    const diff = level - liftFloor;
    console.log(diff);
    if (diff > 0) {
      // console.log("Moving lift up");
      moveLiftUp(lift, level, liftID, mode);
      state.lifts[liftID].currentDirection = "up";
    } else if (diff < 0) {
      // console.log("Moving lift down");
      moveLiftDown(lift, level, liftID, mode);
      state.lifts[liftID].currentDirection = "down";
    } else {
      setTimeout(() => openLiftDoors(liftID), 2000);
      setTimeout(() => {
        closeLiftDoors(liftID);
        state.lifts[liftID].idle = true;
        state.lifts[liftID].destination = null;
        state.lifts[liftID].currentDirection = null;
        deallocateLift(mode, level);
      }, 5000);
    }
  }
}

// Form handling

function submitHandler(event) {
  event.preventDefault();
  const noOfFloors = Number(inputFloors.value);
  const noOfLifts = Number(inputLifts.value);

  // reset values
  inputFloors.value = "";
  inputLifts.value = "";

  const container = document.getElementById("container");
  const floors = generateFloors(noOfFloors);
  container.appendChild(floors);
  generateLifts(noOfLifts);

  // disable form
  const form = document.getElementsByClassName("form")[0];
  form.style.display = "none";
}

const inputFloors = document.getElementById("input-floors");
const inputLifts = document.getElementById("input-lifts");
const submitBtn = document.getElementById("submit-btn");

submitBtn.addEventListener("click", submitHandler);
