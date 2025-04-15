window.onload = function() {
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    
    if (nomeUsuario) {
        document.getElementById('tituloResultado').innerText = `${nomeUsuario}, seus resultados finais são:`;
    } else {
        document.getElementById('tituloResultado').innerText = 'Resultados Finais:';
    }

    fetch('http://localhost:1880/resultados')
        .then(response => response.json())
        .then(data => {
            const resultadosList = document.getElementById('resultados-list');
            
            let pontuacaoTotal = 0;
            
            if (data.length === 0) {
                resultadosList.innerHTML = '<li>Não há resultados ainda.</li>';
            } else {
                data.forEach(resultado => {
                    pontuacaoTotal += resultado.pontuacao;

                    const listItem = document.createElement('li');
                    listItem.textContent = `País: ${resultado.nomePais}, Resposta: ${resultado.respostaCorreta ? 'Correta' : 'Incorreta'}, Pontuação: ${resultado.pontuacao}`;
                    resultadosList.appendChild(listItem);
                });
            }

            const pontosDisplay = document.getElementById('pontos');
            if (pontosDisplay) {
                pontosDisplay.innerText = `Pontos: ${pontuacaoTotal}`;
            }
        })
        .catch(error => {
            console.error('Erro ao buscar resultados:', error);
            alert('Ocorreu um erro ao buscar os resultados.');
        });
}
