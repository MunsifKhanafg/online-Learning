/* app.js - helpers for MiniLMS */
// get course by id from global window.__courses if loaded else fetch
async function getCourse(id){
  if(window.__courses) return window.__courses.find(c=>String(c.id)===String(id));
  const r = await fetch('courses.json'); const data = await r.json(); window.__courses=data; return data.find(c=>String(c.id)===String(id));
}

// Quiz helper invoked from a simple inline UI created on course end
function showQuiz(courseId){
  getCourse(courseId).then(course=>{
    const qwrap = document.createElement('div');
    qwrap.className='p-4 bg-white rounded shadow mt-4';
    qwrap.innerHTML = '<h3 class="font-semibold mb-2">Course Quiz (5 questions)</h3>';
    // simple 5 sample MCQs built from course data (for demo using static questions)
    const questions = [
      {q:'What is HTML?', opts:['Programming language','Markup language','Database','Operating system'], a:1},
      {q:'What describes CSS?', opts:['Styling web pages','Server language','Database','Protocol'], a:0},
      {q:'Which tag inserts JS?', opts:['<script>','<js>','<code>','<javascript>'], a:0},
      {q:'Which is HTTP for?', opts:['Transfer files','Web protocol','Database','Design'], a:1},
      {q:'Which is responsive design?', opts:['Mobile only','Adaptive layout','Fixed layout','Not related'], a:1},
    ];
    questions.forEach((qq,idx)=>{
      const div = document.createElement('div');
      div.className='mb-3';
      div.innerHTML = `<div class="font-medium">${idx+1}. ${qq.q}</div>`;
      qq.opts.forEach((opt,oi)=>{
        const id = 'q'+idx+'o'+oi;
        div.innerHTML += `<label class="block"><input name="q${idx}" type="radio" value="${oi}" /> ${opt}</label>`;
      });
      qwrap.appendChild(div);
    });
    const submit = document.createElement('button');
    submit.className='px-3 py-2 bg-green-600 text-white rounded';
    submit.innerText = 'Submit Quiz';
    submit.onclick = ()=>{
      let score=0;
      for(let i=0;i<questions.length;i++){
        const sel = document.querySelector('input[name="q'+i+'"]:checked');
        const val = sel ? Number(sel.value) : -1;
        if(val===questions[i].a) score+=1;
      }
      const percent = Math.round((score/questions.length)*100);
      localStorage.setItem('mlms_quiz_'+courseId, JSON.stringify({score:percent, raw:score}));
      alert('Quiz finished — Score: '+percent+'%');
      location.reload();
    };
    qwrap.appendChild(submit);
    const main = document.getElementById('main') || document.body;
    main.appendChild(qwrap);
  });
}
