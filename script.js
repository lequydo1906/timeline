// Initialize Firebase (compat SDK used in index.html)
// Replace the config with your project's Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDR8_kXFXR_oWGNptZX_infNrWTm3xbPAM",
  authDomain: "timeline-43aac.firebaseapp.com",
  projectId: "timeline-43aac",
  storageBucket: "timeline-43aac.firebasestorage.app",
  messagingSenderId: "732658035286",
  appId: "1:732658035286:web:40091d26eee343579aa9f7",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Detect iOS Safari
const isIOSSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && /safari|version/.test(ua) && !/chrome|crios|firefox|fxios/.test(ua);
};

// Zoom and Fullscreen functionality
let currentZoomLevel = 100;
let isFullscreenMode = false;
const mainContainer = document.getElementById("main-container");
const eventCard = document.querySelector(".event-card");
const timelineSection = document.querySelector(".timeline-section");
const timelineControls = document.querySelector(".timeline-controls");
const timeline = document.querySelector(".timeline");
const zoomOutBtn = document.getElementById("zoom-out");
const zoomInBtn = document.getElementById("zoom-in");
const zoomLevelText = document.getElementById("zoom-level");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const resetViewBtn = document.getElementById("reset-view-btn");
const isIOS = isIOSSafari();

function updateZoom() {
  const zoomPercent = currentZoomLevel / 100;
  const timelineInnerEl = document.querySelector(".timeline-inner");
  if (timelineInnerEl) {
    timelineInnerEl.style.transform = `scale(${zoomPercent})`;
    timelineInnerEl.style.transformOrigin = "top center";
  }
  zoomLevelText.textContent = `${currentZoomLevel}%`;
}

zoomOutBtn.addEventListener("click", () => {
  currentZoomLevel = Math.max(50, currentZoomLevel - 10);
  updateZoom();
});

zoomInBtn.addEventListener("click", () => {
  currentZoomLevel = Math.min(200, currentZoomLevel + 10);
  updateZoom();
});

// Fullscreen functionality - show only the timeline
fullscreenBtn.addEventListener("click", () => {
  if (!isFullscreenMode) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
});

function enterFullscreen() {
  isFullscreenMode = true;
  
  // Hide form
  eventCard.style.display = "none";
  
  // Try to request native fullscreen (will hide browser UI including address bar on iOS)
  if (mainContainer.requestFullscreen) {
    mainContainer.requestFullscreen().catch((err) => {
      console.log("Fullscreen request denied:", err);
      enterPseudoFullscreen();
    });
  } else if (mainContainer.webkitRequestFullscreen) {
    mainContainer.webkitRequestFullscreen();
  } else if (mainContainer.mozRequestFullScreen) {
    mainContainer.mozRequestFullScreen();
  } else {
    // Fallback to pseudo-fullscreen
    enterPseudoFullscreen();
  }
}

function enterPseudoFullscreen() {
  // Add fullscreen class
  mainContainer.classList.add("fullscreen");
  document.body.classList.add("fullscreen-mode");
  document.documentElement.classList.add("fullscreen-mode");
  
  // Scroll to top and hide address bar on iOS
  window.scrollTo(0, 0);
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
  
  // Lock body and html
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.body.style.height = "100%";
  document.documentElement.style.overflow = "hidden";
  
  // Hide all siblings of main-container
  Array.from(document.body.children).forEach(child => {
    if (child !== mainContainer) {
      child.style.display = "none";
    }
  });
  
  // Make main container fullscreen with no gaps
  mainContainer.style.position = "fixed";
  mainContainer.style.top = "0";
  mainContainer.style.left = "0";
  mainContainer.style.width = "100vw";
  mainContainer.style.height = "100dvh";
  mainContainer.style.zIndex = "2000";
  mainContainer.style.padding = "0";
  mainContainer.style.margin = "0";
  mainContainer.style.flexDirection = "column";
  mainContainer.style.gap = "0";
  mainContainer.style.border = "none";
  mainContainer.style.borderRadius = "0";
  
  // Make timeline section fill the remaining space
  timelineSection.style.flex = "1";
  timelineSection.style.display = "flex";
  timelineSection.style.flexDirection = "column";
  timelineSection.style.borderRadius = "0";
  timelineSection.style.border = "none";
  
  fullscreenBtn.textContent = "⊡";
  fullscreenBtn.title = "Exit fullscreen";
  resetViewBtn.style.display = "inline-block";
}

function exitFullscreen() {
  isFullscreenMode = false;
  
  // Show form again
  eventCard.style.display = "";
  
  // Exit native fullscreen if active
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (document.webkitFullscreenElement) {
    document.webkitExitFullscreen();
  } else if (document.mozFullScreenElement) {
    document.mozCancelFullScreen();
  }
  
  // Always clean up pseudo-fullscreen styling
  exitPseudoFullscreen();
}

function exitPseudoFullscreen() {
  // Remove fullscreen class
  mainContainer.classList.remove("fullscreen");
  document.body.classList.remove("fullscreen-mode");
  document.documentElement.classList.remove("fullscreen-mode");
  
  // Restore body and html
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
  document.body.style.height = "";
  document.documentElement.style.overflow = "";
  
  // Show all siblings of main-container
  Array.from(document.body.children).forEach(child => {
    if (child !== mainContainer) {
      child.style.display = "";
    }
  });
  
  // Reset main container
  mainContainer.style.position = "";
  mainContainer.style.top = "";
  mainContainer.style.left = "";
  mainContainer.style.width = "";
  mainContainer.style.height = "";
  mainContainer.style.zIndex = "";
  mainContainer.style.padding = "8px";
  mainContainer.style.margin = "";
  mainContainer.style.gap = "8px";
  mainContainer.style.border = "";
  mainContainer.style.borderRadius = "";
  
  // Reset timeline section
  timelineSection.style.flex = "";
  timelineSection.style.display = "";
  timelineSection.style.flexDirection = "";
  timelineSection.style.borderRadius = "";
  timelineSection.style.border = "";
  
  fullscreenBtn.textContent = "⛶";
  fullscreenBtn.title = "Fullscreen";
  resetViewBtn.style.display = "none";
}

// Reset view button
resetViewBtn.addEventListener("click", () => {
  exitFullscreen();
});

// Handle fullscreen exit (e.g., ESC key press)
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    exitFullscreen();
  }
});

document.addEventListener("webkitfullscreenchange", () => {
  if (!document.webkitFullscreenElement) {
    exitFullscreen();
  }
});

document.addEventListener("mozfullscreenchange", () => {
  if (!document.mozFullScreenElement) {
    exitFullscreen();
  }
});

// Helpers
const msPerDay = 24 * 60 * 60 * 1000;

// Upload image to backend server
async function uploadImage(file) {
  if (!file) return null;
  try {
    const formData = new FormData();
    formData.append("image", file);
    
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      console.error("Upload failed:", response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.url; // Return /img/filename
  } catch (err) {
    console.error("Error uploading image:", err);
    return null;
  }
}

function parseMonthInput(value) {
  if (!value) return null;
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

// DOM
const form = document.getElementById("event-form");
const btnView = document.getElementById("btn-view");
const rangeStart = document.getElementById("range-start");
const rangeEnd = document.getElementById("range-end");
const timelineInner = document.getElementById("timeline-inner");
const daysRow = document.getElementById("days-row");
const eventsLayer = document.getElementById("events-layer");
const monthsRow = document.getElementById("months-row");
const filterGame = document.getElementById("filter-game");
const recurrenceSelect = document.getElementById("recurrence");

// Persist selected month range to localStorage so it survives refresh
const STORAGE_KEY_START = "timeline_range_start";
const STORAGE_KEY_END = "timeline_range_end";
const STORAGE_KEY_FILTER_GAME = "timeline_filter_game";

function saveRangeToStorage() {
  if (rangeStart.value)
    localStorage.setItem(STORAGE_KEY_START, rangeStart.value);
  else localStorage.removeItem(STORAGE_KEY_START);
  if (rangeEnd.value) localStorage.setItem(STORAGE_KEY_END, rangeEnd.value);
  else localStorage.removeItem(STORAGE_KEY_END);
}

function loadRangeFromStorage() {
  const s = localStorage.getItem(STORAGE_KEY_START);
  const e = localStorage.getItem(STORAGE_KEY_END);
  if (s) rangeStart.value = s;
  if (e) rangeEnd.value = e;
  const fg = localStorage.getItem(STORAGE_KEY_FILTER_GAME);
  if (fg) filterGame.checked = fg === "1";
}

rangeStart.addEventListener("change", () => saveRangeToStorage());
rangeEnd.addEventListener("change", () => saveRangeToStorage());
filterGame &&
  filterGame.addEventListener("change", () => {
    if (filterGame.checked) localStorage.setItem(STORAGE_KEY_FILTER_GAME, "1");
    else localStorage.removeItem(STORAGE_KEY_FILTER_GAME);
  });

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("event-name").value.trim();
  const startVal = document.getElementById("start").value;
  const endVal = document.getElementById("end").value;
  const color = document.getElementById("color").value;
  const isGame = document.getElementById("game").checked;
  const imageUrl = document.getElementById("file").value.trim();

  if (!name || !startVal || !endVal) {
    alert("Vui lòng nhập tên, thời gian bắt đầu và kết thúc.");
    return;
  }

  const startDate = new Date(startVal);
  const endDate = new Date(endVal);
  if (endDate < startDate) {
    alert("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
    return;
  }

  try {
    const recurrence = document.getElementById("recurrence").value || "none";
    
    // Calculate custom recurrence interval if selected
    let recurrenceInterval = null;
    if (recurrence === "custom") {
      // Recurrence interval = duration of event (end - start)
      recurrenceInterval = endDate.getTime() - startDate.getTime();
    }

    await db.collection("events").add({
      name,
      start: firebase.firestore.Timestamp.fromDate(startDate),
      end: firebase.firestore.Timestamp.fromDate(endDate),
      color,
      isGame,
      recurrence,
      recurrenceInterval,
      image: imageUrl || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    form.reset();
    // keep color default after reset
    document.getElementById("color").value = "#4a90e2";

    // if added event is a game, enable the game filter in controls
    if (isGame && filterGame) {
      filterGame.checked = true;
      localStorage.setItem(STORAGE_KEY_FILTER_GAME, "1");
    }

    // Refresh timeline
    renderTimeline();
  } catch (err) {
    console.error(err);
    alert("Lỗi khi lưu sự kiện lên Firebase. Kiểm tra console.");
  }
});

btnView.addEventListener("click", (e) => {
  e.preventDefault();
  renderTimeline();
});

async function renderTimeline() {
  // clear previous now interval to avoid duplicates when re-rendering
  if (window._nowInterval) {
    clearInterval(window._nowInterval);
    window._nowInterval = null;
  }

  // remove any previous now-line element
  const prevNow = document.querySelector(".now-line");
  if (prevNow && prevNow.parentNode) prevNow.parentNode.removeChild(prevNow);
  // Determine date range
  let start = parseMonthInput(rangeStart.value);
  let end = parseMonthInput(rangeEnd.value);
  const now = new Date();
  if (!start && !end) {
    // default to current month
    start = startOfMonth(now);
    end = endOfMonth(now);
  } else if (start && !end) {
    end = endOfMonth(start);
  } else if (!start && end) {
    start = startOfMonth(end);
  } else {
    // both provided: make start = first day of start, end = last day of end
    start = startOfMonth(start);
    end = endOfMonth(end);
  }

  // Clear UI
  daysRow.innerHTML = "";
  eventsLayer.innerHTML = "";
  monthsRow.innerHTML = "";

  // compute days count (inclusive range) — use floor to avoid an extra day
  const days = Math.floor((end - start) / msPerDay) + 1;

  // create day columns
  for (let i = 0; i < days; i++) {
    const day = new Date(start.getTime() + i * msPerDay);
    const d = document.createElement("div");
    d.className = "day-column";
    const label = document.createElement("span");
    label.className = "day-label";
    label.textContent = `${day.getDate()}`;
    d.appendChild(label);
    daysRow.appendChild(d);
  }

  // month blocks will be created after we know actual day width

  // Make eventsLayer width cover all days
  // measure actual day column width from DOM so pixel mapping stays correct
  let measuredDayWidth = 30;
  const firstDayCol = daysRow.querySelector(".day-column");
  if (firstDayCol) {
    const rect = firstDayCol.getBoundingClientRect();
    if (rect && rect.width > 0) measuredDayWidth = rect.width;
  }
  const dayWidth = measuredDayWidth;
  const totalWidth = days * dayWidth;
  eventsLayer.style.width = `${totalWidth}px`;
  daysRow.style.width = `${totalWidth}px`;
  monthsRow.style.width = `${totalWidth}px`;

  // create month blocks that span the contained days using measured day width
  let m = new Date(start.getFullYear(), start.getMonth(), 1);
  while (m <= end) {
    const monthStart = startOfMonth(m);
    const daysInMonth = new Date(
      m.getFullYear(),
      m.getMonth() + 1,
      0
    ).getDate();
    const leftDays = Math.floor((monthStart - start) / msPerDay);
    const monthDiv = document.createElement("div");
    monthDiv.className = "month-block";
    monthDiv.style.left = `${leftDays * dayWidth}px`;
    monthDiv.style.width = `${daysInMonth * dayWidth}px`;
    
    // Wrap text in a span for sticky positioning to work
    const monthText = document.createElement("span");
    monthText.className = "month-text";
    monthText.textContent = `${m.getMonth() + 1}/${m.getFullYear()}`;
    monthDiv.appendChild(monthText);
    
    monthsRow.appendChild(monthDiv);
    m = new Date(m.getFullYear(), m.getMonth() + 1, 1);
  }

  // pixels per millisecond for precise hh:mm:ss mapping
  const pxPerMs = dayWidth / msPerDay;

  // add vertical guides (one per day) inside eventsLayer, they sit behind events
  const guidesContainer = document.createElement("div");
  guidesContainer.className = "vertical-guides";
  eventsLayer.appendChild(guidesContainer);
  for (let i = 0; i < days; i++) {
    const g = document.createElement("div");
    g.className = "vertical-guide";
    // place guide in the middle of the day's column (marks 00:00 of that day)
    g.style.left = `${i * dayWidth + dayWidth / 2}px`;
    guidesContainer.appendChild(g);
  }

  // create now-line and label (updates every second)
  const nowLine = document.createElement("div");
  nowLine.className = "now-line";
  const nowLabel = document.createElement("div");
  nowLabel.className = "now-label";
  nowLine.appendChild(nowLabel);
  eventsLayer.appendChild(nowLine);

  function updateNow() {
    const now = new Date();
    // position only if within range
    if (now >= start && now <= end) {
      const fracDays = (now - start) / msPerDay; // fractional days
      // align now-line relative to the 00:00 guide which sits in the middle of each day column (+15px)
      const left = fracDays * dayWidth + dayWidth / 2;
      nowLine.style.display = "block";
      nowLine.style.left = `${left}px`;
      nowLabel.textContent = now.toLocaleTimeString();
    } else {
      // hide if outside range
      nowLine.style.display = "none";
    }
  }
  updateNow();

  // Scroll to center now-line on screen
  if (nowLine.style.display === "block") {
    setTimeout(() => {
      const timelineInnerContainer = document.getElementById("timeline-inner");
      if (timelineInnerContainer) {
        const nowLineRect = nowLine.getBoundingClientRect();
        const containerRect = timelineInnerContainer.getBoundingClientRect();
        const scrollLeft =
          nowLine.offsetLeft -
          (timelineInnerContainer.offsetWidth / 2 - nowLine.offsetWidth / 2);
        timelineInnerContainer.scrollLeft = Math.max(0, scrollLeft);
      }
    }, 0);
  }

  window._nowInterval = setInterval(updateNow, 1000);

  // Query Firestore for events that intersect the range: start <= rangeEnd AND end >= rangeStart
  try {
    // Query only by `start` (avoids composite index). We'll filter `end`
    // and `isGame` on the client.
    let queryRef = db
      .collection("events")
      .where("start", "<=", firebase.firestore.Timestamp.fromDate(end))
      .orderBy("start");

    const q = await queryRef.get();

    let docs = q.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((ev) => {
        // normalize end to Date
        const evEnd =
          ev.end && ev.end.toDate ? ev.end.toDate() : new Date(ev.end);
        if (!evEnd) return false;
        // must end on or after range start
        if (evEnd < start) return false;
        // if game filter active, require isGame
        if (filterGame && filterGame.checked) return !!ev.isGame;
        return true;
      });

    // process recurrence: when an event has ended and has a recurrence rule,
    // create exactly one next occurrence and remove the expired event so each
    // event appears only once in the timeline. This avoids bulk backfilling.
    function addIntervalToDate(d, recurrence, recurrenceInterval) {
      const nd = new Date(d.getTime());
      if (recurrence === "daily") nd.setDate(nd.getDate() + 1);
      else if (recurrence === "weekly") nd.setDate(nd.getDate() + 7);
      else if (recurrence === "monthly") nd.setMonth(nd.getMonth() + 1);
      else if (recurrence === "yearly") nd.setFullYear(nd.getFullYear() + 1);
      else if (recurrence === "custom" && recurrenceInterval) {
        // Add the custom interval in milliseconds
        nd.setTime(nd.getTime() + recurrenceInterval);
      }
      return nd;
    }

    // map existing start times to avoid duplicates
    const existingMap = new Map();
    docs.forEach((ev) => {
      try {
        const s =
          ev.start && ev.start.toDate
            ? ev.start.toDate().getTime()
            : new Date(ev.start).getTime();
        existingMap.set(ev.name + ":" + s, true);
      } catch (e) {}
    });

    for (let i = docs.length - 1; i >= 0; i--) {
      const ev = docs[i];
      const recurrence = ev.recurrence || "none";
      if (!recurrence || recurrence === "none") continue;
      const evStart =
        ev.start && ev.start.toDate ? ev.start.toDate() : new Date(ev.start);
      const evEnd =
        ev.end && ev.end.toDate ? ev.end.toDate() : new Date(ev.end);
      if (evEnd < now) {
        const nextStart = addIntervalToDate(evStart, recurrence, ev.recurrenceInterval);
        const nextEnd = addIntervalToDate(evEnd, recurrence, ev.recurrenceInterval);
        const key = ev.name + ":" + nextStart.getTime();
        if (!existingMap.has(key)) {
          try {
            const addRes = await db.collection("events").add({
              name: ev.name,
              start: firebase.firestore.Timestamp.fromDate(nextStart),
              end: firebase.firestore.Timestamp.fromDate(nextEnd),
              color: ev.color || "#4a90e2",
              textColor: ev.textColor || "#ffffff",
              isGame: !!ev.isGame,
              image: ev.image || null,
              recurrence: recurrence,
              recurrenceInterval: ev.recurrenceInterval || null,
              recurrenceSourceId: ev.id || null,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            docs.push({
              id: addRes.id,
              name: ev.name,
              start: firebase.firestore.Timestamp.fromDate(nextStart),
              end: firebase.firestore.Timestamp.fromDate(nextEnd),
              color: ev.color,
              isGame: ev.isGame,
              fileName: ev.fileName,
              recurrence: recurrence,
            });
            existingMap.set(key, true);
          } catch (err) {
            console.error("Error creating recurring event", err);
          }
        }
        // delete expired event doc from Firestore
        if (ev.id)
          db.collection("events")
            .doc(ev.id)
            .delete()
            .catch(() => {});
        // remove from local docs array immediately
        docs.splice(i, 1);
      }
    }

    // Sort events: ongoing (least time remaining first) → upcoming (soonest first) → ended (most recent first)
    const sorted = docs.slice().sort((a, b) => {
      const aStart =
        a.start && a.start.toDate ? a.start.toDate() : new Date(a.start);
      const bStart =
        b.start && b.start.toDate ? b.start.toDate() : new Date(b.start);
      const aEnd = a.end && a.end.toDate ? a.end.toDate() : new Date(a.end);
      const bEnd = b.end && b.end.toDate ? b.end.toDate() : new Date(b.end);
      const nowMs = now.getTime();
      const aStartMs = aStart.getTime();
      const bStartMs = bStart.getTime();
      const aEndMs = aEnd.getTime();
      const bEndMs = bEnd.getTime();

      // Determine status: -1 = ended, 0 = ongoing, 1 = upcoming
      const aStatus = nowMs < aStartMs ? 1 : nowMs < aEndMs ? 0 : -1;
      const bStatus = nowMs < bStartMs ? 1 : nowMs < bEndMs ? 0 : -1;

      // Group by status: ongoing first (0), then upcoming (1), then ended (-1) at bottom
      if (aStatus !== bStatus) {
        const aPri = aStatus === 0 ? 0 : aStatus === 1 ? 1 : 2;
        const bPri = bStatus === 0 ? 0 : bStatus === 1 ? 1 : 2;
        return aPri - bPri;
      }

      // Within same group, sort by:
      if (aStatus === 0) {
        // Ongoing: least remaining time first
        return aEndMs - bEndMs;
      } else if (aStatus === 1) {
        // Upcoming: soonest first
        return aStartMs - bStartMs;
      } else {
        // Ended: most recent first (newest end time first)
        return bEndMs - aEndMs;
      }
    });

    sorted.forEach((ev, idx) => {
      const evStart =
        ev.start && ev.start.toDate ? ev.start.toDate() : new Date(ev.start);
      const evEnd =
        ev.end && ev.end.toDate ? ev.end.toDate() : new Date(ev.end);

      // compute precise left/right based on start/end then round edges
      const exactLeft =
        (evStart.getTime() - start.getTime()) * pxPerMs + dayWidth / 2;
      const exactRight =
        (evEnd.getTime() - start.getTime()) * pxPerMs + dayWidth / 2;
      const leftPx = Math.round(exactLeft);
      const rightPx = Math.round(exactRight);
      const width = Math.max(0, rightPx - leftPx);

      const evDiv = document.createElement("div");
      evDiv.className = "event-block";
      evDiv.style.left = `${leftPx}px`;
      evDiv.style.top = `${idx * 36}px`;
      evDiv.style.width = `${width}px`;
      evDiv.style.background = ev.color || "rgba(74,144,226,0.95)";
      evDiv.style.color = ev.textColor || "#ffffff";
      
      // Create wrapper div for content with overflow hidden
      const wrapper = document.createElement("div");
      wrapper.className = "event-wrapper";
      
      // Wrap text in a span to allow sticky positioning
      const textSpan = document.createElement("span");
      textSpan.className = "event-text";
      textSpan.textContent = ev.name;
      wrapper.appendChild(textSpan);
      evDiv.appendChild(wrapper);
      
      // Add image if available
      if (ev.image) {
        const imgEl = document.createElement("img");
        imgEl.className = "event-image";
        imgEl.src = ev.image;
        imgEl.alt = ev.name;
        imgEl.setAttribute("width", "168");
        imgEl.setAttribute("height", "64");
        evDiv.appendChild(imgEl);
      }
      
      // attach id and click handler (open panel)
      if (ev.id) evDiv.dataset.id = ev.id;

      // Helper function to show tooltip
      function showTooltip(mouseEvent) {
        // Remove existing tooltip first
        if (evDiv._tooltip) {
          evDiv._tooltip.remove();
          evDiv._tooltip = null;
        }

        const tooltip = document.createElement("div");
        tooltip.className = "event-tooltip";
        const now = new Date();
        const startMs = evStart.getTime();
        const endMs = evEnd.getTime();
        const nowMs = now.getTime();
        const durationMs = endMs - startMs;
        const durationFormatted = formatDetailedDuration(durationMs);

        let tooltipText = "";

        // Event hasn't started yet
        if (nowMs < startMs) {
          const timeUntilStart = startMs - nowMs;
          const formatted = formatDetailedDuration(timeUntilStart);
          tooltipText = `Còn ${formatted} sẽ diễn ra • Thời lượng: ${durationFormatted}`;
        }
        // Event is ongoing
        else if (nowMs < endMs) {
          const timeRemaining = endMs - nowMs;
          const formatted = formatDetailedDuration(timeRemaining);
          tooltipText = `Còn ${formatted}`;
        }
        // Event has ended
        else {
          const timeSinceEnd = nowMs - endMs;
          const formatted = formatDetailedDuration(timeSinceEnd);
          tooltipText = `Kết thúc ${formatted}`;
        }

        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);

        // Update tooltip position based on mouse event or centered
        function updateTooltipPosition(e) {
          if (e) {
            // Mouse event: follow cursor
            const leftPos = e.clientX + window.scrollX + 10;
            const topPos =
              e.clientY + window.scrollY - tooltip.offsetHeight - 10;
            tooltip.style.left = `${Math.max(4, leftPos)}px`;
            tooltip.style.top = `${Math.max(4, topPos)}px`;
          } else {
            // No event: center above event block
            const rect = evDiv.getBoundingClientRect();
            const leftPos =
              rect.left +
              window.scrollX +
              rect.width / 2 -
              tooltip.offsetWidth / 2;
            const topPos = rect.top + window.scrollY - tooltip.offsetHeight - 6;
            tooltip.style.left = `${Math.max(4, leftPos)}px`;
            tooltip.style.top = `${Math.max(4, topPos)}px`;
          }
        }

        // Position initially
        updateTooltipPosition(mouseEvent);

        // Keep reference for removal
        evDiv._tooltip = tooltip;
        evDiv._updateTooltipPos = updateTooltipPosition;
      }

      function hideTooltip() {
        if (evDiv._tooltip) {
          evDiv._tooltip.remove();
          evDiv._tooltip = null;
        }
        evDiv._updateTooltipPos = null;
      }

      // Desktop: hover tooltip - follows mouse
      evDiv.addEventListener("mouseenter", (e) => showTooltip(e));
      evDiv.addEventListener("mousemove", (e) => {
        if (evDiv._updateTooltipPos) {
          evDiv._updateTooltipPos(e);
        }
      });
      evDiv.addEventListener("mouseleave", hideTooltip);

      // Mobile: tap to show tooltip, double-tap to open panel
      let tapCount = 0;
      let tapTimeout;
      let isFromTouch = false;

      evDiv.addEventListener("touchstart", (e) => {
        e.stopPropagation();
        isFromTouch = true;
        tapCount++;

        if (tapCount === 1) {
          // Single tap: show tooltip at tap position
          const touch = e.touches[0];
          const touchEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY
          };
          tapTimeout = setTimeout(() => {
            showTooltip(touchEvent); // Pass touch position, not null
            tapCount = 0;
          }, 200);
        } else if (tapCount === 2) {
          // Double tap: open event panel
          clearTimeout(tapTimeout);
          hideTooltip();
          openEventPanel(ev);
          tapCount = 0;
        }
      });

      // Prevent click event on mobile (touchstart already handled)
      evDiv.addEventListener("click", (evClick) => {
        if (isFromTouch) {
          isFromTouch = false;
          return;
        }
        evClick.stopPropagation();
        // Desktop: click to open panel
        openEventPanel(ev);
      });

      eventsLayer.appendChild(evDiv);
    });

    // adjust eventsLayer height based on number of rows (single-row-per-event)
    eventsLayer.style.minHeight = `${Math.max(1, docs.length) * 36}px`;
    
    // Initial call to update sticky positioning
    updateEventTextSticky();
    
    // Add scroll listener to handle sticky positioning for event text
    timelineInner.addEventListener("scroll", () => {
      updateEventTextSticky();
    });
    
    // Add wheel event listener to enable horizontal scroll with mouse wheel
    // Also support Ctrl+wheel for zoom the event layer
    timelineInner.addEventListener("wheel", (e) => {
      if (e.ctrlKey) {
        // Ctrl + wheel = zoom event layer
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        currentZoomLevel = Math.max(50, Math.min(200, currentZoomLevel + delta));
        updateZoom();
      } else {
        // Regular wheel = horizontal scroll
        e.preventDefault();
        timelineInner.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  } catch (err) {
    console.error("Error rendering timeline", err);
  }
}

// Function to update sticky positioning of event text
function updateEventTextSticky() {
  const timelineInner = document.getElementById("timeline-inner");
  const allEventBlocks = document.querySelectorAll(".event-block");
  
  allEventBlocks.forEach((eventBlock) => {
    const eventText = eventBlock.querySelector(".event-text");
    if (!eventText) return;
    
    // Get viewport (timeline-inner) boundaries
    const timelineRect = timelineInner.getBoundingClientRect();
    const viewportLeft = timelineRect.left;
    const viewportRight = timelineRect.right;
    
    // Get event block position and dimensions
    const blockRect = eventBlock.getBoundingClientRect();
    const blockLeft = blockRect.left;
    const blockRight = blockRect.right;
    const blockWidth = blockRect.width;
    
    // Get event text width
    const textRect = eventText.getBoundingClientRect();
    const textWidth = textRect.width;
    
    // Calculate max offset: how much text can shift while staying in block
    // Account for padding (6px each side) = 12px total
    const paddingLeft = 3;
    const maxShiftRange = blockWidth - paddingLeft - 10; // 10px safety margin
    
    // Max translateX should not exceed (blockWidth - textWidth) to keep text visible
    const maxTranslateX = Math.max(0, blockWidth - textWidth -10);
    
    // Calculate offset based on block position relative to viewport
    let offsetLeft = 0;
    
    // Check if block extends beyond left edge of viewport
    if (blockLeft < viewportLeft) {
      // Block is cut off on the left side
      const overshoot = viewportLeft - blockLeft;
      // Text shifts right, max = maxShiftRange
      offsetLeft = Math.min(overshoot, maxShiftRange);
    }
    // Check if block extends beyond right edge of viewport
    else if (blockRight > viewportRight) {
      // Block is cut off on the right side
      const overshoot = blockRight - viewportRight;
      // Text shifts left, max = -maxShiftRange
      offsetLeft = -Math.min(overshoot, maxShiftRange);
    }
    
    // Ensure offsetLeft is never negative (min = 0) and never exceeds maxTranslateX
    offsetLeft = Math.max(0, Math.min(offsetLeft, maxTranslateX));
    
    // Apply transform to position text
    eventText.style.transform = `translateX(${offsetLeft}px)`;
  });
}

// load persisted range (if any) then initial render
loadRangeFromStorage();
renderTimeline();

// helper to format a Date to `YYYY-MM-DDTHH:MM` for datetime-local inputs
function formatForInput(d) {
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

// format duration in ms to human-readable like "1h 23m 5s"
function formatDuration(ms) {
  const sign = ms < 0 ? -1 : 1;
  ms = Math.abs(ms);
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts = [];
  if (h) parts.push(h + "h");
  if (m) parts.push(m + "m");
  parts.push(s + "s");
  return (sign < 0 ? "-" : "") + parts.join(" ");
}

// Format duration with days, hours, minutes for tooltips
function formatDetailedDuration(ms, showDays = true) {
  const sign = ms < 0 ? -1 : 1;
  ms = Math.abs(ms);
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / (24 * 3600));
  const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);

  const parts = [];
  if (showDays && days > 0) parts.push(days + " ngày");
  if (hours > 0 || days > 0) parts.push(hours + " giờ");
  parts.push(minutes + " phút");

  return (sign < 0 ? "-" : "") + parts.join(", ");
}

// Open centered event panel to view/edit/delete an event
function openEventPanel(ev) {
  // remove any existing panel/backdrop
  const existingBackdrop = document.querySelector(".event-backdrop");
  const existingPanel = document.querySelector(".event-panel");
  if (existingBackdrop) existingBackdrop.remove();
  if (existingPanel) existingPanel.remove();

  const backdrop = document.createElement("div");
  backdrop.className = "event-backdrop";
  const panel = document.createElement("div");
  panel.className = "event-panel";

  // header - show time remaining like tooltip
  const hdr = document.createElement("div");
  hdr.className = "event-panel-header";
  const title = document.createElement("div");
  title.className = "event-panel-title";
  const startDate = ev.start && ev.start.toDate ? ev.start.toDate() : new Date(ev.start);
  const endDate = ev.end && ev.end.toDate ? ev.end.toDate() : new Date(ev.end);
  const now = new Date();
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const nowMs = now.getTime();
  const durationMs = endMs - startMs;
  const durationFormatted = formatDetailedDuration(durationMs);
  
  let tooltipText = "";
  if (nowMs < startMs) {
    const timeUntilStart = startMs - nowMs;
    const formatted = formatDetailedDuration(timeUntilStart);
    tooltipText = `Còn ${formatted} sẽ diễn ra • Thời lượng: ${durationFormatted}`;
  } else if (nowMs < endMs) {
    const timeRemaining = endMs - nowMs;
    const formatted = formatDetailedDuration(timeRemaining);
    tooltipText = `Còn ${formatted}`;
  } else {
    const timeSinceEnd = nowMs - endMs;
    const formatted = formatDetailedDuration(timeSinceEnd);
    tooltipText = `Kết thúc ${formatted}`;
  }
  
  title.textContent = tooltipText;
  const closeBtn = document.createElement("button");
  closeBtn.className = "event-panel-edit";
  closeBtn.textContent = "Đóng";
  hdr.appendChild(title);
  hdr.appendChild(closeBtn);

  // body with fields
  const body = document.createElement("div");
  body.className = "event-panel-body";

  const nameField = document.createElement("div");
  nameField.className = "event-field";
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Tên";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = ev.name || "";
  nameField.appendChild(nameLabel);
  nameField.appendChild(nameInput);

  const startField = document.createElement("div");
  startField.className = "event-field";
  const startLabel = document.createElement("label");
  startLabel.textContent = "Bắt đầu";
  const startInput = document.createElement("input");
  startInput.type = "datetime-local";
  const sDate =
    ev.start && ev.start.toDate ? ev.start.toDate() : new Date(ev.start);
  startInput.value = formatForInput(sDate);
  startField.appendChild(startLabel);
  startField.appendChild(startInput);

  const endField = document.createElement("div");
  endField.className = "event-field";
  const endLabel = document.createElement("label");
  endLabel.textContent = "Kết thúc";
  const endInput = document.createElement("input");
  endInput.type = "datetime-local";
  const eDate = ev.end && ev.end.toDate ? ev.end.toDate() : new Date(ev.end);
  endInput.value = formatForInput(eDate);
  endField.appendChild(endLabel);
  endField.appendChild(endInput);

  const colorField = document.createElement("div");
  colorField.className = "event-field";
  const colorLabel = document.createElement("label");
  colorLabel.textContent = "Màu nền";
  const colorWrapper = document.createElement("div");
  colorWrapper.style.display = "flex";
  colorWrapper.style.gap = "8px";
  colorWrapper.style.alignItems = "center";
  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = ev.color || "#4a90e2";
  colorInput.style.width = "40px";
  colorInput.style.height = "40px";
  colorInput.style.cursor = "pointer";
  const colorPreview = document.createElement("div");
  colorPreview.style.width = "40px";
  colorPreview.style.height = "40px";
  colorPreview.style.backgroundColor = ev.color || "#4a90e2";
  colorPreview.style.borderRadius = "4px";
  colorPreview.style.border = "1px solid #ccc";
  colorInput.addEventListener("input", (e) => {
    colorPreview.style.backgroundColor = e.target.value;
  });
  colorWrapper.appendChild(colorInput);
  colorWrapper.appendChild(colorPreview);
  colorField.appendChild(colorLabel);
  colorField.appendChild(colorWrapper);

  const textColorField = document.createElement("div");
  textColorField.className = "event-field";
  const textColorLabel = document.createElement("label");
  textColorLabel.textContent = "Màu chữ";
  const textColorWrapper = document.createElement("div");
  textColorWrapper.style.display = "flex";
  textColorWrapper.style.gap = "8px";
  textColorWrapper.style.alignItems = "center";
  const textColorInput = document.createElement("input");
  textColorInput.type = "color";
  textColorInput.value = ev.textColor || "#ffffff";
  textColorInput.style.width = "40px";
  textColorInput.style.height = "40px";
  textColorInput.style.cursor = "pointer";
  const textColorPreview = document.createElement("div");
  textColorPreview.style.width = "40px";
  textColorPreview.style.height = "40px";
  textColorPreview.style.backgroundColor = ev.textColor || "#ffffff";
  textColorPreview.style.borderRadius = "4px";
  textColorPreview.style.border = "1px solid #ccc";
  textColorInput.addEventListener("input", (e) => {
    textColorPreview.style.backgroundColor = e.target.value;
  });
  textColorWrapper.appendChild(textColorInput);
  textColorWrapper.appendChild(textColorPreview);
  textColorField.appendChild(textColorLabel);
  textColorField.appendChild(textColorWrapper);

  const gameField = document.createElement("div");
  gameField.className = "event-field";
  const gameLabel = document.createElement("label");
  gameLabel.textContent = "Game?";
  const gameInput = document.createElement("input");
  gameInput.type = "checkbox";
  gameInput.checked = !!ev.isGame;
  gameField.appendChild(gameLabel);
  gameField.appendChild(gameInput);

  // Container for color + game fields in one row
  const colorGameContainer = document.createElement("div");
  colorGameContainer.style.display = "flex";
  colorGameContainer.style.justifyContent = "space-around";
  colorGameContainer.style.gap = "10px";
  colorGameContainer.appendChild(colorField);
  colorGameContainer.appendChild(textColorField);
  colorGameContainer.appendChild(gameField);

  const imageField = document.createElement("div");
  imageField.className = "event-field";
  const imageLabel = document.createElement("label");
  imageLabel.textContent = "URL ảnh";
  const imageInput = document.createElement("input");
  imageInput.type = "text";
  imageInput.value = ev.image || "";
  imageInput.placeholder = "https://example.com/image.jpg";
  imageField.appendChild(imageLabel);
  imageField.appendChild(imageInput);

  const recField = document.createElement("div");
  recField.className = "event-field";
  const recLabel = document.createElement("label");
  recLabel.textContent = "Lặp lại";
  const recSelect = document.createElement("select");
  ["none", "daily", "weekly", "monthly", "yearly", "custom"].forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r === "none" ? "Không lặp" : 
                      r === "daily" ? "Hàng ngày" :
                      r === "weekly" ? "Hàng tuần" :
                      r === "monthly" ? "Hàng tháng" :
                      r === "yearly" ? "Hàng năm" :
                      "Theo khoảng thời gian";
    if ((ev.recurrence || "none") === r) opt.selected = true;
    recSelect.appendChild(opt);
  });
  recField.appendChild(recLabel);
  recField.appendChild(recSelect);

  body.appendChild(nameField);
  body.appendChild(startField);
  body.appendChild(endField);
  body.appendChild(colorGameContainer);
  body.appendChild(imageField);
  body.appendChild(recField);

  // actions
  const actions = document.createElement("div");
  actions.className = "event-panel-actions";
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Lưu";
  const delBtn = document.createElement("button");
  delBtn.textContent = "Xóa";
  actions.appendChild(delBtn);
  actions.appendChild(saveBtn);

  panel.appendChild(hdr);
  panel.appendChild(body);
  panel.appendChild(actions);
  document.body.appendChild(backdrop);
  document.body.appendChild(panel);

  function closePanel() {
    backdrop.remove();
    panel.remove();
  }

  backdrop.addEventListener("click", closePanel);
  closeBtn.addEventListener("click", closePanel);

  // Save updates to Firestore
  saveBtn.addEventListener("click", async () => {
    const newName = nameInput.value.trim();
    const newStart = new Date(startInput.value);
    const newEnd = new Date(endInput.value);
    if (!newName || isNaN(newStart) || isNaN(newEnd) || newEnd < newStart) {
      alert("Vui lòng kiểm tra tên, thời gian bắt đầu/kết thúc.");
      return;
    }
    
    const updated = {
      name: newName,
      start: firebase.firestore.Timestamp.fromDate(newStart),
      end: firebase.firestore.Timestamp.fromDate(newEnd),
      color: colorInput.value,
      textColor: textColorInput.value,
      isGame: !!gameInput.checked,
      recurrence: recSelect.value || "none",
    };
    
    // Calculate custom recurrence interval if selected
    if (recSelect.value === "custom") {
      updated.recurrenceInterval = newEnd.getTime() - newStart.getTime();
    }
    
    // Add image URL if provided
    const newImageUrl = imageInput.value.trim();
    if (newImageUrl) {
      updated.image = newImageUrl;
    }
    
    try {
      if (ev.id) await db.collection("events").doc(ev.id).update(updated);
      closePanel();
      renderTimeline();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu thay đổi.");
    }
  });

  // Delete event
  delBtn.addEventListener("click", async () => {
    if (!ev.id) return;
    if (!confirm("Bạn có chắc muốn xóa sự kiện này?")) return;
    try {
      await db.collection("events").doc(ev.id).delete();
      closePanel();
      renderTimeline();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa sự kiện.");
    }
  });
}
