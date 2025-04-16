const password = "ceaksenha"; // Defina a senha desejada
const GITHUB_OWNER = 'Venturas23'; // Substitua pelo nome do proprietário do repositório
const GITHUB_REPO = 'Mat-Quiz'; // Substitua pelo nome do repositório
const GITHUB_TOKEN = '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'; // Substitua pelo seu token de acesso do GitHub
const GITHUB_FILE_PATH = 'respostas/quiz-respostas.json'; // Caminho do arquivo onde os dados serão salvos

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let allowUnload = false;
let playerName = '';

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
    document.getElementById('score').textContent = `${playerName}, você acertou ${score} de ${questions.length} perguntas.`;
    saveResultsToGitHub(playerName, score);
}

function saveResultsToGitHub(name, score) {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

    // Obter o SHA do arquivo existente (necessário para atualizações)
    fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    })
        .then(async (response) => {
            const sha = response.ok ? (await response.json()).sha : null;

            // Atualizar ou criar o arquivo com as novas respostas
            const newContent = {
                player: name,
                score: score,
                date: new Date().toISOString(),
            };

            return fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Atualizando respostas do quiz',
                    content: btoa(JSON.stringify(newContent, null, 2)),
                    sha: sha || undefined,
                }),
            });
        })
        .then((response) => {
            if (response.ok) {
                console.log('Respostas salvas com sucesso no GitHub!');
            } else {
                response.json().then((data) => {
                    console.error('Erro ao salvar no GitHub:', data);
                });
            }
        })
        .catch((error) => {
            console.error('Erro ao acessar a API do GitHub:', error);
        });
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

document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', () => {
        askPlayerName();
    });
});

function askPlayerName() {
    playerName = prompt("Por favor, digite seu nome:");
    if (playerName) {
        fetchQuestions();
    } else {
        alert('Nome do jogador é necessário para iniciar o quiz.');
    }
}

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

document.addEventListener('fullscreenchange', checkFullscreen);
document.addEventListener('webkitfullscreenchange', checkFullscreen);
document.addEventListener('mozfullscreenchange', checkFullscreen);
document.addEventListener('msfullscreenchange', checkFullscreen);

function checkFullscreen() {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (!fullscreenElement) {
        alert('Você saiu do modo de tela cheia. Seus resultados serão exibidos.');
        score = 0;
        showResults();
    }
}

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
