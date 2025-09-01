// ⚡ Firebase config (thay bằng của bạn)
const firebaseConfig = {
      apiKey: "AIzaSyDR8_kXFXR_oWGNptZX_infNrWTm3xbPAM",
      authDomain: "timeline-43aac.firebaseapp.com",
      projectId: "timeline-43aac",
    };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const eventsCol = db.collection("events");

// timeline setup
const timeline = document.getElementById("timeline");
const nowLine = document.getElementById("now-line");
const nowLabel = document.getElementById("now-label");

const pxPerDay = 200;
const startDate = new Date("2025-08-28");

// render 1 event
function renderEvent(ev, idx) {
  const start = ev.start.toDate();
  const left = (start - startDate) / 86400000 * pxPerDay;
  const el = document.createElement("div");
  el.className = "event";
  el.style.left = left + "px";
  el.textContent = ev.title;
  timeline.appendChild(el);
}

// load realtime từ Firestore
eventsCol.orderBy("start").onSnapshot(snap => {
  document.querySelectorAll(".event").forEach(e => e.remove());
  let idx = 0;
  snap.forEach(doc => renderEvent(doc.data(), idx++));
});

// thêm sự kiện
document.getElementById("save").onclick = async () => {
  const title = document.getElementById("title").value;
  const start = new Date(document.getElementById("start").value);
  const end = new Date(document.getElementById("end").value);
  await eventsCol.add({ title, start, end });
};

// update đường đỏ
function updateNowLine() {
  const now = new Date();
  const diff = (now - startDate) / 86400000;
  const left = diff * pxPerDay;

  nowLine.style.left = left + "px";
  nowLabel.style.left = left + "px";

  const timeStr =
    now.getHours().toString().padStart(2,"0") + ":" +
    now.getMinutes().toString().padStart(2,"0") + ":" +
    now.getSeconds().toString().padStart(2,"0");

  nowLabel.textContent = timeStr;
}
setInterval(updateNowLine, 1000);
updateNowLine();
