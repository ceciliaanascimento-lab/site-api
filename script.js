const API_POSTS = 'https://jsonplaceholder.typicode.com/posts?_limit=10';
const API_USERS = 'https://jsonplaceholder.typicode.com/users';

const postsContainer = document.getElementById('postsContainer');
const loadingElement = document.getElementById('loading');
const btnPublish = document.getElementById('btnPublish');
const postInput = document.getElementById('postInput');
const searchInput = document.getElementById('searchInput');

const tabAll = document.getElementById('tabAll');
const tabSaved = document.getElementById('tabSaved');
const savedCount = document.getElementById('savedCount');

let postsList = [];
let usersMap = {};
let activeTab = 'all'; // 'all' ou 'saved'

// 1. Carrega usuários e posts da API
async function loadFeed() {
  try {
    const [usersRes, postsRes] = await Promise.all([
      fetch(API_USERS),
      fetch(API_POSTS)
    ]);

    const users = await usersRes.json();
    const posts = await postsRes.json();

    users.forEach(user => {
      usersMap[user.id] = user.name;
    });

    // Mapeamento inicial dos posts com IDs únicos
    postsList = posts.map(post => ({
      id: post.id,
      userId: post.userId,
      authorName: usersMap[post.userId] || 'Desenvolvedor',
      avatarImg: `https://i.pravatar.cc/100?img=${post.userId + 10}`,
      body: post.body,
      likes: Math.floor(Math.random() * 50),
      isLiked: false,
      isSaved: false
    }));

    loadingElement.style.display = 'none';
    renderPosts();

  } catch (error) {
    loadingElement.textContent = 'Erro ao carregar o feed de dados.';
    console.error('Erro na API:', error);
  }
}

// 2. Renderiza a lista de posts na tela de acordo com os filtros e abas
function renderPosts() {
  postsContainer.innerHTML = '';

  const searchTerm = searchInput.value.toLowerCase();

  // Filtragem por aba e palavra-chave
  let displayedPosts = postsList.filter(post => {
    const matchesSearch = post.body.toLowerCase().includes(searchTerm) || 
                          post.authorName.toLowerCase().includes(searchTerm);
    if (activeTab === 'saved') {
      return matchesSearch && post.isSaved;
    }
    return matchesSearch;
  });

  // Atualiza a contagem do indicador de salvos
  const totalSaved = postsList.filter(p => p.isSaved).length;
  savedCount.textContent = totalSaved;

  if (displayedPosts.length === 0) {
    const emptyMsg = activeTab === 'saved' 
      ? 'Você ainda não salvou nenhuma publicação.' 
      : 'Nenhuma publicação encontrada.';
    postsContainer.innerHTML = `<p style="text-align:center; color:#94a3b8; padding: 20px;">${emptyMsg}</p>`;
    return;
  }

  displayedPosts.forEach(post => {
    const postElement = document.createElement('article');
    postElement.classList.add('post-card');

    postElement.innerHTML = `
      <div class="post-header">
        <img src="${post.avatarImg}" alt="Avatar">
        <div class="post-author">
          <h4>${post.authorName}</h4>
          <span>@dev_${post.userId || 'user'}</span>
        </div>
      </div>
      <p class="post-content">${post.body}</p>
      <div class="post-actions">
        <button class="action-btn ${post.isLiked ? 'active' : ''}" onclick="toggleLike(${post.id})">
          💙 <span>${post.likes}</span> Curtidas
        </button>
        <button class="action-btn ${post.isSaved ? 'active' : ''}" onclick="toggleSave(${post.id})">
          ${post.isSaved ? '🔖 Salvo' : '🔖 Salvar'}
        </button>
        <button class="action-btn delete-btn" onclick="deletePost(${post.id})">
          🗑️ Apagar
        </button>
      </div>
    `;

    postsContainer.appendChild(postElement);
  });
}

// 3. Curtir / Descurtir
window.toggleLike = function(id) {
  const post = postsList.find(p => p.id === id);
  if (post) {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    renderPosts();
  }
};

// 4. Salvar / Guardar Publicação no Perfil
window.toggleSave = function(id) {
  const post = postsList.find(p => p.id === id);
  if (post) {
    post.isSaved = !post.isSaved;
    renderPosts();
  }
};

// 5. Apagar Publicação
window.deletePost = function(id) {
  if (confirm('Tem certeza de que deseja apagar esta publicação?')) {
    postsList = postsList.filter(p => p.id !== id);
    renderPosts();
  }
};

// 6. Criar Postagem como Cecília
btnPublish.addEventListener('click', () => {
  const text = postInput.value.trim();

  if (!text) {
    alert('Escreva algo antes de publicar!');
    return;
  }

  const newPost = {
    id: Date.now(), // Gera um ID único baseado no timestamp
    userId: 'cecilia',
    authorName: 'Cecília',
    avatarImg: 'https://i.pravatar.cc/100?img=47',
    body: text,
    likes: 0,
    isLiked: false,
    isSaved: false
  };

  postsList.unshift(newPost);
  postInput.value = '';
  renderPosts();
});

// 7. Navegação pelas Abas
tabAll.addEventListener('click', () => {
  activeTab = 'all';
  tabAll.classList.add('active');
  tabSaved.classList.remove('active');
  renderPosts();
});

tabSaved.addEventListener('click', () => {
  activeTab = 'saved';
  tabSaved.classList.add('active');
  tabAll.classList.remove('active');
  renderPosts();
});

// 8. Busca
searchInput.addEventListener('input', () => {
  renderPosts();
});

// Inicializa a aplicação
loadFeed();