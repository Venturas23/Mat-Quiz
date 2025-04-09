const password = "ceaksenha"; // Defina a senha desejada
const SPREADSHEET_ID = '1FlbQ-JZvOhGh7Du8t4qzcAB7-S9aAld31_KnIy_5Ydo'; // Substitua pelo ID da sua planilha
const CLIENT_ID = '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'; // Substitua pelo ID do cliente obtido do Google Cloud Console
const API_KEY = 'AIzaSyBn7_VBW6gWaiI_85aqEbjAOP0nwSmkr6g'; // Substitua pela sua chave de API obtida do Google Cloud Console
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";


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
    saveResultsToSpreadsheet(playerName, score);
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

    // Block keys to prevent exiting fullscreen
    document.addEventListener('keydown', (event) => {
        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

        if (fullscreenElement) {
            // Prevent keys that exit fullscreen
            if (event.key === 'Escape' || event.key === 'F11' || (event.ctrlKey && event.key === 'w') || (event.altKey && event.key === 'F4')) {
                event.preventDefault();
                alert('Saída da tela cheia bloqueada.');
            }
        }
    });
});

function askPlayerName() {
    playerName = prompt("Por favor, digite seu nome:");
    if (playerName) {
        enterFullscreen();
        document.getElementById('start-container').style.display = 'none';
        document.querySelector('.quiz-content').style.display = 'block';
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

function saveResultsToSpreadsheet(name, score) {
    gapi.load('client:auth2', initClient);

    function initClient() {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
            cookiepolicy: 'single_host_origin'
        }).then(() => {
            return gapi.auth2.getAuthInstance().signIn();
        }).then(() => {
            const params = {
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1!A:B',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS'
            };

            const valueRangeBody = {
                values: [
                    [name, score]
                ]
            };

            const request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
            request.then((response) => {
                console.log(response.result);
            }, (error) => {
                console.error(error.result.error.message);
            });
        });
    }
}
