// Bước 1: Thay thế thông tin cấu hình Firebase của bạn vào đây
// Bạn có thể tìm thấy thông tin này trong phần Cài đặt dự án của Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDR8_kXFXR_oWGNptZX_infNrWTm3xbPAM",
    authDomain: "timeline-43aac.firebaseapp.com",
    projectId: "timeline-43aac",
    storageBucket: "timeline-43aac.firebasestorage.app",
    messagingSenderId: "732658035286",
    appId: "1:732658035286:web:40091d26eee343579aa9f7",
    measurementId: "G-5BRCYENZ6P"
  };

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Lấy các phần tử DOM
const timelineEl = document.getElementById('timeline');
const eventForm = document.getElementById('event-form');
const eventNameInput = document.getElementById('event-name');
const eventStartInput = document.getElementById('event-start');
const eventEndInput = document.getElementById('event-end');

// Bước 2: Hàm để thêm sự kiện vào Firebase
const addEvent = async (event) => {
    event.preventDefault();

    const name = eventNameInput.value;
    const start = eventStartInput.value;
    const end = eventEndInput.value;

    if (!name || !start || !end) {
        alert("Vui lòng điền đầy đủ thông tin sự kiện.");
        return;
    }

    try {
        await db.collection("events").add({
            name: name,
            start_time: new Date(start),
            end_time: new Date(end)
        });
        console.log("Sự kiện đã được thêm thành công!");
    } catch (e) {
        console.error("Lỗi khi thêm sự kiện: ", e);
    }
    
    eventForm.reset();
};

// Bước 3: Hàm để xóa sự kiện khỏi Firebase
const deleteEvent = async (eventId) => {
    try {
        await db.collection("events").doc(eventId).delete();
        console.log("Sự kiện đã được xóa thành công!");
    } catch (e) {
        console.error("Lỗi khi xóa sự kiện: ", e);
    }
};

// Bước 4: Hàm để vẽ các sự kiện lên giao diện
const renderEvents = (events) => {
    timelineEl.innerHTML = '';
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    events.forEach(event => {
        const eventEl = document.createElement('div');
        eventEl.className = 'timeline-event';
        eventEl.dataset.id = event.id;

        // Tính toán vị trí và chiều rộng dựa trên thời gian
        const startTime = event.start_time.toDate();
        const endTime = event.end_time.toDate();
        const startHour = (startTime.getTime() - startOfDay.getTime()) / (1000 * 60 * 60);
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

        eventEl.style.left = `${(startHour / 24) * 100}%`;
        eventEl.style.width = `${(durationHours / 24) * 100}%`;
        
        // Thêm nội dung và nút xóa
        eventEl.innerHTML = `
            <span class="event-name">${event.name}</span>
            <button class="delete-btn" onclick="deleteEvent('${event.id}')">X</button>
        `;
        timelineEl.appendChild(eventEl);
    });
};

// Bước 5: Lắng nghe sự thay đổi của dữ liệu trong Firestore
db.collection("events").onSnapshot((snapshot) => {
    const events = [];
    snapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
    });
    // Sắp xếp sự kiện theo thời gian bắt đầu
    events.sort((a, b) => a.start_time.toDate() - b.start_time.toDate());
    renderEvents(events);
});

// Gán hàm addEvent cho form
eventForm.addEventListener('submit', addEvent);