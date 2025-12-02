// js/app.js

// Load courses from JSON and cache
async function loadCourses() {
  if(window.__courses) return window.__courses;
  const res = await fetch('courses.json');
  const data = await res.json();
  window.__courses = data;
  return data;
}

// Show courses by category
async function showCoursesByCategory(category) {
  const courses = await loadCourses();
  const filtered = courses.filter(c => c.category === category);
  const container = document.getElementById('courses-container');
  if (!container) return;

  container.innerHTML = '';
  filtered.forEach(c => {
    const card = document.createElement('a');
    card.href = 'course.html?id=' + c.id;
    card.className = 'block bg-white rounded shadow overflow-hidden hover:shadow-lg transition';
    card.innerHTML = `
      <img src="${c.image}" alt="${c.title}" class="w-full h-44 object-cover">
      <div class="p-4">
        <h3 class="font-semibold">${c.title}</h3>
        <p class="text-sm text-gray-600">${c.category} · ${c.level}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// Progress functions
function loadProgress(courseId){
  const raw = localStorage.getItem('mlms_progress_'+courseId);
  return raw?JSON.parse(raw):{completedLessons:[]};
}
function saveProgress(courseId, obj){ localStorage.setItem('mlms_progress_'+courseId, JSON.stringify(obj)); }
function updateProgressUI(courseId, totalLessons){
  const p = loadProgress(courseId);
  const done = p.completedLessons ? p.completedLessons.length : 0;
  const percent = Math.round((done/totalLessons)*100);
  const bar = document.getElementById('progressBar');
  if(bar) bar.style.width = percent + '%';
  const text = document.getElementById('progressText');
  if(text) text.innerText = percent + '% complete';
}
function getQuizScore(courseId){
  const raw = localStorage.getItem('mlms_quiz_'+courseId);
  return raw?JSON.parse(raw).score:null;
}

// Save quiz score
function saveQuizScore(courseId, score){
  localStorage.setItem('mlms_quiz_'+courseId, JSON.stringify({score}));
}

// Export for global usage
window.App = {
  loadCourses, showCoursesByCategory, saveQuizScore
};
