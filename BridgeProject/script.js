const homeScreen = document.getElementById("homeScreen");
const talkScreen = document.getElementById("talkScreen");
const endScreen = document.getElementById("endScreen");

const playBtn = document.getElementById("playBtn");
const catHotspot = document.getElementById("catHotspot");
const clickHint = document.getElementById("clickHint");

const muteBtn = document.getElementById("muteBtn");
const resetBtn = document.getElementById("resetBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const bgMusic = document.getElementById("bgMusic");

const toroSprite = document.getElementById("toroSprite");
const speechBox = document.getElementById("speechBox");

const challengeBox = document.getElementById("challengeBox");
const challengeTitle = document.getElementById("challengeTitle");
const challengePrompt = document.getElementById("challengePrompt");
const answerInput = document.getElementById("answerInput");
const checkBtn = document.getElementById("checkBtn");
const hintBtn = document.getElementById("hintBtn");
const aiBtn = document.getElementById("aiBtn");
const feedback = document.getElementById("feedback");

const levelButtons = document.querySelectorAll(".level-btn");

const toroName = "Toro";

let muted = false;
let currentLevel = null;
let completedLevels = [];
let typewriterTimeouts = [];

const levels = {
  1: {
    title: "Level 1: Variables",
    prompt: 'Make a variable called name and store "Toro".',
    hint: "Use let, const, or var. Then set name equal to the string Toro.",
    ai: 'Example: let name = "Toro";'
  },
  2: {
    title: "Level 2: If Statements",
    prompt: "Write an if statement that checks if score is greater than 5.",
    hint: "Use if, parentheses, score > 5, and curly braces.",
    ai: 'Example: if (score > 5) {\n  console.log("Good job");\n}'
  },
  3: {
    title: "Level 3: Loops",
    prompt: "Write a for loop that counts from 0 to 4.",
    hint: "Start at 0, continue while i is less than 5, and increase i.",
    ai: 'Example: for (let i = 0; i < 5; i++) {\n  console.log(i);\n}'
  },
  4: {
    title: "Level 4: Functions",
    prompt: 'Write a function called greet that prints "Hello".',
    hint: "Use the function keyword, the name greet, parentheses, and braces.",
    ai: 'Example: function greet() {\n  console.log("Hello");\n}'
  },
  5: {
    title: "Level 5: AI as a Tool",
    prompt: "Explain in 1-2 sentences how AI should help with coding instead of doing everything for you.",
    hint: "Mention learning, understanding, checking work, debugging, or examples.",
    ai: "Example: AI should help me understand code, debug mistakes, and give examples. I should still think through the solution myself."
  }
};

function clearTypewriter() {
  typewriterTimeouts.forEach((timeout) => clearTimeout(timeout));
  typewriterTimeouts = [];
}

function typeText(element, speaker, text, speed = 28) {
  clearTypewriter();
  element.innerHTML = `<span class="speaker-name">${speaker}</span><span class="dialogue-text"></span>`;

  const dialogueText = element.querySelector(".dialogue-text");
  let i = 0;

  function typeNext() {
    if (i < text.length) {
      dialogueText.textContent += text.charAt(i);
      i++;
      const timeout = setTimeout(typeNext, speed);
      typewriterTimeouts.push(timeout);
    }
  }

  typeNext();
}

function normalizeCode(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/;/g, "")
    .trim();
}

function isValidVariableAnswer(answer) {
  const cleaned = normalizeCode(answer);
  return (
    cleaned === 'letname="toro"' ||
    cleaned === 'constname="toro"' ||
    cleaned === 'varname="toro"' ||
    cleaned === "letname='toro'" ||
    cleaned === "constname='toro'" ||
    cleaned === "varname='toro'"
  );
}

function isValidIfAnswer(answer) {
  const cleaned = normalizeCode(answer);
  return (
    cleaned.includes("if(score>5){") ||
    cleaned.includes("if(score>5)")
  );
}

function isValidLoopAnswer(answer) {
  const cleaned = normalizeCode(answer);

  const hasFor = cleaned.includes("for(");
  const startsAtZero = cleaned.includes("i=0");
  const lessThanFive = cleaned.includes("i<5");
  const increments = cleaned.includes("i++") || cleaned.includes("i+=1");

  return hasFor && startsAtZero && lessThanFive && increments;
}

function isValidFunctionAnswer(answer) {
  const cleaned = normalizeCode(answer);

  const hasFunction =
    cleaned.includes("functiongreet(){") ||
    cleaned.includes("functiongreet()");

  const saysHello =
    cleaned.includes('console.log("hello")') ||
    cleaned.includes("console.log('hello')") ||
    cleaned.includes('alert("hello")') ||
    cleaned.includes("alert('hello')");

  return hasFunction && saysHello;
}

playBtn.addEventListener("click", async () => {
  playBtn.classList.add("fade-out");
  catHotspot.classList.remove("hidden");
  clickHint.classList.remove("hidden");

  try {
    await bgMusic.play();
  } catch (error) {
    console.log("Music autoplay blocked until another click.");
  }
});

catHotspot.addEventListener("click", () => {
  showScreen(talkScreen);
  toroSprite.src = "assets/happy.png";
  typeText(
    speechBox,
    toroName,
    "Hi! Can you help me with my homework? Pick a level below."
  );
});

muteBtn.addEventListener("click", () => {
  muted = !muted;
  bgMusic.muted = muted;
  muteBtn.textContent = muted ? "🔇 Unmute" : "🎵 Mute";
});

resetBtn.addEventListener("click", resetGame);
playAgainBtn.addEventListener("click", resetGame);

levelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLevel = btn.dataset.level;
    openLevel(currentLevel);
  });
});

hintBtn.addEventListener("click", () => {
  if (!currentLevel) return;
  feedback.textContent = "Hint: " + levels[currentLevel].hint;
  toroSprite.src = "assets/confused.png";
  typeText(
    speechBox,
    toroName,
    "Hmm... take another look. You can do it."
  );
});

aiBtn.addEventListener("click", () => {
  if (!currentLevel) return;
  feedback.textContent = "AI example:\n" + levels[currentLevel].ai;
  toroSprite.src = "assets/scared.png";
  typeText(
    speechBox,
    toroName,
    "Here is an example. Use it to learn, not just copy."
  );
});

checkBtn.addEventListener("click", () => {
  if (!currentLevel) return;

  const userAnswer = answerInput.value.trim();

  if (currentLevel === "1") {
    if (isValidVariableAnswer(userAnswer)) {
      markComplete(currentLevel);
      feedback.textContent = "Correct! Nice work.";
      toroSprite.src = "assets/happy.png";
      typeText(speechBox, toroName, "Yay! You got the variable right!");
    } else {
      feedback.textContent = 'Not quite. Make a variable named name and set it equal to "Toro".';
      toroSprite.src = "assets/confused.png";
      typeText(speechBox, toroName, "Almost! Try making a variable for my name.");
    }
    return;
  }

  if (currentLevel === "2") {
    if (isValidIfAnswer(userAnswer)) {
      markComplete(currentLevel);
      feedback.textContent = "Correct! Your if statement works.";
      toroSprite.src = "assets/happy.png";
      typeText(speechBox, toroName, "Yay! That if statement looks good!");
    } else {
      feedback.textContent = "Almost. Make sure your if statement checks whether score is greater than 5.";
      toroSprite.src = "assets/confused.png";
      typeText(speechBox, toroName, "Close! Check the condition one more time.");
    }
    return;
  }

  if (currentLevel === "3") {
    if (isValidLoopAnswer(userAnswer)) {
      markComplete(currentLevel);
      feedback.textContent = "Correct! That loop counts from 0 to 4.";
      toroSprite.src = "assets/happy.png";
      typeText(speechBox, toroName, "Woo! Your loop works!");
    } else {
      feedback.textContent = "Try again. Your loop should start at 0 and stop before 5.";
      toroSprite.src = "assets/confused.png";
      typeText(speechBox, toroName, "Almost! Make sure the loop starts at 0 and stops before 5.");
    }
    return;
  }

  if (currentLevel === "4") {
    if (isValidFunctionAnswer(userAnswer)) {
      markComplete(currentLevel);
      feedback.textContent = "Correct! Your function looks good.";
      toroSprite.src = "assets/happy.png";
      typeText(speechBox, toroName, "Yay! You made the function!");
    } else {
      feedback.textContent = 'Almost. Write a function called greet that prints "Hello".';
      toroSprite.src = "assets/confused.png";
      typeText(speechBox, toroName, "Try again! The function should say Hello.");
    }
    return;
  }

  if (currentLevel === "5") {
    const text = userAnswer.toLowerCase();
    const valid =
      (text.includes("help") ||
        text.includes("guide") ||
        text.includes("check") ||
        text.includes("debug") ||
        text.includes("example")) &&
      (text.includes("learn") ||
        text.includes("understand") ||
        text.includes("myself") ||
        text.includes("own") ||
        text.includes("thinking"));

    if (valid) {
      markComplete(currentLevel);
      feedback.textContent = "Good job! You understand AI should support your thinking.";
      toroSprite.src = "assets/happy.png";
      typeText(
        speechBox,
        toroName,
        "Exactly! AI should help you learn, not do everything for you."
      );
    } else {
      feedback.textContent = "Try again. Explain that AI should help you learn or check your work instead of replacing your own thinking.";
      toroSprite.src = "assets/confused.png";
      typeText(
        speechBox,
        toroName,
        "You are close. Try explaining how AI helps you understand things."
      );
    }
  }
});

function openLevel(levelNumber) {
  const level = levels[levelNumber];
  challengeBox.classList.remove("hidden");
  challengeTitle.textContent = level.title;
  challengePrompt.textContent = level.prompt;
  answerInput.value = "";
  feedback.textContent = "";
  toroSprite.src = "assets/happy.png";
  typeText(speechBox, toroName, "Let's solve this together.");
}

function markComplete(levelNumber) {
  if (!completedLevels.includes(levelNumber)) {
    completedLevels.push(levelNumber);
  }

  document
    .querySelector(`.level-btn[data-level="${levelNumber}"]`)
    .classList.add("done");

  if (completedLevels.length === 5) {
    setTimeout(() => {
      showScreen(endScreen);
    }, 1200);
  }
}

function showScreen(screenToShow) {
  [homeScreen, talkScreen, endScreen].forEach((screen) => {
    screen.classList.remove("active");
  });
  screenToShow.classList.add("active");
}

function resetGame() {
  completedLevels = [];
  currentLevel = null;

  levelButtons.forEach((btn) => btn.classList.remove("done"));

  challengeBox.classList.add("hidden");
  catHotspot.classList.add("hidden");
  clickHint.classList.add("hidden");
  playBtn.classList.remove("fade-out");

  toroSprite.src = "assets/happy.png";
  feedback.textContent = "";
  answerInput.value = "";

  clearTypewriter();
  speechBox.innerHTML = `<span class="speaker-name">${toroName}</span><span class="dialogue-text">Hi! Can you help me with my homework?</span>`;

  bgMusic.pause();
  bgMusic.currentTime = 0;
  bgMusic.muted = false;
  muted = false;
  muteBtn.textContent = "🎵 Mute";

  showScreen(homeScreen);
}