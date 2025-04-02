var requestArquivo = "https://github.com/Venturas23/Mat-Quiz/blob/main/Pergunta.json";
var request = new XMLHttpRequest();

request.open("GET", requestArquivo, true);
request.responseType = "json";
request.send();

request.onload = function() {
    var pergunta = request.response;
    
    // Verifica se o JSON foi carregado corretamente
    if (pergunta) {
        var pergunta_input = document.getElementById("pergunta_Input");
        
        // Corrige a forma de acessar a pergunta
        pergunta_input.textContent = pergunta.Pergunta1[0];  
    } else {
        console.error("Erro ao carregar JSON");
    }
};
