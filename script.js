
// ==== Firebase Config (thay bằng config của bạn) ====
const firebaseConfig = {
    apiKey: "AIzaSyDR8_kXFXR_oWGNptZX_infNrWTm3xbPAM",
    authDomain: "timeline-43aac.firebaseapp.com",
    projectId: "timeline-43aac",
    storageBucket: "timeline-43aac.firebasestorage.app",
    messagingSenderId: "732658035286",
    appId: "1:732658035286:web:40091d26eee343579aa9f7",
    measurementId: "G-5BRCYENZ6P"
  };

// Init Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

// ==== Timeline ====
var items = new vis.DataSet([]);
var container = document.getElementById('timeline');
var options = { stack: false, showCurrentTime: true, orientation: 'top' };
var timeline = new vis.Timeline(container, items, options);

var form = document.getElementById('eventForm');
var eventList = document.getElementById('eventList');

// Render danh sách
function renderList(events) {
  eventList.innerHTML = "";
  events.sort((a, b) => new Date(a.start) - new Date(b.start));
  events.forEach(ev => {
    let li = document.createElement('li');
    li.innerHTML = `
      <span style="color:${ev.color}">${ev.content} (${ev.start} → ${ev.end})</span>
      <div>
        <button onclick="editEvent('${ev.id}')">Sửa</button>
        <button onclick="deleteEvent('${ev.id}')">Xóa</button>
      </div>
    `;
    eventList.appendChild(li);
  });
}

// Load dữ liệu Firestore realtime
db.collection("events").onSnapshot(snapshot => {
  let allEvents = [];
  items.clear();
  snapshot.forEach(doc => {
    let ev = doc.data();
    ev.id = doc.id;
    allEvents.push(ev);
    items.add({
      id: ev.id,
      content: ev.content,
      start: ev.start,
      end: ev.end,
      style: `background-color:${ev.color}; color:white;`,
      color: ev.color
    });
  });
  renderList(allEvents);
});

// Thêm / Cập nhật sự kiện
form.addEventListener('submit', async function(e) {
  e.preventDefault();
  let id = document.getElementById('eventId').value;
  let name = document.getElementById('eventName').value;
  let start = document.getElementById('startDate').value;
  let end = document.getElementById('endDate').value;
  let color = document.getElementById('color').value;

  let eventData = { content: name, start, end, color };

  if (id) {
    await db.collection("events").doc(id).set(eventData);
  } else {
    await db.collection("events").add(eventData);
  }

  form.reset();
  document.getElementById('eventId').value = "";
});

// Sửa sự kiện
async function editEvent(id) {
  let docRef = await db.collection("events").doc(id).get();
  let ev = docRef.data();
  document.getElementById('eventId').value = id;
  document.getElementById('eventName').value = ev.content;
  document.getElementById('startDate').value = ev.start;
  document.getElementById('endDate').value = ev.end;
  document.getElementById('color').value = ev.color;
}

// Xóa sự kiện
async function deleteEvent(id) {
  await db.collection("events").doc(id).delete();
}
