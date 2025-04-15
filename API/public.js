// função de exibir as bandeiras aleatórias
async function exibirBandeira() {
    //remove todos os dados para inserir novos no LocalStorage
    localStorage.removeItem('rodadas');
    localStorage.removeItem('respostasCorretas');
    localStorage.removeItem('respostasIncorretas');
    localStorage.removeItem('pontuacao');

    //Criando novamnte os LocalStorage
    localStorage.setItem('rodadas', '0');
    localStorage.setItem('respostasCorretas', JSON.stringify([]));
    localStorage.setItem('respostasIncorretas', JSON.stringify([]));
    localStorage.setItem('pontuacao', '0');

    //Consumindo API
    const resp = await fetch('http://localhost:1880/bandeiras');
    if (resp.status == 200) {
        const bandeira = await resp.json();
        if (bandeira.imagem) {
            document.getElementById('imagemBandeira').src = bandeira.imagem;
        } else {
            console.error('Erro ao carregar a imagem!!');
        }

        //Coleta os valores do formulario e adiciona no LocalStorage
        document.getElementById('formBandeira').onsubmit = function (e) {
            e.preventDefault();
            const nomeUsuario = document.getElementById('nomeBandeira').value;
            let respostasCorretas = JSON.parse(localStorage.getItem('respostasCorretas'));
            let respostasIncorretas = JSON.parse(localStorage.getItem('respostasIncorretas'));
            let rodadas = parseInt(localStorage.getItem('rodadas'));
            let pontuacao = parseInt(localStorage.getItem('pontuacao'));

            const respostaCorreta = nomeUsuario.trim().toLowerCase() === bandeira.nomePais.toLowerCase();
            if (respostaCorreta) {
                document.getElementById('resultado').innerText = 'Correto! +10PTS';
                document.getElementById('resultado').style.color = 'green';
                respostasCorretas.push(bandeira.nomePais);
                pontuacao += 10;
                localStorage.setItem('pontuacao', pontuacao);
            } else {
                document.getElementById('resultado').innerText = 'Incorreto! 0PTS';
                document.getElementById('resultado').style.color = 'red';
                respostasIncorretas.push(bandeira.nomePais);
            }

            //Adiciona os valores dos LocalStorage no respostas.json em suas respectivas chaves
            localStorage.setItem('respostasCorretas', JSON.stringify(respostasCorretas));
            localStorage.setItem('respostasIncorretas', JSON.stringify(respostasIncorretas));
            localStorage.setItem('pontuacao', JSON.stringify(pontuacao));

            //busca a requisição /salvarRespostas inferido no index.js (servidor)
            fetch('http://localhost:1880/salvarRespostas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                //informando o corpo do arquivo json
                body: JSON.stringify({
                    nomePais: bandeira.nomePais,
                    respostaCorreta: respostaCorreta,
                    pontuacao: pontuacao
                })
                //buscando a quantidade de respostas e redicionando para os resultados finais
                
            }).then(response => {
                if (response.status === 200) {
                    console.log('Resposta salva com sucesso');
                } else if (response.status === 400) {
                    alert('Você já atingiu o limite de 10 respostas!');
                    window.location.href = './resultados.html';
                    return;
                }
            });
            //armazenando o número de rodadas jogadas e limitando um limite
            rodadas++;
            console.log("aqui");
            localStorage.setItem('rodadas', rodadas.toString());

            if (rodadas >= 10) {
                alert('Você completou as 10 rodadas');
                window.location.href = './resultados.html'; 
                return;
            }

            setTimeout(() => {
                exibirBandeira();
            }, 1500);
        };
    } else {
        console.error('Falha ao carregar o servidor');
    }
}

exibirBandeira(); // chama a função inicial
