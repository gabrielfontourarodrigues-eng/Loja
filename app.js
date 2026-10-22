let API = "http://localhost:3000";


try { API = localStorage.getItem("apiUrl") || API; } catch (e) {}
const $ = (id) => document.getElementById(id);
$("apiUrl").value = API;

function setStatus(ok,msg) {
  const s = $("status");
  s.className = ok ? "ok" : "offline";
  s.innerText = msg;
}

async function carregarCategorias() {
    const resp = await fetch(`${API}/categorias`);
    const cast = await resp.json();

    const selForms = $("categoriasID");
    const selFiltro = $("filtroCategoria");

    selForms.innerHTML = "";
    selFiltro.innerHTML = '<option value="">Todas as categorias</option>';

    cast.forEach(c => {
        selForms.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.nome}</option>`);
        selFiltro.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.nome}</option>`);
    });

}

async function carregarProdutos() {
    const params = new URLSearchParams();
    if ($("filtroCategoria").value) params.set("categoria", $("filtroCategoria").value);
    if ($("ordenar").value) params.set("ordenar", $("ordenar").value);

    const resp = await fetch(`${API}/produtos?${params}`);
    const produtos = await resp.json();
    const ul = $("lista");
    ul.innerHTML = "";
    $("vazio").textContent = produtos.length === 0 ? "Nenhum produto encontrado" : "";
    produtos.forEach((p) => {
        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `
            <div>
            <div class="nome">${p.nome}</div>
            <div class="meta">${p.categoria} · estoque:${p.estoque}</div>
            </div>
            <div style="display:flex;align-items:center;gap:14px">
            <span class="preco">R$ ${p.preco.toFixed(2)}</span>
            <div class="btns">
            <button data-ed="${p.id}">Editar</button>
            <button class="del" data-del="${p.id}">Excluir</button>
            </div>
            </div>;
            ul.appendChild(li);
    });

async function conectar() {
   API = $("apiUrl").value.trim().replace(/\/+$/,"");
   try { localStorage.setItem("apiUrl", API); } catch (e) {}
   try {
       await carregarCategorias();
       await carregarProdutos();
       selStatus(true, "Conectado");
    } catch (e) {
     setStatus(false, "Falha ao conectar");
    }}