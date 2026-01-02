// Register service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => console.log("Service Worker registered", reg))
            .catch(err => console.error("Service Worker failed", err));
    });
}

// Training lists data with multiple difficulty levels
const trainingLists = {
    beginner: {
        id: 'beginner',
        name: 'المبتدئ',
        difficulty: 'easy',
        exercises: [
            { id: 'b', name: "Burpees (بوربيز)", reps: 5, cal: 10, desc: "انزل لوضع الضغط، ثم اقفز للأعلى. تمرين انفجاري للحرق." },
            { id: 'p', name: "Push-ups (الضغط)", reps: 8, cal: 5, desc: "لتقوية الصدر والترايسبس. حافظ على جذعك مشدوداً." },
            { id: 's', name: "Squats (القرفصاء)", reps: 12, cal: 8, desc: "استهدف عضلات الأرجل الكبيرة لحرق طاقة أكبر." },
            { id: 'pl', name: "Plank (البلانك)", reps: 20, cal: 5, desc: "ثبات لمدة 20 ثانية. يقوي عضلات البطن ويحمي الظهر." },
            { id: 'sm', name: "Superman (سوبرمان)", reps: 8, cal: 4, desc: "استلقِ على بطنك وارفع صدرك. يعالج تقوس الظهر." }
        ],
        rounds: 2,
        totalTime: 15
    },
    intermediate: {
        id: 'intermediate',
        name: 'المتوسط',
        difficulty: 'medium',
        exercises: [
            { id: 'b', name: "Burpees (بوربيز)", reps: 8, cal: 12, desc: "انزل لوضع الضغط مع قفزة أعلى." },
            { id: 'p', name: "Push-ups (الضغط)", reps: 12, cal: 7, desc: "ضغط مع وقفة قصيرة في الأسفل." },
            { id: 's', name: "Squats (القرفصاء)", reps: 15, cal: 10, desc: "قرفصاء مع قفزة خفيفة في النهاية." },
            { id: 'l', name: "Lunges (لانجز)", reps: 10, cal: 8, desc: "انزل للأمام بكل رجل لاستهداف الفخذين." },
            { id: 'pl', name: "Plank (البلانك)", reps: 30, cal: 6, desc: "بلانك مع رفع رجل واحدة بالتناوب." },
            { id: 'cr', name: "Crunches (كرنش)", reps: 15, cal: 5, desc: "تمرين للبطن العلوي." }
        ],
        rounds: 3,
        totalTime: 20
    },
    advanced: {
        id: 'advanced',
        name: 'المتقدم',
        difficulty: 'hard',
        exercises: [
            { id: 'b', name: "Burpees (بوربيز)", reps: 10, cal: 15, desc: "بوربيز مع قفزة عالية في النهاية." },
            { id: 'p', name: "Push-ups (الضغط)", reps: 15, cal: 10, desc: "ضغط مع توقف 2 ثانية في الأسفل." },
            { id: 's', name: "Squats (القرفصاء)", reps: 20, cal: 12, desc: "قرفصاء مع قفزة عالية." },
            { id: 'l', name: "Lunges Jump (لانجز مع قفز)", reps: 12, cal: 10, desc: "لانجز مع تبديل الأرجل في الهواء." },
            { id: 'mt', name: "Mountain Climbers (تسلق الجبل)", reps: 30, cal: 12, desc: "حركة سريعة لتسلق الجبل." },
            { id: 'pl', name: "Plank (البلانك)", reps: 45, cal: 8, desc: "بلانك مع رفع رجل وذراع معاكسة." },
            { id: 'pu', name: "Pull-ups (شد)", reps: 5, cal: 10, desc: "إذا كان لديك بار للشد." }
        ],
        rounds: 4,
        totalTime: 25
    }
};

let currentTraining = 'beginner';
let currentLevel = 1;
let totalRounds = 0;
let totalCals = 0;
let streak = 1;
let timerRunning = false;
let secondsLeft = 1200;
let timerInterval;
let completedExercises = [];

// Initialize the app
function init() {
    createTabs();
    renderTraining();
    updateStats();
}

// Create tabs for training lists
function createTabs() {
    const tabsContainer = document.getElementById('training-tabs');
    tabsContainer.innerHTML = '';
    
    Object.keys(trainingLists).forEach(key => {
        const training = trainingLists[key];
        const btn = document.createElement('button');
        btn.className = `tab-btn ${key === currentTraining ? 'active' : ''}`;
        btn.textContent = training.name;
        btn.onclick = () => switchTraining(key);
        tabsContainer.appendChild(btn);
    });
}

// Switch between training lists
function switchTraining(trainingId) {
    currentTraining = trainingId;
    
    // Update tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update timer based on selected training
    const training = trainingLists[trainingId];
    secondsLeft = training.totalTime * 60;
    updateTimerDisplay();
    
    renderTraining();
}

// Render the current training list
function renderTraining() {
    const container = document.getElementById('training-container');
    const training = trainingLists[currentTraining];
    
    container.innerHTML = `
        <div class="training-card active">
            <div class="training-header">
                <h2>${training.name}</h2>
                <span class="difficulty-badge difficulty-${training.difficulty}">
                    ${training.difficulty === 'easy' ? 'سهل' : training.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                </span>
            </div>
            <p style="color: #94a3b8; margin-bottom: 20px;">عدد الجولات: ${training.rounds} | الوقت الإجمالي: ${training.totalTime} دقيقة</p>
            
            <div id="exercises-list"></div>
            
            <div style="text-align: center; margin-top: 20px;">
                <p style="color: #94a3b8; font-size: 0.9rem;">إجمالي التمارين: ${training.exercises.length} | إجمالي التكرارات المقدرة: ${calculateTotalReps(training)}</p>
            </div>
        </div>
    `;
    
    // Render exercises
    const exercisesList = document.getElementById('exercises-list');
    exercisesList.innerHTML = '';
    
    training.exercises.forEach((ex, index) => {
        const isCompleted = completedExercises.includes(ex.id);
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise-item';
        exerciseDiv.innerHTML = `
            <div class="exercise-info">
                <h4>${index + 1}. ${ex.name}</h4>
                <p>${ex.desc}</p>
            </div>
            <div class="exercise-stats">
                <div class="rep-count">${ex.reps} ${ex.id === 'pl' ? 'ثانية' : 'تكرار'}</div>
                <div class="cal-count">${ex.cal} سعرة</div>
                <button class="btn-done" style="padding: 5px 10px; font-size: 0.8rem;" onclick="completeExercise('${ex.id}')" ${isCompleted ? 'disabled' : ''}>
                    ${isCompleted ? '✓ مكتمل' : 'تم الإنجاز'}
                </button>
            </div>
        `;
        
        if (isCompleted) {
            exerciseDiv.style.opacity = '0.7';
            exerciseDiv.style.borderRightColor = '#22c55e';
        }
        
        exercisesList.appendChild(exerciseDiv);
    });
    
    updateProgress();
}

// Calculate total reps for a training list
function calculateTotalReps(training) {
    return training.exercises.reduce((total, ex) => total + ex.reps, 0) * training.rounds;
}

// Complete an exercise
function completeExercise(id) {
    if (!completedExercises.includes(id)) {
        completedExercises.push(id);
        
        // Find the exercise to add calories
        const training = trainingLists[currentTraining];
        const ex = training.exercises.find(e => e.id === id);
        if (ex) {
            totalCals += ex.cal;
        }
        
        // If all exercises are completed, increase rounds
        if (completedExercises.length === training.exercises.length) {
            totalRounds++;
            document.getElementById('total-rounds').innerText = totalRounds;
            completedExercises = []; // Reset for next round
            
            // Check if all rounds are completed
            if (totalRounds >= training.rounds) {
                alert(`تهانينا! لقد أنهيت جميع جولات ${training.name}`);
                completeWorkout();
            } else {
                alert(`تهانينا! لقد أنهيت جولة كاملة. الجولة التالية: ${totalRounds + 1}/${training.rounds}`);
            }
        }
        
        renderTraining();
        updateStats();
        updateProgress();
    }
}

// Update training list - creates a new custom list based on preferences
function updateTrainingList() {
    const training = trainingLists[currentTraining];
    const newExercises = [...training.exercises];
    
    // Modify some exercises randomly to create variation
    newExercises.forEach(ex => {
        // Randomly adjust reps by -2 to +2
        const adjustment = Math.floor(Math.random() * 5) - 2;
        ex.reps = Math.max(3, ex.reps + adjustment);
        
        // Adjust calories accordingly
        ex.cal = Math.max(3, ex.cal + Math.floor(adjustment / 2));
    });
    
    // Save the updated list
    trainingLists[currentTraining].exercises = newExercises;
    
    // Reset progress for this updated list
    completedExercises = [];
    
    renderTraining();
    updateStats();
    
    alert(`تم تحديث قائمة التدريب "${training.name}" بنجاح!`);
}

// Increase difficulty for all training lists
function increaseDifficulty() {
    currentLevel++;
    
    Object.keys(trainingLists).forEach(key => {
        const training = trainingLists[key];
        
        // Increase reps for each exercise
        training.exercises.forEach(ex => {
            // Increase by 10-20%
            const increasePercent = 10 + Math.floor(Math.random() * 11);
            ex.reps = Math.ceil(ex.reps * (1 + increasePercent / 100));
            
            // Also increase calories
            ex.cal = Math.ceil(ex.cal * 1.1);
        });
        
        // Increase rounds for intermediate and advanced
        if (key === 'intermediate') training.rounds = Math.min(5, training.rounds + 1);
        if (key === 'advanced') training.rounds = Math.min(6, training.rounds + 1);
        
        // Increase total time
        training.totalTime = Math.min(35, training.totalTime + 2);
    });
    
    // Update display
    document.getElementById('current-level').innerText = currentLevel;
    
    // Reset current progress since difficulty changed
    completedExercises = [];
    
    renderTraining();
    updateStats();
    
    alert(`تم زيادة مستوى الصعوبة إلى المستوى ${currentLevel}!`);
}

// Complete the entire workout
function completeWorkout() {
    // Save workout to localStorage or server in a real app
    const today = new Date().toLocaleDateString('ar-EG');
    alert(`تم إنهاء التمرين بنجاح!\nالوقت: ${today}\nالسعرات المحروقة: ${totalCals}\nالجولات المكتملة: ${totalRounds}`);
    
    // Increment streak
    streak++;
    updateStats();
    
    // Reset for next workout
    completedExercises = [];
    renderTraining();
}

// Reset training progress
function resetTraining() {
    if (confirm("هل تريد إعادة تعيين تقدم التمرين الحالي؟")) {
        completedExercises = [];
        totalRounds = 0;
        totalCals = 0;
        updateStats();
        renderTraining();
        alert("تم إعادة تعيين التمرين.");
    }
}

// Update progress bar
function updateProgress() {
    const training = trainingLists[currentTraining];
    const progress = completedExercises.length / training.exercises.length;
    const percent = Math.round(progress * 100);
    
    document.getElementById('progress-percent').textContent = `${percent}%`;
    document.getElementById('progress-fill').style.width = `${percent}%`;
}

// Update stats display
function updateStats() {
    document.getElementById('total-rounds').innerText = totalRounds;
    document.getElementById('total-calories').innerText = totalCals;
    document.getElementById('streak').innerText = streak;
}

// Timer functions
function toggleTimer() {
    const btn = document.getElementById('timer-btn');
    if(!timerRunning) {
        timerRunning = true;
        btn.innerText = "إيقاف مؤقت";
        timerInterval = setInterval(() => {
            secondsLeft--;
            updateTimerDisplay();
            if(secondsLeft <= 0) {
                clearInterval(timerInterval);
                alert("انتهى وقت التمرين!");
                timerRunning = false;
                btn.innerText = "ابدأ الـ Sprint";
            }
        }, 1000);
    } else {
        timerRunning = false;
        btn.innerText = "استكمال";
        clearInterval(timerInterval);
    }
}

function updateTimerDisplay() {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    document.getElementById('timer-display').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
