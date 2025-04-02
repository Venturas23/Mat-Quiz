const password = "ceaksenha"; // Defina a senha desejada

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let allowUnload = false;

function fetchQuestions() {
    fetch('https://venturas23.github.io/Mat-Quiz/Pergunta.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            loadQuestion();
        })
        .catch(error => console.error('Erro ao carregar as perguntas:', error));
}

function loadQuestion() {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    
    if (!questionText || !optionsContainer) {
        console.error('Elementos do DOM não encontrados.');
        return;
    }

    if (questions.length === 0) {
        questionText.textContent = 'Nenhuma pergunta disponível.';
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    optionsContainer.innerHTML = '';
    
    currentQuestion.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option;
        button.onclick = () => selectOption(button);
        optionsContainer.appendChild(button);
    });
}

function selectOption(button) {
    const selectedOption = button.textContent;
    const correctOption = questions[currentQuestionIndex].correct;

    if (selectedOption === correctOption) {
        button.style.backgroundColor = 'green';
        score++;
    } else {
        button.style.backgroundColor = 'red';
    }

    document.querySelectorAll('.option').forEach(btn => btn.disabled = true);
    document.getElementById('next-btn').style.display = 'block';
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
        document.getElementById('next-btn').style.display = 'none';
    } else {
        showResults();
    }
}

function showResults() {
    document.querySelector('.quiz-content').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('score').textContent = `Você acertou ${score} de ${questions.length} perguntas.`;
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.querySelector('.quiz-content').style.display = 'block';
    document.getElementById('result-container').style.display = 'none';
    loadQuestion();
    document.getElementById('next-btn').style.display = 'none';
}

// Função para bloquear a cópia
document.addEventListener('copy', (event) => {
    event.preventDefault();
    alert('Copiar não é permitido neste site.');
});

// Função para forçar o modo de tela cheia
function enterFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => {
            console.error(`Erro ao entrar em tela cheia: ${err.message} (${err.name})`);
        });
    } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen().catch(err => {
            console.error(`Erro ao entrar em tela cheia: ${err.message} (${err.name})`);
        });
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
        element.webkitRequestFullscreen().catch(err => {
            console.error(`Erro ao entrar em tela cheia: ${err.message} (${err.name})`);
        });
    } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen().catch(err => {
            console.error(`Erro ao entrar em tela cheia: ${err.message} (${err.name})`);
        });
    } else {
        console.error('API de tela cheia não suportada pelo navegador.');
    }
}

// Função para verificar se o usuário saiu do modo de tela cheia
document.addEventListener('fullscreenchange', checkFullscreen);
document.addEventListener('webkitfullscreenchange', checkFullscreen);
document.addEventListener('mozfullscreenchange', checkFullscreen);
document.addEventListener('msfullscreenchange', checkFullscreen);

function checkFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        alert('Você saiu do modo de tela cheia. O quiz será reiniciado.');
        restartQuiz();
        enterFullscreen();
    }
}

window.onload = () => {
    fetchQuestions();
    enterFullscreen();
};

// Interceptar o evento de recarregamento e solicitar senha
window.addEventListener('beforeunload', (event) => {
    if (!allowUnload) {
        event.preventDefault();
        event.returnValue = '';
        openModal();
    }
});

function openModal() {
    document.getElementById('password-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('password-modal').style.display = 'none';
}

function verifyPassword() {
    const enteredPassword = document.getElementById('password-input').value;
    if (enteredPassword === password) {
        allowUnload = true;
        window.location.reload();
    } else {
        alert('Senha incorreta. A atualização foi cancelada.');
        closeModal();
    }
}

// Bloquear a atualização pelo F5, Ctrl+R, Ctrl+Shift+R
document.addEventListener('keydown', (event) => {
    if ((event.key === 'F5') || 
        (event.ctrlKey && event.key === 'r') || 
        (event.ctrlKey && event.shiftKey && event.key === 'r')) {
        event.preventDefault();
        openModal();
    }
});