(() => {
  const KEY = "preptrack.v1";
  const $ = (id) => document.getElementById(id);
  const today = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('input[type="date"]').forEach((el) => el.value = today);

  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '{"sessions":[],"mocks":[]}');
      if (!Array.isArray(value.sessions) || !Array.isArray(value.mocks)) throw new Error("Invalid data");
      return value;
    } catch { return { sessions: [], mocks: [] }; }
  }
  let data = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(data));
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const accuracy = (m) => {
    const attempted = Number(m.correct) + Number(m.wrong);
    return attempted ? (Number(m.correct) / attempted) * 100 : 0;
  };
 
function render() {
  $("sessionCount").textContent = data.sessions.length;
  $("studyHours").textContent = (data.sessions.reduce((s,x)=>s+Number(x.minutes),0)/60).toFixed(1);
  $("mockCount").textContent = data.mocks.length;
  $("avgAccuracy").textContent = data.mocks.length ? (data.mocks.reduce((s,m)=>s+accuracy(m),0)/data.mocks.length).toFixed(1)+"%" : "—";

  renderList("sessions", data.sessions, "session");
  renderList("mocks", data.mocks, "mock");
  renderSubjectSummary();
}


function renderSubjectSummary() {
  const node = $("subjectSummary");
  const subjects = {};

  data.sessions.forEach(session => {
    const subject = (session.subject || "Unspecified").trim() || "Unspecified";
    subjects[subject] = (subjects[subject] || 0) + Number(session.minutes || 0);
  });

  const sorted = Object.entries(subjects).sort((a, b) => b[1] - a[1]);

  if (!sorted.length) {
    node.className = "entries empty";
    node.textContent = "No study data yet.";
    return;
  }

  node.className = "entries";
  node.innerHTML = sorted.map(([subject, minutes]) => {
    const hours = (minutes / 60).toFixed(1);
    return `<div class="entry">
      <div>
        <strong>${safe(subject)}</strong>
        <small>${hours} hours (${minutes} minutes)</small>
      </div>
    </div>`;
  }).join("");
}$("studyForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);

  data.sessions.push({
    id: crypto.randomUUID(),
    subject: f.get("subject").trim(),
    date: f.get("date"),
    minutes: Number(f.get("minutes")),
    notes: f.get("notes").trim()
  });

  save();
  render();
  e.currentTarget.reset();
  e.currentTarget.elements.date.value = today;
});

$("mockForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.currentTarget);

  const total = Number(f.get("total"));
  const correct = Number(f.get("correct"));
  const wrong = Number(f.get("wrong"));

  if (correct + wrong > total) {
    alert("Correct + wrong cannot exceed total questions.");
    return;
  }

  data.mocks.push({
    id: crypto.randomUUID(),
    test: f.get("test").trim(),
    date: f.get("date"),
    total,
    correct,
    wrong,
    score: f.get("score")
  });

  save();
  render();
  e.currentTarget.reset();
  e.currentTarget.elements.date.value = today;
});

document.addEventListener("click", e => {
  const b = e.target.closest("[data-delete]");
  if (!b) return;

  const key = b.dataset.type === "session" ? "sessions" : "mocks";
  data[key] = data[key].filter(x => x.id !== b.dataset.delete);

  save();
  render();
});

function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

  $("exportBtn").addEventListener("click",()=>download("preptrack-backup.json",JSON.stringify(data,null,2),"application/json"));
  $("importFile").addEventListener("change",async e=>{
    const file=e.target.files[0]; if(!file)return;
    try { const parsed=JSON.parse(await file.text());
      if(!parsed || !Array.isArray(parsed.sessions)||!Array.isArray(parsed.mocks))throw new Error();
      if(confirm("Replace the records currently saved in this browser with this backup?")){data=parsed;save();render();}
    } catch { alert("That file is not a valid PrepTrack backup."); }
    e.target.value="";
  });
  function csv(rows, fields) {
    const cell=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
    return [fields.map(x=>cell(x[0])).join(","),...rows.map(r=>fields.map(x=>cell(x[1](r))).join(","))].join("\n");
  }
  $("studyCsv").addEventListener("click",()=>download("study-sessions.csv",csv(data.sessions,[["Subject",r=>r.subject],["Date",r=>r.date],["Minutes",r=>r.minutes],["Notes",r=>r.notes]]),"text/csv"));
  $("mockCsv").addEventListener("click",()=>download("mock-tests.csv",csv(data.mocks,[["Test",r=>r.test],["Date",r=>r.date],["Total",r=>r.total],["Correct",r=>r.correct],["Wrong",r=>r.wrong],["Accuracy %",r=>accuracy(r).toFixed(2)],["Score",r=>r.score]]),"text/csv"));
  render();
})();
