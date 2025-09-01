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
const wrapper = document.getElementById("timeline-wrapper");
const timeline = document.getElementById("timeline");
const nowLine = document.getElementById("now-line");
const nowLabel = document.getElementById("now-label");

// Cấu hình trục ngày
const pxPerDay = 200;                         // mỗi ngày = 200px
const msPerDay = 24 * 60 * 60 * 1000;
const pxPerMs = pxPerDay / msPerDay;

// Khoảng hiển thị: từ 15 ngày trước đến 15 ngày sau hôm nay
const today = new Date();

const startDate = new Date(today);
startDate.setHours(0, 0, 0, 0);
startDate.setDate(today.getDate() - 15);

const endDate = new Date(today);
endDate.setHours(23, 59, 59, 999);
endDate.setDate(today.getDate() + 15);

// set width cho timeline theo tổng số ngày hiển thị
const totalDays = Math.ceil((endDate - startDate) / msPerDay) + 1;
timeline.style.width = totalDays * pxPerDay + "px";

// ==================== Vẽ vạch & nhãn từng ngày ====================
function renderDayMarkers() {
  // clear marker cũ (nếu có)
  timeline.querySelectorAll(".day-marker").forEach(n => n.remove());

  let day = new Date(startDate);
  while (day <= endDate) {
    const left = (day - startDate) * pxPerMs;

    const marker = document.createElement("div");
    marker.className = "day-marker";
    marker.style.left = left + "px";

    const label = document.createElement("div");
    label.className = "day-label";
    const dd = day.getDate().toString().padStart(2, "0");
    const mm = (day.getMonth() + 1).toString().padStart(2, "0");

    // Ví dụ hiển thị: 01/09 (T2)
    const dow = ["CN","T2","T3","T4","T5","T6","T7"][day.getDay()];
    label.textContent = `${dd}/${mm} (${dow})`;

    // đặt label vào đúng vị trí (giữa vạch)
    label.style.left = "0px"; // vì parent là marker có left rồi
    marker.appendChild(label);
    timeline.appendChild(marker);

    day.setDate(day.getDate() + 1);
  }
}
renderDayMarkers();

// ==================== Render Event ====================
const EVENT_TOP_BASE = 70;     // bắt đầu hiển thị event sau vùng nhãn
const EVENT_ROW_H = 28;        // mỗi hàng cao 28px
const MAX_ROWS = 8;            // số hàng tối đa (có thể tăng nếu nhiều sự kiện)

function renderEvent(ev, idx) {
  // Firestore Timestamp -> Date
  const start = ev.start.toDate ? ev.start.toDate() : new Date(ev.start);
  const end = ev.end?.toDate ? ev.end.toDate() : (ev.end ? new Date(ev.end) : null);

  // bỏ qua nếu hoàn toàn ngoài khoảng hiển thị
  const effectiveEnd = end ?? start;
  if (effectiveEnd < startDate || start > endDate) return;

  const left = (start - startDate) * pxPerMs;
  const width = Math.max(((effectiveEnd - start) || (60 * 60 * 1000)) * pxPerMs, 6); // mặc định 1h nếu thiếu end

  const el = document.createElement("div");
  el.className = "event";
  el.style.left = left + "px";
  el.style.top = (EVENT_TOP_BASE + (idx % MAX_ROWS) * EVENT_ROW_H) + "px";
  el.style.width = width + "px";
  el.textContent = ev.title || "(Không tiêu đề)";

  el.title = `Bắt đầu: ${start.toLocaleString()}${end ? `\nKết thúc: ${end.toLocaleString()}` : ""}`;

  timeline.appendChild(el);
}

// ==================== Load Events Realtime ====================
eventsCol.orderBy("start").onSnapshot((snap) => {
  // xoá sự kiện cũ trước khi render lại
  timeline.querySelectorAll(".event").forEach((e) => e.remove());

  let idx = 0;
  snap.forEach((doc) => renderEvent(doc.data(), idx++));
});

// ==================== Add New Event ====================
document.getElementById("save").onclick = async () => {
  const title = document.getElementById("title").value.trim();
  const startInput = document.getElementById("start").value;
  const endInput = document.getElementById("end").value;

  if (!title || !startInput) {
    alert("Vui lòng nhập ít nhất tiêu đề và thời điểm bắt đầu!");
    return;
  }

  const start = new Date(startInput);
  const end = endInput ? new Date(endInput) : null;

  try {
    await eventsCol.add({ title, start, ...(end ? { end } : {}) });

    // reset form
    document.getElementById("title").value = "";
    document.getElementById("start").value = "";
    document.getElementById("end").value = "";
  } catch (e) {
    console.error(e);
    alert("Không thể lưu sự kiện. Kiểm tra console để biết chi tiết.");
  }
};

// ==================== Now Line ====================
function updateNowLine(scrollIntoView = false) {
  const now = new Date();
  const left = (now - startDate) * pxPerMs;

  nowLine.style.left = left + "px";
  nowLabel.style.left = left + "px";
  nowLabel.textContent = now
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (scrollIntoView) {
    const target = left - wrapper.clientWidth / 2;
    const maxScroll = timeline.scrollWidth - wrapper.clientWidth;
    wrapper.scrollLeft = Math.max(0, Math.min(target, maxScroll));
  }
}

// realtime cập nhật mỗi giây
setInterval(updateNowLine, 1000);
updateNowLine(true);

// nút "Hôm nay" để cuộn tới now-line
document.getElementById("goto-today").addEventListener("click", () => updateNowLine(true));

// re-render marker nếu resize (đề phòng khi kích thước ảnh hưởng layout)
window.addEventListener("resize", () => {
  renderDayMarkers();
  updateNowLine(false);
});
