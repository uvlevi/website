let allWords = [];
let currentWords = [];
let currentWordIndex = 0;
let currentMode = 'current'; // 'current' or 'cumulative'
let studyMode = 'study'; // 'study' or 'test'
let correctAnswers = 0;
let totalAnswered = 0;

const wordElement = document.getElementById('word');
const translationElement = document.getElementById('translation');
const showTranslationButton = document.getElementById('showTranslation');
const speakButton = document.getElementById('speakButton');
const daySelect = document.getElementById('daySelect');
const wordCountElement = document.getElementById('wordCount');
const progressBar = document.getElementById('progressBar');
const currentDayModeBtn = document.getElementById('currentDayMode');
const cumulativeModeBtn = document.getElementById('cumulativeMode');
const studyControls = document.getElementById('studyControls');
const testControls = document.getElementById('testControls');
const scoreDisplay = document.getElementById('scoreDisplay');
const studyModeBtn = document.getElementById('studyMode');
const testModeBtn = document.getElementById('testMode');

document.addEventListener('DOMContentLoaded', function() {
    const savedWords = localStorage.getItem('flashcardWords');
    const savedMode = localStorage.getItem('studyMode') || 'current';
    if (savedWords) {
        allWords = JSON.parse(savedWords);
        initializeDays();
        switchMode(savedMode);
        const lastSelectedDay = localStorage.getItem('lastSelectedDay') || 1;
        daySelect.value = lastSelectedDay;
        updateDay(parseInt(lastSelectedDay));
    }
});

// function switchStudyMode(mode) {
//     studyMode = mode;
//     studyModeBtn.classList.toggle('active', mode === 'study');
//     testModeBtn.classList.toggle('active', mode === 'test');
//     studyControls.style.display = mode === 'study' ? 'block' : 'none';
//     testControls.style.display = mode === 'test' ? 'block' : 'none';
//     scoreDisplay.style.display = mode === 'test' ? 'block' : 'none';
//     resetTest();
//     showWord();

//     if (mode === 'test') {
//         speakCurrentWord();
//     } else {
//         synth.cancel();
//     }
// }

function speakCurrentWord() {
    speak(currentWords[currentWordIndex].english);
}

function resetTest() {
    correctAnswers = 0;
    totalAnswered = 0;
    updateScore();
}

function updateScore() {
    const score = totalAnswered === 0 ? 0 : Math.round((correctAnswers / totalAnswered) * 100);
    document.getElementById('score').textContent = score;
}

function generateTestOptions() {
    const correctAnswer = currentWords[currentWordIndex];
    let options = [correctAnswer];
    
    // Get 4 random incorrect options
    const availableWords = allWords.filter(word => 
        word.hebrew !== correctAnswer.hebrew
    );
    
    while (options.length < 5 && availableWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        options.push(availableWords[randomIndex]);
        availableWords.splice(randomIndex, 1);
    }
    
    // Shuffle options
    options = shuffleArray(options);
    
    testControls.innerHTML = '';
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'test-option';
        button.textContent = option.hebrew;
        button.onclick = () => checkAnswer(option.hebrew === correctAnswer.hebrew, button);
        testControls.appendChild(button);
    });
}

function checkAnswer(isCorrect, button) {
    const buttons = testControls.getElementsByClassName('test-option');
    Array.from(buttons).forEach(btn => {
        btn.disabled = true;
        if (btn === button) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    });

    // הצגת סמיילי מתאים
    if (isCorrect) {
        smiley.textContent = '😊';
        smiley.classList.add('correct-answer');
        correctAnswers++;

        // Add fireworks
        for (let i = 0; i < 10; i++) {
            const firework = document.createElement('div');
            firework.classList.add('fireworks');
            firework.style.left = `${Math.random() * 100}%`;
            firework.style.top = `${Math.random() * 100}%`;
            smiley.parentNode.appendChild(firework);
        }

        // Display a compliment
        smiley.textContent = 'עבודה מעולה - כל הכבוד';
    } else {
        smiley.textContent = '😞';
        smiley.style.color = '#f44336';
    }
    smiley.style.display = 'block';

    totalAnswered++;
    updateScore();

    // הסתרת הסמיילי ועבור למילה הבאה
    setTimeout(() => {
        smiley.style.display = 'none';
        smiley.classList.remove('correct-answer');
        smiley.textContent = '😊'; // Reset the smiley text
        const fireworks = document.querySelectorAll('.fireworks');
        fireworks.forEach(firework => firework.remove()); // Remove the fireworks
        currentWordIndex = (currentWordIndex + 1) % currentWords.length;
        showWord();
    }, 2000); // Increase the timeout to 2 seconds to allow for the fireworks animation
}

function switchMode(mode) {
    currentMode = mode;
    localStorage.setItem('studyMode', mode);
    currentDayModeBtn.classList.toggle('active', mode === 'current');
    cumulativeModeBtn.classList.toggle('active', mode === 'cumulative');
    const selectedDay = parseInt(daySelect.value);
    updateDay(selectedDay);
}

const synth = window.speechSynthesis;

function speak(text) {
    console.log('Speech triggered from:', new Error().stack);  //
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    synth.speak(utterance);
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    return lines.map(line => {
        const [english, hebrew, day] = line.trim().split(',');
        return { english, hebrew, day: parseInt(day) };
    }).filter(word => word.english && word.hebrew && word.day);
}

function loadCSV() {
    const file = document.getElementById('csvFile').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            allWords = parseCSV(event.target.result);
            localStorage.setItem('flashcardWords', JSON.stringify(allWords));
            initializeDays();
            updateDay(1);
        };
        reader.readAsText(file);
    }
}

function initializeDays() {
    const maxDay = Math.max(...allWords.map(word => word.day));
    daySelect.innerHTML = '';
    for (let i = 1; i <= maxDay; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Day ${i}`;
        daySelect.appendChild(option);
    }
    daySelect.onchange = () => {
        const selectedDay = parseInt(daySelect.value);
        localStorage.setItem('lastSelectedDay', selectedDay);
        updateDay(selectedDay);
    };
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function updateDay(selectedDay) {
    if (currentMode === 'current') {
        currentWords = shuffleArray(allWords.filter(word => word.day === selectedDay));
    } else {
        currentWords = shuffleArray([...allWords.filter(word => word.day <= selectedDay)]);
    }
    currentWordIndex = 0;
    wordCountElement.textContent = currentWords.length;
    resetTest();
    updateProgress();
    showWord();
}

function showWord() {
    if (currentWords.length === 0) {
        wordElement.textContent = "Please load words from CSV";
        return;
    }
    wordElement.textContent = currentWords[currentWordIndex].english;

// Update word count display*********************************
    const wordCountDisplay = document.getElementById('wordCountDisplay');
wordCountDisplay.textContent = `מילה מספר ${currentWordIndex + 1} מתוך ${currentWords.length}`;

    if (studyMode === 'study') {
        // Show translation only in study mode
        translationElement.style.display = "none";
        translationElement.textContent = currentWords[currentWordIndex].hebrew;
        showTranslationButton.textContent = "הצג תרגום";
    } else if (studyMode === 'test') {
        // Only generate test options and speak if not in writingTestMode
        generateTestOptions();
        if (!writingTestMode) {
            speakCurrentWord();
        }
    }
    updateProgress();
}

function updateProgress() {
    const progress = ((currentWordIndex + 1) / currentWords.length) * 100;
    progressBar.style.width = `${progress}%`;
}

showTranslationButton.addEventListener('click', function() {
    if (translationElement.style.display === "none") {
        translationElement.style.display = "block";
        showTranslationButton.textContent = " המילה הבאה >>>";
    } else {
        currentWordIndex = (currentWordIndex + 1) % currentWords.length;
        showWord();
    }
});

speakButton.addEventListener('click', function() {
    if (currentWords.length > 0) {
        speak(currentWords[currentWordIndex].english);
    }
});

let writingTestMode = false;
const hebrewWordElement = document.getElementById('hebrewWord');
const englishInputElement = document.getElementById('englishInput');
const submitAnswerButton = document.getElementById('submitAnswer');
const writingTestContainer = document.getElementById('writingTestContainer');

submitAnswerButton.addEventListener('click', checkWritingAnswer);

function switchStudyMode(mode) {
    studyMode = mode;
    writingTestMode = mode === 'writingTest';
    // Update button states - this is the only new part we need to add
    document.getElementById('studyMode').classList.toggle('active', mode === 'study');
    document.getElementById('testMode').classList.toggle('active', mode === 'test');
    document.getElementById('writingTestMode').classList.toggle('active', mode === 'writingTest');

    studyControls.style.display = mode === 'study' ? 'block' : 'none';
    testControls.style.display = mode === 'test' ? 'block' : 'none';
    scoreDisplay.style.display = mode !== 'study' ? 'block' : 'none';
    writingTestContainer.style.display = writingTestMode ? 'block' : 'none';

    // Add this line to hide/show the flashcard
    document.querySelector('.card').style.display = writingTestMode ? 'none' : 'block';

    // Disable speak button in writing test mode
    const speakButton = document.getElementById('speakButton');
    const testSpeakButton = document.getElementById('testSpeakButton');
    
    if (writingTestMode) {
        if (speakButton) speakButton.disabled = true;
        if (testSpeakButton) testSpeakButton.disabled = true;
        initializeWritingTest();
    } else {
        if (speakButton) speakButton.disabled = false;
        if (testSpeakButton) testSpeakButton.disabled = false;
        
        if (mode === 'test') {
            speakCurrentWord();
        } else {
            synth.cancel(); // Stop any ongoing speech
        }
    }


    resetTest();
    showWord();
}

function initializeWritingTest() {
    if (currentMode === 'current') {
        currentWords = shuffleArray(allWords.filter(word => word.day === parseInt(daySelect.value)));
    } else {
        currentWords = shuffleArray(allWords.filter(word => word.day <= parseInt(daySelect.value)));
    }
    currentWordIndex = 0;
    showWritingWord();
}

function showWritingWord() {
    if (currentWords.length === 0) {
        hebrewWordElement.textContent = "Please load words from CSV";
        return;
    }
    hebrewWordElement.textContent = currentWords[currentWordIndex].hebrew;
// Update word count display*************************************************************************************************
    const wordCountDisplay = document.getElementById('wordCountDisplay');
    wordCountDisplay.textContent = `מילה מספר ${currentWordIndex + 1} מתוך ${currentWords.length}`;

    englishInputElement.value = '';
    englishInputElement.focus();
}

function checkWritingAnswer() {
    const userAnswer = englishInputElement.value.trim().toLowerCase();
    const correctAnswer = currentWords[currentWordIndex].english.toLowerCase();
    const isCorrect = userAnswer === correctAnswer;

    smiley.textContent = isCorrect ? '😊' : '😞';
    smiley.style.display = 'block';
    totalAnswered++;
    if (isCorrect) correctAnswers++;
    updateScore();

    setTimeout(() => {
        smiley.style.display = 'none';
        currentWordIndex = (currentWordIndex + 1) % currentWords.length;
        showWritingWord();
    }, 2000);
}
