const textarea = document.querySelector("textarea");
const startRecordButton = document.getElementById("startRecord");
const stopRecordButton = document.getElementById("stopRecord");
const playbackButton = document.getElementById("playback");
const clearDataButton = document.getElementById("clearData");

let isRecording = false;
let changes = [];

// Start recording changes
startRecordButton.addEventListener("click", () => {
  changes = [];
  isRecording = true;
  startRecordButton.disabled = true;
  stopRecordButton.disabled = false;
  playbackButton.disabled = true;
  textarea.focus();

  // Attach event listeners
  textarea.addEventListener("input", recordChange);
  textarea.addEventListener("mousemove", recordMousePosition);
  textarea.addEventListener("mouseup", recordSelection);
  document.addEventListener("keydown", recordCursorPosition);
});

// Stop recording changes
stopRecordButton.addEventListener("click", () => {
  isRecording = false;
  startRecordButton.disabled = false;
  stopRecordButton.disabled = true;
  playbackButton.disabled = false;

  // Remove event listeners
  textarea.removeEventListener("input", recordChange);
  textarea.removeEventListener("mousemove", recordMousePosition);
  textarea.removeEventListener("mouseup", recordSelection);
  document.removeEventListener("keydown", recordCursorPosition);
});

// Record the changes in the textarea
function recordChange(event) {
  if (isRecording) {
    const currentTime = new Date().getTime();
    changes.push({
      type: "input",
      text: event.target.value,
      time: currentTime,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
      cursorPosition: textarea.selectionStart,
      mouseX: lastMouseX,
      mouseY: lastMouseY,
    });
  }
}

// Record mouse position
let lastMouseX = 0;
let lastMouseY = 0;

function recordMousePosition(event) {
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

// Record text selection
function recordSelection() {
  if (isRecording) {
    const currentTime = new Date().getTime();
    changes.push({
      type: "selection",
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
      time: currentTime,
      mouseX: lastMouseX,
      mouseY: lastMouseY,
    });
  }
}

// Record cursor position
function recordCursorPosition(event) {
  if (
    isRecording &&
    (event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight")
  ) {
    const currentTime = new Date().getTime();
    changes.push({
      type: "cursor",
      cursorPosition: textarea.selectionStart,
      time: currentTime,
      mouseX: lastMouseX,
      mouseY: lastMouseY,
    });
  }
}

// Playback the recorded changes
playbackButton.addEventListener("click", () => {
  if (changes.length === 0) return;

  textarea.value = ""; // Clear textarea before playback
  let startTime = changes[0].time;

  changes.forEach((change, index) => {
    const delay = change.time - startTime;
    setTimeout(() => {
      if (change.type === "input") {
        textarea.value = change.text;
        textarea.setSelectionRange(change.selectionStart, change.selectionEnd);
      } else if (change.type === "selection") {
        textarea.setSelectionRange(change.selectionStart, change.selectionEnd);
      } else if (change.type === "cursor") {
        textarea.setSelectionRange(
          change.cursorPosition,
          change.cursorPosition
        );
      }
      // Set mouse position - not directly possible in browsers
      textarea.focus(); // Simulate user focus
    }, delay);
  });
});

// Clear Data
clearDataButton.addEventListener("click", () => {
  changes = [];
  textarea.value = "";
  playbackButton.disabled = true;
});
