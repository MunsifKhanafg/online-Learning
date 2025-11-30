
Mini LMS - Demo Project
======================

Files:
- index.html (Homepage)
- courses.html (Course listing)
- course.html (Course details)
- lesson.html (Lesson viewer)
- quiz.html (Quiz)
- dashboard.html (User dashboard)
- courses.json (Local courses data)
- assets/*.svg (placeholder images)

How to use:
1. Extract the zip.
2. Open index.html in your browser. (For full fetch support, run a simple HTTP server: `python -m http.server` in the folder and open http://localhost:8000)

LocalStorage keys used:
- course_progress_{courseId}  => stores completedLessons, progress, lastVisited, quizScore
