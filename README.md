# 🏁 ClearRun v2.1

App social de gamificação para completar jogos em grupos privados.

## Como rodar

```bash
npm install
npm run dev
```

Abre em `https://clearrun-taupe.vercel.app/`.

## Páginas

| Página | Descrição |
|--------|-----------|
| Home | Stats pessoais, grupos, feed unificado |
| Grupos Hub | Lista + criar/entrar |
| Grupo Detalhe | Feed, ranking, campanhas, membros (4 abas) |
| Check-in | Dentro do grupo, jogos das campanhas |
| Criar Grupo | Nome, gêneros, tempo mínimo → código |
| Entrar | Código ou link de convite |
| Perfil | Stats, badges, últimos clears |
| Configurações | Avatar, nome, tema claro/escuro, jogos favoritos |
| Notificações | Clears, entradas, campanhas, streaks |

## Estrutura

```
src/
├── main.jsx
├── App.jsx                      ← Root + Theme Provider
├── constants/
│   ├── colors.js                ← Tokens + tema claro/escuro
│   └── mockData.js              ← Dados simulados
├── utils/helpers.js             ← Easings, genCode
└── components/
    ├── SplashScreen.jsx         ← Animação de abertura
    ├── ui/index.jsx             ← Componentes UI + ThemeContext
    ├── layout/index.jsx         ← NavBar + BottomBar
    └── pages/index.jsx          ← Todas as 9 páginas
```

## Tecnologias

- React 18 + Vite 6
- Fontes: Press Start 2P + VT323
- Tema claro/escuro via React Context
- Zero dependências externas de UI
