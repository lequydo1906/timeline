// Firebase config
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

const pxPerDay = Math.floor(window.innerWidth / 14);

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}
function getStartEndDate() {
  const today = getToday();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 0, 0, 0, 0);
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 0, 0, 0, 0);
  return { startDate, endDate };
}
function getDaysCount(startDate, endDate) {
  return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
}

const timeline = document.getElementById('timeline');
const timelineContainer = document.getElementById('timeline-container');

function getDateByIndex(idx, startDate) {
  return new Date(startDate.getTime() + idx * 24 * 60 * 60 * 1000);
}
function getDateIndexFromDate(date, startDate) {
  if (!(date instanceof Date)) date = new Date(date);
  return Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
}
function calcLeftPx(date, startDate) {
  if (!(date instanceof Date)) date = new Date(date);
  const dayIdx = getDateIndexFromDate(date, startDate);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  let px = dayIdx * pxPerDay;
  px += hour * pxPerDay / 24;
  px += minute * pxPerDay / 24 / 60;
  px += second * pxPerDay / 24 / 3600;
  return px;
}

// new helpers: lấy ranh giới ngày (bắt đầu của ngày)
function startOfDay(d) {
  const dt = (d instanceof Date) ? d : new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
}

function getTimeRemaining(endTime) {
  const now = new Date();
  const end = new Date(endTime);
  let diff = end - now;
  if (diff <= 0) return "Đã kết thúc";
  let hrs = Math.floor(diff / (1000 * 60 * 60));
  let mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  let secs = Math.floor((diff % (1000 * 60)) / 1000);
  return `Còn lại ${hrs}h ${mins}m ${secs}s`;
}
function formatTime24h(date) {
  return date.getHours().toString().padStart(2, '0')
    + ':' + date.getMinutes().toString().padStart(2, '0')
    + ':' + date.getSeconds().toString().padStart(2, '0');
}
function scrollToCurrentTime(startDate) {
  const now = new Date();
  const left = calcLeftPx(now, startDate);
  timelineContainer.scrollLeft = left - timelineContainer.clientWidth / 2 + pxPerDay;
}

// Thêm helper để format giá trị datetime-local từ ISO
function toInputDatetimeLocal(iso) {
	return new Date(iso).toISOString().slice(0,16);
}

function renderTimeline(events) {
  const { startDate, endDate } = getStartEndDate();
  const daysCount = getDaysCount(startDate, endDate);
  timeline.innerHTML = "";
  timeline.style.width = (daysCount * pxPerDay) + "px";

  // Đường kẻ dọc + số ngày nằm trên đầu đường kẻ
  for (let i = 0; i < daysCount; i++) {
    const date = getDateByIndex(i, startDate);

    // Đường kẻ dọc ngày tại đúng vị trí 0h
    const line = document.createElement('div');
    line.className = "timeline-day-line";
    line.style.position = "absolute";
    line.style.left = (i * pxPerDay) + "px";
    line.style.top = "40px";
    line.style.height = "460px";
    line.style.width = "1px";
    timeline.appendChild(line);

    // Số ngày nằm trên đầu đường kẻ
    const num = document.createElement('div');
    num.className = "date-col";
    num.style.position = 'absolute';
    num.style.left = (i * pxPerDay - 15) + 'px'; // Canh giữa số với đường kẻ
    num.style.top = "0px";
    num.innerText = date.getDate();
    timeline.appendChild(num);
  }

  // Đường chỉ thời gian hiện tại (24h format)
  function renderCurrentTimeBar() {
    const now = new Date();
    const left = calcLeftPx(now, startDate);
    let currentTimeRow = timeline.querySelector('.current-time-row');
    if (!currentTimeRow) {
      currentTimeRow = document.createElement('div');
      currentTimeRow.className = "current-time-row";
      timeline.appendChild(currentTimeRow);
    }
    currentTimeRow.style.left = left + "px";
    currentTimeRow.style.top = "40px";
    currentTimeRow.style.width = "2px";
    currentTimeRow.style.height = "460px";
    currentTimeRow.innerHTML = `<div class="current-time-line"></div>
      <div class="current-time-label" style="top:-32px;left:-40px;">${formatTime24h(now)}</div>`;
    scrollToCurrentTime(startDate);
  }
  renderCurrentTimeBar();
  if (window.__timelineTimer) clearInterval(window.__timelineTimer);
  window.__timelineTimer = setInterval(renderCurrentTimeBar, 1000);

  // Event-bar
  timeline.querySelectorAll(".event-bar").forEach(e => e.remove());
  document.querySelectorAll('.event-tooltip').forEach(el => el.remove());
  events.forEach((ev, idx) => {
    const start = ev.startTime ? new Date(ev.startTime) : new Date(ev.start);
    const end = ev.endTime ? new Date(ev.endTime) : new Date(ev.end || ev.start);

    // Clamp vào trong phạm vi timeline để không vượt ngoài ngày diễn ra sự kiện
    // NOTE: tính chiều dài dựa trên "ngày" — bắt đầu từ 00:00 của ngày bắt đầu,
    // và kết thúc tại 00:00 của ngày kết thúc (không cộng thêm cả ngày).
    const rawLeft = calcLeftPx(startOfDay(start), startDate);
    const rawRight = calcLeftPx(startOfDay(end), startDate);

    const minLeft = 0;
    const maxRight = daysCount * pxPerDay;
    const left = Math.max(minLeft, Math.min(rawLeft, maxRight));
    const right = Math.max(minLeft, Math.min(rawRight, maxRight));
    const width = Math.max(right - left, 4);

    const bar = document.createElement('div');
    bar.className = `event-bar ${ev.color || ""}`;
    bar.style.left = left + "px";
    bar.style.top = (60 + idx * 44) + "px";
    bar.style.width = width + "px";
    bar.style.height = "36px";

    // Nội dung: tên + thời gian (ẩn mặc định) + nút sửa/xóa (ẩn mặc định, hiện khi hover)
    bar.innerHTML = `<div class="event-title">${ev.name}</div>
      <span class="time-info" style="margin-left:8px;font-size:0.9em;">
        ${start.getDate()}/${start.getMonth()+1} ${formatTime24h(start)}
        - ${end.getDate()}/${end.getMonth()+1} ${formatTime24h(end)}
      </span>
      <button class="edit-btn" title="Sửa" onclick="(function(ev){ return function(e){ e.stopPropagation(); startEditEvent(ev); }})(JSON.parse('${JSON.stringify({ id: ev.id, name: ev.name, color: ev.color, startTime: ev.startTime || ev.start, endTime: ev.endTime || ev.end })}'))(event)">Sửa</button>
      <button class="delete-btn" onclick="(function(id){ return function(e){ e.stopPropagation(); if(confirm('Xóa sự kiện?')) deleteEvent(id); }} )('${ev.id}')(event)">Xóa</button>`;

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = "event-tooltip";
    tooltip.style.display = "none";
    document.body.appendChild(tooltip);

    bar.onmousemove = function(e) {
      tooltip.innerText = getTimeRemaining(end);
      tooltip.style.left = (e.pageX + 12) + "px";
      tooltip.style.top = (e.pageY - 10) + "px";
      tooltip.style.display = "block";
    };
    bar.onmouseleave = function() {
      tooltip.style.display = "none";
    };

    timeline.appendChild(bar);
  });
}

// Firestore realtime
db.collection("events").onSnapshot(snap => {
  const events = [];
  const now = new Date();
  snap.forEach(doc => {
    const data = { id: doc.id, ...doc.data() };
    const endTime = data.endTime || data.end || data.start;
    if (endTime) {
      const end = new Date(endTime);
      // Nếu đã kết thúc >24h thì xóa tự động
      if (now - end > 24 * 60 * 60 * 1000) {
        doc.ref.delete().catch(()=>{});
        return; // skip pushing this event
      }
    }
    events.push(data);
  });
  // Sắp xếp theo thời gian còn lại (nhỏ -> lớn)
  events.sort((a,b) => {
    const na = new Date(a.endTime || a.end || a.start) - new Date();
    const nb = new Date(b.endTime || b.end || b.start) - new Date();
    return na - nb;
  });
  renderTimeline(events);
});

// Thêm hỗ trợ sửa/cancel cho form
const editIdInput = document.createElement('input');
editIdInput.type = 'hidden';
editIdInput.id = 'editId';
document.getElementById('eventForm').appendChild(editIdInput);

const cancelBtn = document.createElement('button');
cancelBtn.type = 'button';
cancelBtn.id = 'cancelEdit';
cancelBtn.style.display = 'none';
cancelBtn.textContent = 'Hủy';
document.getElementById('eventForm').appendChild(cancelBtn);

cancelBtn.onclick = () => {
  document.getElementById('eventForm').reset();
  editIdInput.value = '';
  cancelBtn.style.display = 'none';
  document.querySelector('#eventForm button[type="submit"]').textContent = 'Thêm sự kiện';
};

// Thêm helper để set form từ event khi edit
function startEditEvent(ev) {
  document.getElementById('name').value = ev.name || '';
  document.getElementById('color').value = ev.color || 'red';
  if (ev.startTime || ev.start) document.getElementById('startTime').value = toInputDatetimeLocal(ev.startTime || ev.start);
  if (ev.endTime || ev.end) document.getElementById('endTime').value = toInputDatetimeLocal(ev.endTime || ev.end);
  editIdInput.value = ev.id;
  document.querySelector('#eventForm button[type="submit"]').textContent = 'Lưu thay đổi';
  cancelBtn.style.display = 'inline-block';
}

// Thêm event
document.getElementById('eventForm').onsubmit = function(e) {
  e.preventDefault();
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

  const data = {
    name: document.getElementById('name').value,
    color: document.getElementById('color').value,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    duration
  };

  const editId = document.getElementById('editId').value;
  if (editId) {
    db.collection("events").doc(editId).update(data).then(() => {
      document.getElementById('eventForm').reset();
      document.getElementById('editId').value = '';
      document.querySelector('#eventForm button[type="submit"]').textContent = 'Thêm sự kiện';
      cancelBtn.style.display = 'none';
    });
  } else {
    db.collection("events").add(data).then(() => {
      document.getElementById('eventForm').reset();
    });
  }
};

// Xóa event
function deleteEvent(id) {
  db.collection("events").doc(id).delete();
}
// Xóa event
function deleteEvent(id) {
  db.collection("events").doc(id).delete();
}

