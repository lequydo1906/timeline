// ==================== Firebase Config ====================
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
const eventsCol = db.collection("events");

// ==================== Timeline Setup ====================
const timeline = document.getElementById("timeline");
const nowLine = document.getElementById("now-line");
const nowLabel = document.getElementById("now-label");

// mỗi ngày chiếm bao nhiêu pixel
const pxPerDay = 200;

// lấy ngày hiện tại
const today = new Date();

// mốc bắt đầu = 15 ngày trước
const startDate = new Date(today);
startDate.setHours(0, 0, 0, 0);
startDate.setDate(today.getDate() - 15);

// mốc kết thúc = 15 ngày sau
const endDate = new Date(today);
endDate.setHours(23, 59, 59, 999);
endDate.setDate(today.getDate() + 15);

// ==================== Draw Day Markers ====================
function renderDayMarkers() {
  let day = new Date(startDate);
  while (day <= endDate) {
    const left = (day - startDate) / 86400000 * pxPerDay;

    const marker = document.createElement("div");
    marker.className = "day-marker";
    marker.style.left = left + "px";

    const label = document.createElement("div");
    label.className = "day-label";
    label.textContent =
      day.getDate().toString().padStart(2, "0") +
      "/" +
      (day.getMonth() + 1).toString().padStart(2, "0");

    marker.appendChild(label);
    timeline.appendChild(marker);

    day.setDate(day.getDate() + 1);
  }
}
renderDayMarkers();

// ==================== Render Event ====================
function renderEvent(ev, idx) {
  const start = ev.start.toDate();
  const end = ev.end.toDate();

  // chỉ hiển thị sự kiện trong khoảng 15 ngày trước/sau
  if (start < startDate || start > endDate) return;

  const left = (start - startDate) / 86400000 * pxPerDay;

  const el = document.createElement("div");
  el.className = "event";
  el.style.left = left + "px";
  el.textContent = ev.title;

  // tooltip khi hover => thời gian chi tiết
  el.title =
    "Bắt đầu: " + start.toLocaleString() + "\nKết thúc: " + end.toLocaleString();

  timeline.appendChild(el);
}

// ==================== Load Events Realtime ====================
eventsCol.orderBy("start").onSnapshot((snap) => {
  // xoá sự kiện cũ trước khi render lại
  document.querySelectorAll(".event").forEach((e) => e.remove());

  let idx = 0;
  snap.forEach((doc) => {
    renderEvent(doc.data(), idx++);
  });
});

// ==================== Add New Event ====================
document.getElementById("save").onclick = async () => {
  const title = document.getElementById("title").value;
  const startInput = document.getElementById("start").value;
  const endInput = document.getElementById("end").value;

  if (!title || !startInput || !endInput) {
    alert("Vui lòng nhập đầy đủ thông tin sự kiện!");
    return;
  }

  const start = new Date(startInput);
  const end = new Date(endInput);

  await eventsCol.add({
    title,
    start,
    end,
  });

  // reset form
  document.getElementById("title").value = "";
  document.getElementById("start").value = "";
  document.getElementById("end").value = "";
};

// ==================== Update Red Now Line ====================
function updateNowLine() {
  const now = new Date();

  // vị trí tính theo ngày từ startDate
  const diff = (now - startDate) / 86400000;
  const left = diff * pxPerDay;

  nowLine.style.left = left + "px";
  nowLabel.style.left = left + "px";

  const timeStr =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0") +
    ":" +
    now.getSeconds().toString().padStart(2, "0");

  nowLabel.textContent = timeStr;
}

setInterval(updateNowLine, 1000);
updateNowLine();
