//Expecificações do servidor
//Importando bibliotecas para o servidor
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

//criando variaveis para armazenar as requisições do servidor
const bandeiras = require('./bandeiras.json');
const respostasFilePath = './respostas.json';

//iniciado servidor na porta 1880
const server = express();
const port = 1880;

server.use(cors());
server.use(express.json());

//consumindo a API bandeiras
server.get('/bandeiras', (req, res) => {
    const bandeiraAleatoria = bandeiras[Math.floor(Math.random() * bandeiras.length)];   // buscando bandeira aleatória na API
    console.log("Bandeira aleatória retornada");
    return res.json(bandeiraAleatoria); // Retorana uma bandeira aleátoria
});

//Requisição para armazenar as respostas no respostas.json
server.post('/salvarRespostas', (req, res) => {
    const { nomePais, respostaCorreta, pontuacao } = req.body; // indicando valores das chaves na respostas.json

    fs.readFile(respostasFilePath, (err, data) => { //lendo dados
        let respostas = []; //armazena em um conjunto
        
        //Armazena a requisição com todos os dados na chave
        if (err || data.toString().trim() === '') {
            respostas = [];
        } else {
            try {
                respostas = JSON.parse(data);
            } catch (parseError) {
                console.error('Erro ao parsear o JSON:', parseError);
                return res.status(500).send('Erro ao processar as respostas');
            }
        }

        //Não permite que o usuario ultrapasse 10 respostas
        if (respostas.length >= 10) {
            return res.status(400).send('Você já atingiu o limite de 10 respostas!');
        }

        respostas.push({ nomePais, respostaCorreta, pontuacao });

        //atualizando os dados no respostas.json
        fs.writeFile(respostasFilePath, JSON.stringify(respostas, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar as respostas', err);
                return res.status(500).send('Erro ao salvar as respostas');
            }

            return res.status(200).send('Resposta salva com sucesso');
        });
    });
});

//lendo o arquivo após atualização
server.get('/resultados', (req, res) => {
    fs.readFile(respostasFilePath, (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler o arquivo de respostas');
        }

        if (data.toString().trim() === '') {
            return res.status(200).json([]);
        }

        try {
            const respostas = JSON.parse(data);
            return res.status(200).json(respostas);
        } catch (parseError) {
            console.error('Erro ao parsear o JSON:', parseError);
            return res.status(500).send('Erro ao processar as respostas');
        }
    });
});

const rankFilePath = './rank.json';

server.post('/salvarRank', (req, res) => {
    const { nome, pontuacao, tempo } = req.body;
    console.log("rankrank");
    fs.readFile(rankFilePath, (err, data) => {
        let rank = [];

        if (!err && data.toString().trim() !== '') {
            try {
                rank = JSON.parse(data);
                //console.log(rank);
            } catch (parseError) {
                console.error('Erro ao parsear o rank:', parseError);
                return res.status(500).send('Erro ao processar o rank');
            }
        }

        // Adiciona novo jogador
        rank.push({ nome, pontuacao, tempo });

        // Ordena por pontuação decrescente, e menor tempo como critério de desempate
        rank.sort((a, b) => {
            if (b.pontuacao === a.pontuacao) {
                return a.tempo - b.tempo;
            }
            return b.pontuacao - a.pontuacao;
        });

        // Mantendo apenas os 3 melhores (modificar o "3" para o numero total)
        rank = rank.slice(0, 3);

        fs.writeFile(rankFilePath, JSON.stringify(rank, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar o rank:', err);
                return res.status(500).send('Erro ao salvar o rank');
            }
            return res.status(200).send('Rank salvo com sucesso').end();
        });
    });
});

server.get('/rank', (req, res) => {
    fs.readFile(rankFilePath, (err, data) => {
        if (err) {
            return res.status(500).send('Erro ao ler o arquivo de ranking');
        }

        if (data.toString().trim() === '') {
            return res.status(200).json([]);
        }

        try {
            const rank = JSON.parse(data);
            return res.status(200).json(rank);
        } catch (parseError) {
            console.error('Erro ao parsear o ranking:', parseError);
            return res.status(500).send('Erro ao processar o ranking');
        }
    });
});


// Apaga os dados
server.post('/limpar-resultados', (req, res) => {
    fs.writeFile(respostasFilePath, JSON.stringify([]), (err) => {
        if (err) {
            console.error('Erro ao limpar os dados:', err);
            return res.status(500).json({ message: 'Erro ao limpar os dados.' });
        }
        res.status(200).json({ message: 'Dados limpos com sucesso.' });
    });
});

//inicia o servidor
server.listen(port, () => {
    console.log('Servidor rodando na porta 1880'); // informa a porta de inicialização
});
