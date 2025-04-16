const password = "ceaksenha"; // Defina a senha desejada
const GITHUB_OWNER = 'Venturas23'; // Substitua pelo nome do proprietário do repositório
const GITHUB_REPO = 'Mat-Quiz'; // Substitua pelo nome do repositório
const GITHUB_TOKEN_base64 = 'qmyfDnUy+8caFQ3zBJFwJKEVISmPEHAj6SHu1ZXwVqSgMDHdrLaqdAFpNpSqPjIkRkE9+OlOzMg='; // Substitua pelo seu token de acesso pessoal do GitHub
const GITHUB_FILE_PATH = 'respostas/quiz-respostas.json'; // Caminho do arquivo onde as respostas serão salvas
const iv = 'SmH4IH+JzBkDI3VR';

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let allowUnload = false;
let playerName = '';

async function generateKey() {
    return await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }
function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }
  
  // Função para converter Base64 para ArrayBuffer
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
    const encryptedData = base64ToArrayBuffer(encryptedDataBase64); // Convertendo de Base64 para ArrayBuffer
    const iv = base64ToArrayBuffer(ivBase64); // Convertendo IV de Base64 para ArrayBuffer
  
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv), // Certificando-se de que é um Uint8Array
      },
      key,
      encryptedData
    );
  
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
  (async () => {
    const key = await generateKey();
    // Desencriptar o token
    const decryptedToken = await decryptToken(key, GITHUB_TOKEN_base64, iv);
    console.log("Token Desencriptado:", decryptedToken);
  })();
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
            Authorization: `Bearer ${decryptedToken}`,
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
