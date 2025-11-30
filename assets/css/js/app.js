const COURSES_KEY = 'mini_lms_courses_progress';
// Helper to fetch courses.json
async function fetchCourses(){
  const res = await fetch('/data/courses.json');
  return await res.json();
}

// Save progress structure example:
// { courseId: { completedLessons: [1,2], quizScore: 80, lastVisited: {lessonId:2, timestamp:...} } }
function loadProgress() {
  return JSON.parse(localStorage.getItem(COURSES_KEY) || '{}');
}
function saveProgress(data) {
  localStorage.setItem(COURSES_KEY, JSON.stringify(data));
}

function markLessonCompleted(courseId, lessonId){
  const data = loadProgress();
  const key = String(courseId);
  data[key] = data[key] || { completedLessons: [], quizScore:null, lastVisited:null };
  if(!data[key].completedLessons.includes(lessonId)){
    data[key].completedLessons.push(lessonId);
  }
  data[key].lastVisited = { lessonId, timestamp: Date.now() };
  saveProgress(data);
}

function setQuizScore(courseId, score){
  const data = loadProgress();
  const key = String(courseId);
  data[key] = data[key] || { completedLessons: [], quizScore:null, lastVisited:null };
  data[key].quizScore = score;
  saveProgress(data);
}

function getCourseProgressPercent(course){
  const data = loadProgress();
  const key = String(course.id);
  const completed = (data[key] && data[key].completedLessons) ? data[key].completedLessons.length : 0;
  const total = course.lessons.length;
  return Math.round((completed/total)*100);
}

// UI small helpers for pages that include a container with id="app"
async function renderHome(){
  const courses = await fetchCourses();
  const container = document.getElementById('app');
  container.innerHTML = `
    <div class="max-w-6xl mx-auto p-6">
      <nav class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Mini LMS</h1>
        <div><a href="/pages/dashboard.html" class="px-4 py-2 border rounded">Dashboard</a></div>
      </nav>
      <header class="mb-8">
        <div class="bg-white p-8 rounded-lg shadow">
          <h2 class="text-3xl font-bold">Learn practical skills online</h2>
          <p class="mt-2 text-gray-600">A sample mini LMS project with localStorage-based progress and quizzes.</p>
        </div>
      </header>
      <section class="mt-6">
        <h3 class="text-xl mb-4">Trending Courses</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${courses.slice(0,6).map(c=>`
            <a href="/pages/course.html?id=${c.id}" class="course-card block bg-white p-4 rounded shadow hover:shadow-lg">
              <img src="/${c.image}" alt="" class="w-full h-40 object-cover rounded mb-3">
              <h4 class="font-semibold">${c.title}</h4>
              <div class="text-sm text-gray-500">${c.category} • ${c.level}</div>
              <div class="mt-2"><button class="px-3 py-1 bg-blue-600 text-white rounded">Start Course</button></div>
            </a>`).join('')}
        </div>
      </section>
    </div>
  `;
}

async function renderCoursesList(){
  const courses = await fetchCourses();
  const container = document.getElementById('app');
  container.innerHTML = `
    <div class="max-w-6xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-4">All Courses</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${courses.map(c=>`
          <div class="course-card bg-white p-4 rounded shadow">
            <img src="/${c.image}" alt="" class="w-full h-36 object-cover rounded mb-3">
            <h3 class="font-semibold">${c.title}</h3>
            <div class="text-sm text-gray-500">${c.category} • ${c.level}</div>
            <div class="mt-3 flex justify-between items-center">
              <a href="/pages/course.html?id=${c.id}" class="px-3 py-1 border rounded">View</a>
              <button onclick="startCourse(${c.id})" class="px-3 py-1 bg-green-600 text-white rounded">Start Course</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function startCourse(id){
  location.href = '/pages/course.html?id='+id;
}

// Course detail render
async function renderCourseDetail(courseId){
  const courses = await fetchCourses();
  const course = courses.find(c=>c.id===Number(courseId));
  const container = document.getElementById('app');
  const progress = getCourseProgressPercent(course);
  container.innerHTML = `
    <div class="max-w-5xl mx-auto p-6">
      <a href="/index.html" class="text-sm text-blue-600">← Back to home</a>
      <div class="bg-white p-6 rounded shadow mt-4">
        <img src="/${course.banner}" class="w-full h-44 object-cover rounded mb-4">
        <h2 class="text-2xl font-bold">${course.title}</h2>
        <p class="text-gray-600 mt-2">${course.description}</p>
        <div class="mt-4">
          <div class="progress w-full h-3 rounded mb-2"><span style="width:${progress}%"></span></div>
          <div class="text-sm">${progress}% completed</div>
        </div>
      </div>
      <div class="mt-6">
        <h3 class="text-xl mb-3">Lessons</h3>
        <ul class="space-y-2">
          ${course.lessons.map(l=>`
            <li class="bg-white p-3 rounded shadow flex justify-between items-center">
              <div>
                <div class="font-medium">${l.title}</div>
                <div class="text-sm text-gray-500">${l.content.substring(0,80)}...</div>
              </div>
              <div class="flex items-center space-x-2">
                <a href="/pages/lesson.html?course=${course.id}&lesson=${l.id}" class="px-3 py-1 border rounded">Start Lesson</a>
                <div id="chk-${course.id}-${l.id}"></div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="mt-6">
        <h3 class="text-lg">Course Quiz</h3>
        <p class="text-sm text-gray-500">5 MCQs to test your understanding.</p>
        <a href="/pages/quiz.html?course=${course.id}" class="mt-2 inline-block px-3 py-1 bg-indigo-600 text-white rounded">Take Quiz</a>
      </div>
    </div>
  `;
  // mark completed checkmarks after render
  setTimeout(()=>{
    const data = loadProgress();
    const key = String(course.id);
    const completed = (data[key] && data[key].completedLessons) ? data[key].completedLessons : [];
    course.lessons.forEach(l=>{
      const el = document.getElementById(`chk-${course.id}-${l.id}`);
      if(el){
        el.innerHTML = completed.includes(l.id) ? '<span class="checkmark">✔ Completed</span>':'';
      }
    });
  },200);
}

// Lesson page render
async function renderLesson(courseId, lessonId){
  const courses = await fetchCourses();
  const course = courses.find(c=>c.id===Number(courseId));
  const lesson = course.lessons.find(x=>x.id===Number(lessonId));
  const container = document.getElementById('app');
  container.innerHTML = `
    <div class="max-w-4xl mx-auto p-6">
      <a href="/pages/course.html?id=${course.id}" class="text-sm text-blue-600">← Back to course</a>
      <h2 class="text-2xl font-bold mt-3">${lesson.title}</h2>
      <div class="mt-4 bg-white p-4 rounded shadow">
        <div class="aspect-w-16 aspect-h-9 mb-4">
          <iframe src="${lesson.video}" title="video" class="w-full h-64" allowfullscreen></iframe>
        </div>
        <div class="prose">
          <p>${lesson.content}</p>
        </div>
        <div class="mt-4">
          <button id="mark-complete" class="px-4 py-2 bg-green-600 text-white rounded">Mark as Completed</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('mark-complete').addEventListener('click', ()=>{
    markLessonCompleted(course.id, lesson.id);
    alert('Marked as completed');
  });
}

// Quiz page
async function renderQuiz(courseId){
  const courses = await fetchCourses();
  const course = courses.find(c=>c.id===Number(courseId));
  // generate 5 simple MCQs from lesson titles (mock)
  const q = course.lessons.slice(0,5).map((l,idx)=>({
    q: `Which lesson title contains the word 'Topic' in lesson ${l.id}?`,
    choices: [l.title, course.lessons[(idx+1)%course.lessons.length].title, course.lessons[(idx+2)%course.lessons.length].title, 'None of these'],
    correct: l.title
  }));
  const container = document.getElementById('app');
  container.innerHTML = `
    <div class="max-w-3xl mx-auto p-6">
      <a href="/pages/course.html?id=${course.id}" class="text-sm text-blue-600">← Back to course</a>
      <h2 class="text-2xl font-bold mt-3">Quiz - ${course.title}</h2>
      <form id="quiz-form" class="mt-4 space-y-4 bg-white p-4 rounded shadow">
        ${q.map((item,i)=>`
          <div>
            <div class="font-medium">Q${i+1}. ${item.q}</div>
            ${item.choices.map((c,ci)=>`
              <label class="block"><input type="radio" name="q${i}" value="${c}" required> ${c}</label>
            `).join('')}
          </div>
        `).join('')}
        <div><button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded">Submit</button></div>
      </form>
      <div id="quiz-result" class="mt-4"></div>
    </div>
  `;
  document.getElementById('quiz-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const form = ev.target;
    let score = 0;
    q.forEach((item,i)=>{
      const val = form['q'+i].value;
      if(val === item.correct) score++;
    });
    const percent = Math.round((score/q.length)*100);
    setQuizScore(course.id, percent);
    const pass = percent >= 50 ? 'Passed' : 'Failed';
    document.getElementById('quiz-result').innerHTML = `<div class="bg-white p-4 rounded shadow">Score: ${percent}% (${score}/${q.length}) — <strong>${pass}</strong></div>`;
  });
}

// Dashboard render
async function renderDashboard(){
  const courses = await fetchCourses();
  const data = loadProgress();
  const container = document.getElementById('app');
  container.innerHTML = `
    <div class="max-w-6xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="bg-white p-4 rounded shadow">
          <h3 class="font-semibold mb-2">Enrolled Courses</h3>
          ${courses.map(c=>{
            const key = String(c.id);
            const progress = getCourseProgressPercent(c);
            const last = (data[key] && data[key].lastVisited) ? new Date(data[key].lastVisited.timestamp).toLocaleString() : '—';
            const quiz = (data[key] && data[key].quizScore) ? data[key].quizScore+'%' : '—';
            return `<div class="p-2 border-b">
              <div class="font-medium">${c.title}</div>
              <div class="text-sm text-gray-500">Progress: ${progress}% • Last: ${last} • Quiz: ${quiz}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="bg-white p-4 rounded shadow">
          <h3 class="font-semibold mb-2">Quick Actions</h3>
          <a href="/pages/courses.html" class="block px-3 py-2 border rounded mb-2">Browse Courses</a>
          <a href="/index.html" class="block px-3 py-2 border rounded">Home</a>
        </div>
      </div>
    </div>
  `;
}

// Router simple
async function route(){
  const path = location.pathname;
  // Home
  if(path.endsWith('/') || path.endsWith('/index.html')){
    await renderHome();
  } else if(path.endsWith('/pages/courses.html')){
    await renderCoursesList();
  } else if(path.endsWith('/pages/course.html')){
    const params = new URLSearchParams(location.search);
    await renderCourseDetail(params.get('id'));
  } else if(path.endsWith('/pages/lesson.html')){
    const params = new URLSearchParams(location.search);
    await renderLesson(params.get('course'), params.get('lesson'));
  } else if(path.endsWith('/pages/quiz.html')){
    const params = new URLSearchParams(location.search);
    await renderQuiz(params.get('course'));
  } else if(path.endsWith('/pages/dashboard.html')){
    await renderDashboard();
  } else {
    const container = document.getElementById('app');
    container.innerHTML = '<div class="p-6">Page not found</div>';
  }
}

window.addEventListener('DOMContentLoaded', route);
