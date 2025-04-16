// Defina a senha desejada
const password = "ceaksenha"; 

// Substitua pelo nome do proprietário do repositório
const GITHUB_OWNER = 'Venturas23'; 

// Substitua pelo nome do repositório
const GITHUB_REPO = 'Mat-Quiz'; 

// Substitua pelo seu token de acesso pessoal do GitHub (deve ser decodificado corretamente e protegido)
const GITHUB_TOKEN_base64 = 'qmyfDnUy+8caFQ3zBJFwJKEVISmPEHAj6SHu1ZXwVqSgMDHdrLaqdAFpNpSqPjIkRkE9+OlOzMg='; 

// Caminho do arquivo onde as respostas serão salvas
const GITHUB_FILE_PATH = 'respostas/quiz-respostas.json'; 

// Vetor de inicialização para criptografia
const iv = 'SmH4IH+JzBkDI3VR';

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let playerName = '';

// Função para gerar uma chave criptográfica
async function generateKey() {
    return crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

// Função para converter ArrayBuffer em Base64
function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Função para converter Base64 em ArrayBuffer
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Função para desencriptar o token
async function decryptToken(key, encryptedDataBase64, ivBase64) {
    const encryptedData = base64ToArrayBuffer(encryptedDataBase64);
    const iv = base64ToArrayBuffer(ivBase64);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: new Uint8Array(iv),
        },
        key,
        encryptedData
    );

    return new TextDecoder().decode(decrypted);
}

// Função para carregar as perguntas
function fetchQuestions() {
    fetch('https://venturas23.github.io/Mat-Quiz/Pergunta.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            loadQuestion();
        })
        .catch(error => console.error('Erro ao carregar as perguntas:', error));
}

// Função para carregar a questão atual
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

// Função para selecionar a opção
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

// Função para avançar para a próxima questão
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
        document.getElementById('next-btn').style.display = 'none';
    } else {
        showResults();
    }
}

// Função para exibir os resultados
function showResults() {
    document.querySelector('.quiz-content').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('score').textContent = `${playerName}, você acertou ${score} de ${questions.length} perguntas.`;
    saveResultsToGitHub();
}

// Função para salvar os resultados no GitHub
async function saveResultsToGitHub() {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

    try {
        // Obter o token desencriptado
        const key = await generateKey();
        const decryptedToken = await decryptToken(key, GITHUB_TOKEN_base64, iv);

        // Obter o SHA do arquivo existente
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${decryptedToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        const sha = response.ok ? (await response.json()).sha : null;

        // Atualizar ou criar o arquivo com as novas respostas
        const newContent = {
            player: playerName,
            score: score,
            date: new Date().toISOString(),
        };

        const result = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${decryptedToken}`,
                Accept: 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Atualizando respostas do quiz',
                content: btoa(JSON.stringify(newContent, null, 2)),
                sha: sha || undefined,
            }),
        });

        if (result.ok) {
            console.log('Respostas salvas com sucesso no GitHub!');
        } else {
            const errorData = await result.json();
            console.error('Erro ao salvar no GitHub:', errorData);
        }
    } catch (error) {
        console.error('Erro ao acessar a API do GitHub:', error);
    }
}

// Função para reiniciar o quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.querySelector('.quiz-content').style.display = 'block';
    document.getElementById('result-container').style.display = 'none';
    loadQuestion();
    document.getElementById('next-btn').style.display = 'none';
}

// Evento para iniciar o quiz
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', askPlayerName);
});

// Função para solicitar o nome do jogador
function askPlayerName() {
    playerName = prompt("Por favor, digite seu nome:");
    if (playerName) {
        fetchQuestions();
    } else {
        alert('Nome do jogador é necessário para iniciar o quiz.');
    }
}