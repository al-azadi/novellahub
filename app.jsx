import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation, initReactI18next } from 'react-i18next';
import i18n from 'i18next';

// ------------ i18n setup (client-side, sample translations) ------------
i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        title: 'NovellaHub',
        subtitle: 'Publish novels, poems & songs — discuss in rooms',
        login: 'Sign In / Register',
        logout: 'Sign Out',
        publish: 'Publish',
        editor_placeholder: 'Write the first lines of your masterpiece...',
        create_room: 'Create Room',
        join_room: 'Join Room',
        guest_comment: 'Comment as guest',
        customize_theme: 'Customize Theme',
        language: 'Language',
        profile: 'Profile',
        rooms: 'Rooms',
        explore: 'Explore',
        save: 'Save',
        cancel: 'Cancel',
      },
    },
    es: {
      translation: {
        title: 'NovellaHub',
        subtitle: 'Publica novelas, poemas y canciones — discute en salas',
        login: 'Iniciar sesión / Registrarse',
        logout: 'Cerrar sesión',
        publish: 'Publicar',
        editor_placeholder: 'Escribe las primeras líneas de tu obra maestra...',
        create_room: 'Crear Sala',
        join_room: 'Unirse a la Sala',
        guest_comment: 'Comentar como invitado',
        customize_theme: 'Personalizar Tema',
        language: 'Idioma',
        profile: 'Perfil',
        rooms: 'Salas',
        explore: 'Explorar',
        save: 'Guardar',
        cancel: 'Cancelar',
      },
    },
    bn: {
      translation: {
        title: 'NovellaHub',
        subtitle: 'উপন্যাস, কবিতা ও গান প্রকাশ করুন — রুমে আলোচনা করুন',
        login: 'সাইন ইন / রেজিস্টার',
        logout: 'লগআউট',
        publish: 'প্রকাশ করুন',
        editor_placeholder: 'আপনার মহাকাব্যের প্রথম লাইন লিখুন...',
        create_room: 'রুম তৈরি',
        join_room: 'রুমে যোগ দিন',
        guest_comment: 'অতিথি হিসেবে মন্তব্য করুন',
        customize_theme: 'থিম কাস্টমাইজ করুন',
        language: 'ভাষা',
        profile: 'প্রোফাইল',
        rooms: 'রুম',
        explore: 'এক্সপ্লোর',
        save: 'সংরক্ষণ',
        cancel: 'বাতিল',
      },
    },
  },
});

// ------------ Utility helpers (localStorage-backed simple DB) ------------
const LS = {
  get(key, fallback) {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  },
  set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  zh: {
    appName: "小说中心",
    welcome: "欢迎来到作者与读者的社区",
    language: "语言",
    theme: "主题",
    login: "登录",
    logout: "退出",
    register: "注册",
    guestComment: "访客评论",
    rooms: "讨论房间",
    joinRoom: "加入房间",
    createRoom: "创建房间",
    publish: "发布作品",
    novel: "小说",
    poem: "诗歌",
    song: "歌曲",
    yourTheme: "你的主题",
    saveTheme: "保存主题",
    post: "发布",
    writeSomething: "写点什么..."
  }
};

// default data boot
if (!LS.get('novellahub_data', null)) {
  LS.set('novellahub_data', {
    users: {},
    rooms: [
      { id: 'general', title: 'General', members: [], messages: [] },
      { id: 'poetry', title: 'Poetry', members: [], messages: [] },
    ],
    posts: [],
  });
}

// ------------ Components ------------
function Header({ user, onAuthOpen, onLogout, setLang }) {
  const { t } = useTranslation();
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">{t('title')}</div>
          <div className="text-sm text-slate-500 hidden md:block">{t('subtitle')}</div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector setLang={setLang} />
          {user ? (
            <>
              <div className="text-sm">{user.name}</div>
              <button className="btn" onClick={onLogout}>{t('logout')}</button>
            </>
          ) : (
            <button className="btn" onClick={onAuthOpen}>{t('login')}</button>
          )}
        </div>
      </div>
    </header>
  );
}

function LanguageSelector({ setLang }) {
  const { i18n } = useTranslation();
  return (
    <select
      aria-label="language"
      defaultValue={i18n.language}
      onChange={(e) => { i18n.changeLanguage(e.target.value); setLang(e.target.value); }}
      className="rounded-md border px-2 py-1 text-sm"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="bn">বাংলা</option>
    </select>
  );
}

function AuthModal({ open, onClose, onLogin }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!open) {
      setName(''); setUsername(''); setPassword('');
    }
  }, [open]);

  function handleRegister() {
    if (!username || !password) return alert('username & password required');
    const data = LS.get('novellahub_data');
    if (data.users[username]) return alert('user exists');
    data.users[username] = { name: name || username, password, theme: null };
    LS.set('novellahub_data', data);
    onLogin({ username, name: name || username });
    onClose();
  }

  function handleLogin() {
    const data = LS.get('novellahub_data');
    const u = data.users[username];
    if (!u || u.password !== password) return alert('invalid');
    onLogin({ username, name: u.name });
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-2">{t('login')}</h3>
        <input className="input" placeholder="Full name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2 mt-3">
          <button className="btn" onClick={handleLogin}>{t('login')}</button>
          <button className="btn-ghost" onClick={handleRegister}>Register</button>
          <button className="btn-ghost" onClick={onClose}>{t('cancel')}</button>
        </div>
      </div>
    </div>
  );
}

function Editor({ user, onPublish }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('novel');

  function handlePublish() {
    if (!content || !title) return alert('title & content required');
    const data = LS.get('novellahub_data');
    const post = { id: Date.now().toString(), author: user?.username || 'guest', authorName: user?.name || 'Guest', title, content, type, createdAt: new Date().toISOString() };
    data.posts.unshift(post);
    LS.set('novellahub_data', data);
    setTitle(''); setContent('');
    onPublish(post);
  }

  return (
    <section className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <input className="input flex-1" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="input w-40" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="novel">Novel</option>
          <option value="poem">Poem</option>
          <option value="song">Song</option>
        </select>
      </div>
      <textarea className="textarea w-full" rows={6} placeholder={t('editor_placeholder')} value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="flex justify-end gap-2 mt-2">
        <button className="btn" onClick={handlePublish}>{t('publish')}</button>
      </div>
    </section>
  );
}

function Rooms({ user, onOpenRoom }) {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState(LS.get('novellahub_data').rooms || []);
  const [title, setTitle] = useState('');

  function createRoom() {
    if (!user) return alert('You must be signed in to create a room');
    if (!title) return;
    const data = LS.get('novellahub_data');
    const r = { id: Date.now().toString(), title, members: [], messages: [] };
    data.rooms.push(r);
    LS.set('novellahub_data', data);
    setRooms([...rooms, r]);
    setTitle('');
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{t('rooms')}</h4>
        <div className="flex items-center gap-2">
          <input className="input" placeholder="New room title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button className="btn" onClick={createRoom}>{t('create_room')}</button>
        </div>
      </div>
      <div className="grid gap-2">
        {rooms.map((r) => (
          <div key={r.id} className="p-3 border rounded hover:bg-slate-50 cursor-pointer flex justify-between items-center" onClick={() => onOpenRoom(r)}>
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-slate-500">{r.messages?.length || 0} messages</div>
            </div>
            <div>
              <button className="btn-ghost">{t('join_room')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomModal({ room, user, onClose }) {
  if (!room) return null;
  const dataKey = `room_${room.id}`;
  const [messages, setMessages] = useState(room.messages || []);
  const [text, setText] = useState('');

  useEffect(() => { setMessages(room.messages || []); }, [room]);

  function postMessage(asGuest = false) {
    if (!text) return;
    const author = asGuest ? 'Guest' : (user?.name || 'Member');
    const m = { id: Date.now().toString(), author, text, createdAt: new Date().toISOString() };
    const data = LS.get('novellahub_data');
    const found = data.rooms.find((r) => r.id === room.id);
    if (!found) return alert('room error');
    found.messages.push(m);
    LS.set('novellahub_data', data);
    setMessages([...messages, m]);
    setText('');
  }

  function joinRoom() {
    if (!user) return alert('you must sign in to join rooms');
    const data = LS.get('novellahub_data');
    const found = data.rooms.find((r) => r.id === room.id);
    if (!found.members.includes(user.username)) found.members.push(user.username);
    LS.set('novellahub_data', data);
    alert('joined');
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white max-w-3xl w-full rounded-lg p-4 shadow">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">{room.title}</h3>
          <div className="flex gap-2">
            <button className="btn" onClick={joinRoom}>Join</button>
            <button className="btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="max-h-72 overflow-auto border rounded p-2 mb-2">
          {messages.map((m) => (
            <div key={m.id} className="mb-2">
              <div className="text-sm font-medium">{m.author} <span className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</span></div>
              <div className="text-sm">{m.text}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write message..." />
          <button className="btn" onClick={() => postMessage(false)}>Send</button>
          <button className="btn-ghost" onClick={() => postMessage(true)}>Send as Guest</button>
        </div>
      </div>
    </div>
  );
}

function ThemeCustomizer({ user, onSave }) {
  const { t } = useTranslation();
  const [primary, setPrimary] = useState('#0ea5a4');
  const [bg, setBg] = useState('#ffffff');

  useEffect(() => {
    if (!user) return;
    const data = LS.get('novellahub_data');
    const u = data.users[user.username];
    if (!u?.theme) return;
    setPrimary(u.theme.primary || primary);
    setBg(u.theme.bg || bg);
  }, [user]);

  function save() {
    if (!user) return alert('must be signed in');
    const data = LS.get('novellahub_data');
    data.users[user.username].theme = { primary, bg };
    LS.set('novellahub_data', data);
    onSave({ primary, bg });
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h4 className="font-semibold mb-2">{t('customize_theme')}</h4>
      <div className="flex gap-2 flex-wrap">
        <label className="flex items-center gap-2">Primary<input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} /></label>
        <label className="flex items-center gap-2">Background<input type="color" value={bg} onChange={(e) => setBg(e.target.value)} /></label>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn" onClick={save}>{t('save')}</button>
      </div>
    </div>
  );
}

function PostsList({ onOpenRoom }) {
  const [posts, setPosts] = useState(LS.get('novellahub_data').posts || []);
  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <article key={p.id} className="p-4 bg-white rounded shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <div className="text-xs text-slate-500">{p.type} • by {p.authorName}</div>
            </div>
            <div>
              <button className="btn-ghost" onClick={() => onOpenRoom({ id: 'general', title: 'Discuss' })}>Discuss</button>
            </div>
          </div>
          <p className="whitespace-pre-wrap">{p.content.slice(0, 400)}{p.content.length > 400 ? '…' : ''}</p>
        </article>
      ))}
    </div>
  );
}

// ------------ App ------------
export default function App() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [theme, setTheme] = useState({ primary: '#0ea5a4', bg: '#f8fafc' });
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // load last signed in user (very small mock of auth)
    const last = LS.get('novellahub_last_user', null);
    if (last) setUser(last);
    // load theme if user had
    if (last) {
      const data = LS.get('novellahub_data');
      const u = data.users[last.username];
      if (u?.theme) setTheme(u.theme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--page-bg', theme.bg);
  }, [theme]);

  function handleLogin(u) { setUser(u); LS.set('novellahub_last_user', u); const data = LS.get('novellahub_data'); if (data.users[u.username]?.theme) setTheme(data.users[u.username].theme); }
  function handleLogout() { setUser(null); LS.set('novellahub_last_user', null); }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--page-bg)' }}>
      <style>{`
        :root{ --primary: ${theme.primary}; --page-bg:${theme.bg} }
        .btn{ background:var(--primary); color:white; padding:0.5rem 0.75rem; border-radius:8px }
        .btn-ghost{ background:transparent; border:1px solid #ddd; padding:0.4rem 0.6rem; border-radius:8px }
        .input{ padding:0.45rem 0.6rem; border:1px solid #e6e6e6; border-radius:8px }
        .textarea{ padding:0.6rem; border:1px solid #e6e6e6; border-radius:8px }
      `}</style>
      <Header user={user} onAuthOpen={() => setAuthOpen(true)} onLogout={handleLogout} setLang={setLang} />

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Editor user={user} onPublish={(p) => alert('Published')} />
          <PostsList onOpenRoom={(r) => setActiveRoom(r)} />
        </div>

        <aside className="space-y-4">
          <Rooms user={user} onOpenRoom={(r) => setActiveRoom(r)} />
          <ThemeCustomizer user={user} onSave={(t) => setTheme(t)} />
        </aside>
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onLogin={handleLogin} />
      <RoomModal room={activeRoom} user={user} onClose={() => setActiveRoom(null)} />

      <footer className="text-sm text-center p-4 text-slate-500">
        Built for creators — responsive, local-first, privacy-friendly.
      </footer>
    </div>
  );
}

// If user dropped into this file directly for quick test (not required for real project)
if (typeof document !== 'undefined') {
  const el = document.getElementById('root');
  if (el) createRoot(el).render(React.createElement(App));
}
