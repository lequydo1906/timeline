
// ==== Firebase config ====
const firebaseConfig = {
    apiKey: "AIzaSyDR8_kXFXR_oWGNptZX_infNrWTm3xbPAM",
    authDomain: "timeline-43aac.firebaseapp.com",
    projectId: "timeline-43aac",
    storageBucket: "timeline-43aac.firebasestorage.app",
    messagingSenderId: "732658035286",
    appId: "1:732658035286:web:40091d26eee343579aa9f7",
    measurementId: "G-5BRCYENZ6P"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==== Elements ====
const timeline = document.getElementById("timeline");
const nowLine = document.getElementById("nowLine");
const nowLabel = document.getElementById("nowLabel");
const tooltip = document.getElementById("tooltip");

const pxPerDay = 150;
const daysToShow = 30;
const startDate = new Date();
startDate.setHours(0,0,0,0);

// ==== Draw days ====
for(let i=0;i<daysToShow;i++){
  const d = new Date(startDate.getTime() + i*86400000);
  const div = document.createElement("div");
  div.className = "day";
  div.innerText = d.getDate()+"/"+(d.getMonth()+1);
  timeline.appendChild(div);
}

// ==== Update red line ====
function updateNowLine(){
  const now = new Date();
  const dayDiff = Math.floor((now - startDate) / 86400000);
  const secOfDay = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  const percent = secOfDay / 86400;
  const left = dayDiff * pxPerDay + percent*pxPerDay;

  nowLine.style.left = left + "px";
  nowLabel.style.left = left + "px";
  nowLabel.textContent = now.toTimeString().slice(0,8);

  // auto scroll
  const rect = timeline.getBoundingClientRect();
  const target = left - rect.width/2;
  timeline.scrollLeft += (target - timeline.scrollLeft)*0.2;
}
setInterval(updateNowLine, 1000);

// ==== CRUD ====
function addEvent(){
  const title=document.getElementById("title").value;
  const start=new Date(document.getElementById("start").value);
  const end=new Date(document.getElementById("end").value);
  if(!title||!start||!end) return alert("Điền đủ thông tin");
  db.collection("events").add({title,start:start.getTime(),end:end.getTime()});
}

// ==== Render events ====
function renderEvents(events){
  document.querySelectorAll(".event").forEach(e=>e.remove());
  // sort theo duration
  events.sort((a,b)=> (a.end-a.start) - (b.end-b.start));
  events.forEach((ev,idx)=>{
    const left = (ev.start-startDate)/86400000*pxPerDay;
    const width = (ev.end-ev.start)/86400000*pxPerDay;
    const div=document.createElement("div");
    div.className="event";
    div.style.left=left+"px";
    div.style.top=(40+idx*30)+"px";
    div.style.width=width+"px";
    div.textContent=ev.title;
    // tooltip
    div.onmouseenter=(e)=>{
      const remain = ev.end - Date.now();
      tooltip.style.display="block";
      tooltip.style.left=e.pageX+"px";
      tooltip.style.top=e.pageY-20+"px";
      tooltip.textContent = remain>0 ? 
        "Còn "+Math.floor(remain/1000/60)+" phút" : "Đã kết thúc";
    };
    div.onmouseleave=()=>tooltip.style.display="none";
    // click -> xóa
    div.onclick=()=>{ if(confirm("Xóa sự kiện?")) db.collection("events").doc(ev.id).delete(); }
    document.body.appendChild(div);
  });
}

// ==== Firestore realtime sync ====
db.collection("events").onSnapshot(snap=>{
  const arr=[];
  snap.forEach(doc=> arr.push({...doc.data(),id:doc.id}));
  renderEvents(arr);
});

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

