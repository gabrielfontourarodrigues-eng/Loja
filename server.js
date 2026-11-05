const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;
const ARQUIVO = "produtos.json";

app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
    }
    next();
});

function carregar() {
    const texto = fs.readFileSync(ARQUIVO, 'utf-8');
    return JSON.parse(texto || '[]');
}
function salvar(dados) {
    fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}
let [categorias, produtos] = carregar();
let proxmoId = produtos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
function comCategoria(produto) {
    const cat = categorias.find(c => c.id === produto.categoriasId);
    return { ...produto, categoria: cat ? cat.nome : "???" };
}
app.get('/categorias', (req, res) => {
    res.status(200).json(categorias);
});
app.get('/produtos', (req, res) => {
    let lista = produtos.map(comCategoria);
    if (req.query.categoriaId) {
        const idCat = Number(req.query.categoriaId);
        lista = lista.filter(p => p.categoriaId === idCat);
    }
    const ordenar = req.query.ordenar;
    if(ordenar =="preco") lista.sort((a, b) => a.preco - b.preco);
    if(ordenar =="estoque") lista.sort((a, b) => a.estoque - b.estoque);
    if(ordenar =="nome") lista.sort((a, b) => a.nome.localeCompare(b.nome));
    res.status(200).json(lista);
});
app.get('/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    const p = produtos.find(p => p.id === id);
    if (!p) {
        res.status(404).json({ erro: "Produto não encontrado" });
        return;
    }
    res.status(200).json(p);
});
function validar(body) {
    const nome = body.nome?.trim();
    const preco = Number(body.preco);
    const estoque = Number(body.estoque);
    const categoriaId = Number(body.categoriaId);
    if (!nome) return "Nome inválido";
    if (isNaN(preco) || preco < 0) return "Preço inválido";
    if (isNaN(estoque) || estoque < 0) return "Estoque inválido";
    if (!categorias.find(c => c.id === categoriaId)) return "Categoria inválida";
    return { ok: true, dados: { nome, preco, estoque, categoriaId } };
}

app.post('/produtos', (req, res) => {
    const validacao = validar(req.body);
    if (validacao.erro) return res.status(400).json({ erro: validacao.erro });
    const novo = { id: proxmoId++, ...validacao.dados };
    produtos.push(novo);
    salvar([categorias, produtos]);
    res.status(201).json(novo);
});
app.put('/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    const p = produtos.find(p => p.id === id);
    if (!p) return res.status(404).json({ erro: "Produto não encontrado" });
    const validacao = validar(req.body);
    if (validacao.erro) return res.status(400).json({ erro: validacao.erro });

    p.nome = validacao.dados.nome;
    p.preco = validacao.dados.preco;
    p.estoque = validacao.dados.estoque;
    p.categoriaId = validacao.dados.categoriaId;
    salvar([categorias, produtos]);
    res.status(200).json(p);
});
app.delete('/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    const i = produtos.findIndex(p => p.id === id);
    if (i < 0) return res.status(404).json({ erro: "Produto não encontrado" });
    produtos.splice(i, 1);
    salvar([categorias, produtos]);
    res.status(204).end();
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});  


