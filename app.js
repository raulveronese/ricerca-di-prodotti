let db;
const form = document.getElementById('form-produto');
const lista = document.getElementById('lista-produtos');
const busca = document.getElementById('busca');

const openDB = () => {
  const request = indexedDB.open("produtosDB", 1);

  request.onupgradeneeded = function (e) {
    db = e.target.result;
    db.createObjectStore("produtos", { keyPath: "id", autoIncrement: true });
  };

  request.onsuccess = function (e) {
    db = e.target.result;
    mostrarProdutos();
  };
};

form.onsubmit = function (e) {
  e.preventDefault();
  const nome = document.getElementById('nome').value;
  const corredor = document.getElementById('corredor').value;
  const prateleira = document.getElementById('prateleira').value;

  const tx = db.transaction("produtos", "readwrite");
  const store = tx.objectStore("produtos");
  store.add({ nome, corredor, prateleira });
  tx.oncomplete = () => {
    form.reset();
    mostrarProdutos();
  };
};

function mostrarProdutos(filtro = "") {
  lista.innerHTML = "";
  const tx = db.transaction("produtos", "readonly");
  const store = tx.objectStore("produtos");

  store.openCursor().onsuccess = function (e) {
    const cursor = e.target.result;
    if (cursor) {
      const p = cursor.value;
      if (p.nome.toLowerCase().includes(filtro.toLowerCase())) {
        const li = document.createElement("li");
        li.textContent = `${p.nome} - Corredor ${p.corredor}, Prateleira ${p.prateleira}`;

        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.className = "editar";
        btnEditar.onclick = () => editarProduto(p);

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.className = "excluir";
        btnExcluir.onclick = () => excluirProduto(p.id);

        li.appendChild(btnEditar);
        li.appendChild(btnExcluir);
        lista.appendChild(li);
      }
      cursor.continue();
    }
  };
}

function excluirProduto(id) {
  const tx = db.transaction("produtos", "readwrite");
  const store = tx.objectStore("produtos");
  store.delete(id);
  tx.oncomplete = () => mostrarProdutos();
}

function editarProduto(produto) {
  const novoNome = prompt("Novo nome:", produto.nome);
  const novoCorredor = prompt("Novo corredor:", produto.corredor);
  const novaPrateleira = prompt("Nova prateleira:", produto.prateleira);

  if (novoNome && novoCorredor && novaPrateleira) {
    const tx = db.transaction("produtos", "readwrite");
    const store = tx.objectStore("produtos");
    store.put({
      id: produto.id,
      nome: novoNome,
      corredor: novoCorredor,
      prateleira: novaPrateleira,
    });
    tx.oncomplete = () => mostrarProdutos();
  }
}

busca.oninput = () => mostrarProdutos(busca.value);

openDB();

// Registrar service worker para PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}