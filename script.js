import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 Thay config này bằng của bạn
const firebaseConfig = {
      apiKey: "AIzaSyDR8_kXFXR_oWGNptZX_infNrWTm3xbPAM",
      authDomain: "timeline-43aac.firebaseapp.com",
      projectId: "timeline-43aac",
      storageBucket: "timeline-43aac.firebasestorage.app",
      messagingSenderId: "732658035286",
      appId: "1:732658035286:web:40091d26eee343579aa9f7",
    };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const eventsCol = collection(db, "events");

const timeline = document.getElementById("timeline");
const nowLine = document.getElementById("nowLine");
const nowLabel = document.getElementById("nowLabel");
const tooltip = document.getElementById("tooltip");

const startDate = new Date("2025-08-28");
const daysToShow = 14;
const pxPerDay = 150;

// Vẽ trục ngày
for (let i = 0; i < daysToShow; i++) {
  const d = new Date(startDate.getTime() + i * 86400000);
  const el = document.createElement("div");
  el.className = "day";
  el.textContent = d.getDate() + "/" + (d.getMonth() + 1);
  timeline.appendChild(el);
}

// Render sự kiện
function renderEvent(ev, idx) {
  const start = ev.start.toDate();
  const end = ev.end.toDate();
  const left = ((start - startDate) / 86400000) * pxPerDay;
  const width = ((end - start) / 86400000) * pxPerDay;

  const div = document.createElement("div");
  div.className = "event";
  div.style.left = left + "px";
  div.style.top = 50 + idx * 40 + "px";
  div.style.width = width + "px";
  div.textContent = ev.title;

  div.addEventListener("mousemove", e => {
    const now = new Date();
    const diff = end - now;
    if (diff > 0) {
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      tooltip.textContent = `Còn lại ${hrs}h ${mins}m ${secs}s`;
    } else {
      tooltip.textContent = "Đã kết thúc";
    }
    tooltip.style.display = "block";
    tooltip.style.left = (e.pageX + 10) + "px";
    tooltip.style.top = (e.pageY - 20) + "px";
  });
  div.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });

  timeline.appendChild(div);
}

// Realtime load events
onSnapshot(eventsCol, snap => {
  document.querySelectorAll(".event").forEach(e => e.remove());
  let idx = 0;
  snap.forEach(doc => {
    renderEvent(doc.data(), idx++);
  });
});

// Thêm sự kiện
document.getElementById("addBtn").addEventListener("click", async () => {
  const title = document.getElementById("title").value;
  const start = new Date(document.getElementById("start").value);
  const end = new Date(document.getElementById("end").value);
  if (!title || !start || !end) return alert("Nhập đủ thông tin!");

  await addDoc(eventsCol, {
    title,
    start: Timestamp.fromDate(start),
    end: Timestamp.fromDate(end)
  });
});

// Đường chỉ đỏ
function updateNowLine() {
  const now = new Date();
  const dayDiff = (now - startDate) / 86400000;
  const secOfDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const percent = secOfDay / (24 * 3600);
  const left = dayDiff * pxPerDay + percent * pxPerDay;

  nowLine.style.left = left + "px";
  nowLabel.style.left = left + "px";
  nowLabel.textContent = now.toTimeString().split(" ")[0];

  const rect = timeline.getBoundingClientRect();
  const targetScroll = left - rect.width / 2;
  timeline.scrollLeft += (targetScroll - timeline.scrollLeft) * 0.2;
}
setInterval(updateNowLine, 1000);
updateNowLine();
