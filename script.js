document.addEventListener("DOMContentLoaded", () => {
  // Game elements
  const titleScreen = document.getElementById("titleScreen")
  const levelSelect = document.getElementById("levelSelect")
  const gameScreen = document.getElementById("gameScreen")
  const pauseMenu = document.getElementById("pauseMenu")
  const levelComplete = document.getElementById("levelComplete")
  const gameCompletionScreen = document.getElementById("gameCompletionScreen")

  const startButton = document.getElementById("startButton")
  const levelButtons = document.querySelectorAll(".level-button")
  const resumeBtn = document.getElementById("resumeBtn")
  const restartBtn = document.getElementById("restartBtn")
  const quitBtn = document.getElementById("quitBtn")
  const nextLevelBtn = document.getElementById("nextLevelBtn")
  const levelSelectBtn = document.getElementById("levelSelectBtn")
  const restartGameBtn = document.getElementById("restartGameBtn")
  const quitGameBtn = document.getElementById("quitGameBtn")

  const currentLevelDisplay = document.getElementById("currentLevel")
  const timerDisplay = document.getElementById("timer")
  const completionTimeDisplay = document.getElementById("completionTime")

  const mazeElement = document.getElementById("maze")
  const playerElement = document.getElementById("player")
  const goalElement = document.getElementById("goal")

  const upBtn = document.getElementById("upBtn")
  const leftBtn = document.getElementById("leftBtn")
  const rightBtn = document.getElementById("rightBtn")
  const downBtn = document.getElementById("downBtn")
  const pauseBtn = document.getElementById("pauseBtn")

  // Game state
  let currentLevel = 1
  let maze = []
  let playerPosition = { x: 0, y: 0 }
  let goalPosition = { x: 0, y: 0 }
  const mazeSize = { width: 0, height: 0 }
  let cellSize = 0
  let gameTimer = null
  let startTime = 0
  let elapsedTime = 0
  let isPaused = false

  // Event listeners
  startButton.addEventListener("click", showLevelSelect)

  levelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentLevel = Number.parseInt(button.getAttribute("data-level"))
      startGame()
    })
  })

  resumeBtn.addEventListener("click", resumeGame)
  restartBtn.addEventListener("click", restartLevel)
  quitBtn.addEventListener("click", quitToLevelSelect)
  nextLevelBtn.addEventListener("click", nextLevel)
  levelSelectBtn.addEventListener("click", quitToLevelSelect)
  pauseBtn.addEventListener("click", togglePause)

  // D-pad controls
  upBtn.addEventListener("click", () => movePlayer(0, -1))
  leftBtn.addEventListener("click", () => movePlayer(-1, 0))
  rightBtn.addEventListener("click", () => movePlayer(1, 0))
  downBtn.addEventListener("click", () => movePlayer(0, 1))

  // Keyboard controls
  document.addEventListener("keydown", handleKeyPress)

  // Add event listeners for the game completion buttons
  restartGameBtn.addEventListener("click", restartGame)
  quitGameBtn.addEventListener("click", quitToLevelSelect)

  // Navigation functions
  function showLevelSelect() {
    titleScreen.classList.add("hidden")
    levelSelect.classList.remove("hidden")
  }

  function startGame() {
    levelSelect.classList.add("hidden")
    gameScreen.classList.remove("hidden")
    currentLevelDisplay.textContent = currentLevel

    generateMaze()
    placePlayerAndGoal()
    renderMaze()

    startTimer()
  }

  function togglePause() {
    isPaused = !isPaused

    if (isPaused) {
      pauseMenu.classList.remove("hidden")
      stopTimer()
    } else {
      pauseMenu.classList.add("hidden")
      startTimer()
    }
  }

  function resumeGame() {
    isPaused = false
    pauseMenu.classList.add("hidden")
    startTimer()
  }

  function restartLevel() {
    pauseMenu.classList.add("hidden")
    isPaused = false
    elapsedTime = 0
    generateMaze()
    placePlayerAndGoal()
    renderMaze()
    startTimer()
  }

  function quitToLevelSelect() {
    pauseMenu.classList.add("hidden")
    levelComplete.classList.add("hidden")
    gameScreen.classList.add("hidden")
    levelSelect.classList.remove("hidden")
    stopTimer()
    isPaused = false
    elapsedTime = 0
  }

  // Modify the nextLevel function to handle game completion
  function nextLevel() {
    if (currentLevel < 10) {
      currentLevel++
      levelComplete.classList.add("hidden")
      currentLevelDisplay.textContent = currentLevel
      elapsedTime = 0
      generateMaze()
      placePlayerAndGoal()
      renderMaze()
      startTimer()
    } else {
      // Game completed - show game completion screen
      levelComplete.classList.add("hidden")
      gameCompletionScreen.classList.remove("hidden")
    }
  }

  // Add a new function to handle restarting the game from level 1
  function restartGame() {
    gameCompletionScreen.classList.add("hidden")
    currentLevel = 1
    currentLevelDisplay.textContent = currentLevel
    elapsedTime = 0
    generateMaze()
    placePlayerAndGoal()
    renderMaze()
    startTimer()
  }

  function completeLevel() {
    stopTimer()
    completionTimeDisplay.textContent = formatTime(elapsedTime)
    levelComplete.classList.remove("hidden")
  }

  // Timer functions
  function startTimer() {
    stopTimer()
    startTime = Date.now() - elapsedTime
    gameTimer = setInterval(updateTimer, 1000)
  }

  function stopTimer() {
    if (gameTimer) {
      clearInterval(gameTimer)
      gameTimer = null
      elapsedTime = Date.now() - startTime
    }
  }

  function updateTimer() {
    elapsedTime = Date.now() - startTime
    timerDisplay.textContent = formatTime(elapsedTime)
  }

  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000) % 60
    const minutes = Math.floor(ms / 1000 / 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Modify the generateMaze function to increase difficulty more aggressively from level 2
  function generateMaze() {
    // Set maze size based on level - more aggressive scaling
    const baseSize = 5
    const sizeIncrease = Math.floor(currentLevel * 0.8) + (currentLevel >= 2 ? 2 : 0)
    mazeSize.width = baseSize + sizeIncrease
    mazeSize.height = baseSize + sizeIncrease

    // Calculate cell size based on container dimensions
    const mazeContainer = mazeElement.parentElement
    const containerWidth = mazeContainer.clientWidth
    const containerHeight = mazeContainer.clientHeight

    cellSize = Math.min(Math.floor(containerWidth / mazeSize.width), Math.floor(containerHeight / mazeSize.height))

    // Initialize maze with walls
    maze = Array(mazeSize.height)
      .fill()
      .map(() => Array(mazeSize.width).fill(1))

    // Generate maze using recursive backtracking
    const startX = 1
    const startY = 1
    maze[startY][startX] = 0 // Clear starting cell

    const directions = [
      { dx: 0, dy: -2 }, // Up
      { dx: 2, dy: 0 }, // Right
      { dx: 0, dy: 2 }, // Down
      { dx: -2, dy: 0 }, // Left
    ]

    function carvePassages(x, y) {
      // Shuffle directions randomly
      const shuffledDirections = [...directions].sort(() => Math.random() - 0.5)

      for (const dir of shuffledDirections) {
        const nx = x + dir.dx
        const ny = y + dir.dy

        if (nx > 0 && nx < mazeSize.width - 1 && ny > 0 && ny < mazeSize.height - 1 && maze[ny][nx] === 1) {
          // Carve passage
          maze[y + dir.dy / 2][x + dir.dx / 2] = 0
          maze[ny][nx] = 0
          carvePassages(nx, ny)
        }
      }
    }

    carvePassages(startX, startY)

    // Add difficulty elements based on level - more aggressive from level 2

    // 1. Add random paths - start from level 2 instead of 3
    if (currentLevel >= 2) {
      const extraPaths = currentLevel * 2 // More paths
      for (let i = 0; i < extraPaths; i++) {
        const x = Math.floor(Math.random() * (mazeSize.width - 4)) + 2
        const y = Math.floor(Math.random() * (mazeSize.height - 4)) + 2
        if (x % 2 === 1 || y % 2 === 1) {
          maze[y][x] = 0
        }
      }
    }

    // 2. Add dead ends - start from level 2 instead of 4
    if (currentLevel >= 2) {
      const deadEnds = Math.floor(currentLevel * 2) // More dead ends
      for (let i = 0; i < deadEnds; i++) {
        // Find a path cell with only one open neighbor
        for (let attempts = 0; attempts < 50; attempts++) {
          const x = Math.floor(Math.random() * (mazeSize.width - 2)) + 1
          const y = Math.floor(Math.random() * (mazeSize.height - 2)) + 1

          if (maze[y][x] === 0) {
            // Check if it's a good candidate for a dead end extension
            let openNeighbors = 0
            let wallDirection = { dx: 0, dy: 0 }

            for (const dir of directions) {
              const halfDir = { dx: dir.dx / 2, dy: dir.dy / 2 }
              const nx = x + halfDir.dx
              const ny = y + halfDir.dy

              if (nx >= 0 && nx < mazeSize.width && ny >= 0 && ny < mazeSize.height) {
                if (maze[ny][nx] === 0) {
                  openNeighbors++
                } else {
                  wallDirection = halfDir
                }
              }
            }

            // If this cell has exactly one open neighbor, extend it to create a dead end
            if (openNeighbors === 1 && wallDirection.dx !== 0 && wallDirection.dy !== 0) {
              const nx = x + wallDirection.dx
              const ny = y + wallDirection.dy

              if (nx >= 0 && nx < mazeSize.width && ny >= 0 && ny < mazeSize.height) {
                maze[ny][nx] = 0
                break
              }
            }
          }
        }
      }
    }

    // 3. Add more walls - start from level 3 instead of 6
    if (currentLevel >= 3) {
      const extraWalls = currentLevel * 3 // More walls
      for (let i = 0; i < extraWalls; i++) {
        const x = Math.floor(Math.random() * (mazeSize.width - 2)) + 1
        const y = Math.floor(Math.random() * (mazeSize.height - 2)) + 1

        // Don't block all paths
        let openNeighbors = 0
        for (const dir of [
          { dx: 0, dy: -1 }, // Up
          { dx: 1, dy: 0 }, // Right
          { dx: 0, dy: 1 }, // Down
          { dx: -1, dy: 0 }, // Left
        ]) {
          const nx = x + dir.dx
          const ny = y + dir.dy
          if (nx >= 0 && nx < mazeSize.width && ny >= 0 && ny < mazeSize.height && maze[ny][nx] === 0) {
            openNeighbors++
          }
        }

        // Only add a wall if it won't completely block a path
        if (openNeighbors > 2 && maze[y][x] === 0) {
          maze[y][x] = 1
        }
      }
    }

    // 4. Add maze complexity by creating loops - start from level 5 instead of 8
    if (currentLevel >= 5) {
      const loops = Math.floor(currentLevel) // More loops
      for (let i = 0; i < loops; i++) {
        const x = Math.floor(Math.random() * (mazeSize.width - 4)) + 2
        const y = Math.floor(Math.random() * (mazeSize.height - 4)) + 2

        if (maze[y][x] === 1) {
          // Check if creating a passage here would create a loop
          let wallNeighbors = 0
          for (const dir of [
            { dx: 0, dy: -1 }, // Up
            { dx: 1, dy: 0 }, // Right
            { dx: 0, dy: 1 }, // Down
            { dx: -1, dy: 0 }, // Left
          ]) {
            const nx = x + dir.dx
            const ny = y + dir.dy
            if (nx >= 0 && nx < mazeSize.width && ny >= 0 && ny < mazeSize.height && maze[ny][nx] === 0) {
              wallNeighbors++
            }
          }

          // If this would create a loop (has multiple open neighbors)
          if (wallNeighbors >= 2) {
            maze[y][x] = 0
          }
        }
      }
    }
  }

  function placePlayerAndGoal() {
    // Place player at the top-left open cell
    for (let y = 0; y < mazeSize.height; y++) {
      for (let x = 0; x < mazeSize.width; x++) {
        if (maze[y][x] === 0) {
          playerPosition = { x, y }
          break
        }
      }
      if (playerPosition.x !== 0 || playerPosition.y !== 0) break
    }

    // Find the furthest point from the player using BFS
    const distances = Array(mazeSize.height)
      .fill()
      .map(() => Array(mazeSize.width).fill(-1))
    const queue = []

    // Start BFS from player position
    distances[playerPosition.y][playerPosition.x] = 0
    queue.push({ x: playerPosition.x, y: playerPosition.y })

    let furthestPoint = { x: playerPosition.x, y: playerPosition.y, distance: 0 }

    while (queue.length > 0) {
      const current = queue.shift()
      const directions = [
        { dx: 0, dy: -1 }, // Up
        { dx: 1, dy: 0 }, // Right
        { dx: 0, dy: 1 }, // Down
        { dx: -1, dy: 0 }, // Left
      ]

      for (const dir of directions) {
        const nx = current.x + dir.dx
        const ny = current.y + dir.dy

        if (
          nx >= 0 &&
          nx < mazeSize.width &&
          ny >= 0 &&
          ny < mazeSize.height &&
          maze[ny][nx] === 0 &&
          distances[ny][nx] === -1
        ) {
          distances[ny][nx] = distances[current.y][current.x] + 1
          queue.push({ x: nx, y: ny })

          // Update furthest point if this one is further
          if (distances[ny][nx] > furthestPoint.distance) {
            furthestPoint = { x: nx, y: ny, distance: distances[ny][nx] }
          }
        }
      }
    }

    // Set goal to the furthest point
    goalPosition = { x: furthestPoint.x, y: furthestPoint.y }
  }

  function renderMaze() {
    // Clear previous maze
    mazeElement.innerHTML = ""

    // Render walls
    for (let y = 0; y < mazeSize.height; y++) {
      for (let x = 0; x < mazeSize.width; x++) {
        if (maze[y][x] === 1) {
          const wall = document.createElement("div")
          wall.className = "wall"
          wall.style.width = `${cellSize}px`
          wall.style.height = `${cellSize}px`
          wall.style.left = `${x * cellSize}px`
          wall.style.top = `${y * cellSize}px`
          mazeElement.appendChild(wall)
        }
      }
    }

    // Position player
    playerElement.style.width = `${cellSize * 0.8}px`
    playerElement.style.height = `${cellSize * 0.8}px`
    playerElement.style.left = `${playerPosition.x * cellSize + cellSize * 0.1}px`
    playerElement.style.top = `${playerPosition.y * cellSize + cellSize * 0.1}px`

    // Position goal
    goalElement.style.width = `${cellSize * 0.8}px`
    goalElement.style.height = `${cellSize * 0.8}px`
    goalElement.style.left = `${goalPosition.x * cellSize + cellSize * 0.1}px`
    goalElement.style.top = `${goalPosition.y * cellSize + cellSize * 0.1}px`
  }

  // Player movement
  function movePlayer(dx, dy) {
    if (isPaused) return

    const newX = playerPosition.x + dx
    const newY = playerPosition.y + dy

    // Check if the new position is valid (not a wall and within bounds)
    if (newX >= 0 && newX < mazeSize.width && newY >= 0 && newY < mazeSize.height && maze[newY][newX] === 0) {
      playerPosition.x = newX
      playerPosition.y = newY

      // Update player position
      playerElement.style.left = `${playerPosition.x * cellSize + cellSize * 0.1}px`
      playerElement.style.top = `${playerPosition.y * cellSize + cellSize * 0.1}px`

      // Check if player reached the goal
      if (playerPosition.x === goalPosition.x && playerPosition.y === goalPosition.y) {
        completeLevel()
      }
    }
  }

  function handleKeyPress(e) {
    if (isPaused) return

    switch (e.key) {
      case "ArrowUp":
        movePlayer(0, -1)
        e.preventDefault()
        break
      case "ArrowDown":
        movePlayer(0, 1)
        e.preventDefault()
        break
      case "ArrowLeft":
        movePlayer(-1, 0)
        e.preventDefault()
        break
      case "ArrowRight":
        movePlayer(1, 0)
        e.preventDefault()
        break
      case "Escape":
        togglePause()
        e.preventDefault()
        break
    }
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    if (gameScreen.classList.contains("hidden")) return

    const mazeContainer = mazeElement.parentElement
    const containerWidth = mazeContainer.clientWidth
    const containerHeight = mazeContainer.clientHeight

    cellSize = Math.min(Math.floor(containerWidth / mazeSize.width), Math.floor(containerHeight / mazeSize.height))

    renderMaze()
  })
})

