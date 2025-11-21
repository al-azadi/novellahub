// app.js (CDN React + i18next + localStorage-backed app)
// uses React and ReactDOM from UMD and react-i18next UMD (both loaded by index.html)

const { useState, useEffect, useRef } = React;
const { I18nextProvider, useTranslation } = ReactI18next;

// ---------- translations ----------
i18next.init({
  lng: localStorage.getItem('novellahub_lng') || 'en',
  resources: {
    en: { translation: {
      title: "NovellaHub",
      subtitle: "Publish novels, poems & songs — discuss in rooms",
      login: "Sign In / Register",
      logout: "Sign Out",
      publish: "Publish",
      write_placeholder: "Write the first lines of your masterpiece...",
      create_room: "Create Room",
      join_room: "Join Room",
      guest_comment: "Comment as guest",
      customize_theme: "Customize Theme",
      language: "Language",
      profile: "Profile",
      rooms: "Rooms",
      explore: "Explore",
      save: "Save",
      cancel: "Cancel",
      novel: "Novel",
      poem: "Poem",
      song: "Song",
      enter_title: "Title",
      author: "Author",
      output_preview: "Output Preview",
      join_notice: "You must sign in to join rooms",
      comment_placeholder: "Write a comment..."
    }},
    bn: { translation: {
      title: "নভেলা হাব",
      subtitle: "উপন্যাস, কবিতা ও গান প্রকাশ করুন — রুমে আলোচনা করুন",
      login: "সাইন ইন / রেজিস্টার",
      logout: "লগআউট",
      publish: "প্রকাশ করুন",
      write_placeholder: "আপনার মহাকাব্যের প্রথম লাইন লিখুন...",
      create_room: "রুম তৈরি",
      join_room: "রুমে যোগ দিন",
      guest_comment: "অতিথি হিসেবে মন্তব্য করুন",
      customize_theme: "থিম কাস্টমাইজ করুন",
      language: "ভাষা",
      profile: "প্রোফাইল",
      rooms: "রুম",
      explore: "এক্সপ্লোর",
      save: "সংরক্ষণ",
      cancel: "বাতিল",
      novel: "উপন্যাস",
      poem: "কবিতা",
      song: "গান",
      enter_title: "শিরোনাম",
      author: "লেখক",
      output_preview: "আউটপুট প্রিভিউ",
      join_notice: "রুমে যোগ দিতে আপনাকে সাইন ইন করতে হবে",
      comment_placeholder: "মন্তব্য লিখুন..."
    }},
    zh: { translation: {
      title: "小说中心",
      subtitle: "发布小说、诗歌与歌曲 — 在房间讨论",
      login: "登录 / 注册",
      logout: "退出",
      publish: "发布",
      write_placeholder: "写下你的作品开头…",
      create_room: "创建房间",
      join_room: "加入房间",
      guest_comment: "作为访客评论",
      customize_theme: "自定义主题",
      language: "语言",
      profile: "个人主页",
      rooms: "房间",
      explore: "探索",
      save: "保存",
      cancel: "取消",
      novel: "小说",
      poem: "诗歌",
      song: "歌曲",
      enter_title: "标题",
      author: "作者",
      output_preview: "输出预览",
      join_notice: "加入房间需要登录",
      comment_placeholder: "写下你的评论..."
    }}
  }
});

// Remember language choice
i18next.on('languageChanged', (lng) => localStorage.setItem('novellahub_lng', lng));

// ---------- simple local DB helpers ----------
const DB = {
  load(){
    return JSON.parse(localStorage.getItem('novellahub_data') || '{"users":{},"rooms":[{"id":"general","title":"General","members":[],"messages":[]}],"posts":[]}');
  },
  save(data){ localStorage.setItem('novellahub_data', JSON.stringify(data)); },
  loadLastUser(){ return JSON.parse(localStorage.getItem('novellahub_user') || 'null'); },
  saveLastUser(u){ if(u) localStorage.setItem('novellahub_user', JSON.stringify(u)); else localStorage.removeItem('novellahub_user'); }
}

// ---------- small components ----------
function Header({ user, onAuthOpen, onLogout, setLang, onOpenProfile }) {
  const { t } = useTranslation();
  return (
    <header className="site card" style={{display:'flex',alignItems:'center'}}>
      <div className="brand">
        <img src="/mnt/data/f9104d00-eb58-4b1e-a2f7-e759fd370a65.png" alt="logo" onError={(e)=>{e.target.style.display='none'}}/>
        <div>
          <h1 style={{margin:0}}>{t('title')}</h1>
          <div className="small">{t('subtitle')}</div>
        </div>
      </div>

      <div className="actions">
        <select aria-label="language" defaultValue={i18next.language} onChange={(e)=>{i18next.changeLanguage(e.target.value); setLang(e.target.value)}}>
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
          <option value="zh">中文</option>
        </select>

        { user ? (
          <>
            <div className="small" style={{marginLeft:8}}>{user.name}</div>
            <button className="btn ghost" onClick={onOpenProfile}>{t('profile')}</button>
            <button className="btn" onClick={onLogout}>{t('logout')}</button>
          </>
        ) : (
          <button className="btn" onClick={onAuthOpen}>{t('login')}</button>
        )}
      </div>
    </header>
  );
}

function AuthModal({ open, onClose, onLogin }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(()=>{ if(!open){ setName(''); setUsername(''); setPassword(''); setMode('login'); }}, [open]);

  function register(){
    if(!username || !password) return alert('username & password required');
    const data = DB.load();
    if(data.users[username]) return alert('user exists');
    data.users[username] = { name: name || username, password, theme: {accent: getComputedStyle(document.documentElement).getPropertyValue('--accent')||'#0ea5a4', bg: getComputedStyle(document.documentElement).getPropertyValue('--page-bg')||'#f8fafc' }};
    DB.save(data);
    onLogin({ username, name: name || username });
    onClose();
  }
  function login(){
    const data = DB.load();
    const u = data.users[username];
    if(!u || u.password !== password) return alert('invalid credentials');
    onLogin({ username, name: u.name });
    onClose();
  }

  if(!open) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:60}}>
      <div className="card" style={{maxWidth:420,width:'95%'}}>
        <h3>{t('login')}</h3>
        <div style={{display:'flex',gap:8,marginBottom:8}}>
          <button className="btn ghost" onClick={()=>setMode('login')}>Login</button>
          <button className="btn ghost" onClick={()=>setMode('register')}>Register</button>
        </div>

        { mode==='register' && <input placeholder="Full name (optional)" value={name} onChange={e=>setName(e.target.value)} className="editor title" /> }
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} className="editor title" />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="editor title" />

        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button className="btn ghost" onClick={onClose}>{t('cancel')}</button>
          { mode==='login' ? <button className="btn" onClick={login}>{t('login')}</button> : <button className="btn" onClick={register}>Register</button> }
        </div>
      </div>
    </div>
  );
}

// ---------- Editor & publishing ----------
function Editor({ user, onPublish }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('novel');
  const [content, setContent] = useState('');

  function publish(){
    if(!title || !content) return alert('title & content required');
    const data = DB.load();
    const post = { id: Date.now().toString(), author: user?.username || 'guest', authorName: user?.name || 'Guest', title, content, type, createdAt: new Date().toISOString() };
    data.posts.unshift(post);
    DB.save(data);
    setTitle(''); setContent(''); onPublish && onPublish(post);
  }

  return (
    <div className="card editor">
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <input className="title" placeholder={t('enter_title')} value={title} onChange={e=>setTitle(e.target.value)} />
        <select value={type} onChange={e=>setType(e.target.value)} className="title" style={{width:140}}>
          <option value="novel">{t('novel')}</option>
          <option value="poem">{t('poem')}</option>
          <option value="song">{t('song')}</option>
        </select>
        <div style={{marginLeft:'auto'}} className="small">{t('author')}: {user?user.name:'Guest'}</div>
      </div>

      <textarea placeholder={t('write_placeholder')} value={content} onChange={e=>setContent(e.target.value)} style={{marginTop:10}}></textarea>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <div className="small">{t('output_preview')}</div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn ghost" onClick={()=>{setTitle('');setContent('')}}>{t('cancel')}</button>
          <button className="btn" onClick={publish}>{t('publish')}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Posts list ----------
function PostsList({ onDiscuss }) {
  const [posts, setPosts] = useState(DB.load().posts || []);
  useEffect(()=>{ const onstorage=(e)=>{ setPosts(DB.load().posts || []); }; window.addEventListener('storage', onstorage); return ()=>window.removeEventListener('storage', onstorage); }, []);
  return (
    <div>
      {posts.length===0 && <div className="card small">No posts yet — be the first to publish.</div>}
      {posts.map(p=>(
        <article key={p.id} className="post card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h3 style={{margin:0}}>{p.title}</h3>
              <div className="muted">{p.type} • by {p.authorName} • {new Date(p.createdAt).toLocaleString()}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn ghost" onClick={()=>onDiscuss && onDiscuss({id:'general',title:'General'})}>Discuss</button>
            </div>
          </div>
          <p style={{whiteSpace:'pre-wrap',marginTop:8}}>{p.content.slice(0,400)}{p.content.length>400?'…':''}</p>
        </article>
      ))}
    </div>
  );
}

// ---------- Rooms & Chat ----------
function RoomsPanel({ user, onOpenRoom }) {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState(DB.load().rooms || []);
  const [title, setTitle] = useState('');

  function createRoom(){
    if(!user) return alert('You must be signed in to create a room');
    if(!title) return;
    const data = DB.load();
    const r = { id: Date.now().toString(), title, members:[], messages:[] };
    data.rooms.push(r); DB.save(data); setRooms([...rooms, r]); setTitle('');
  }

  useEffect(()=>{ const onstorage=(e)=>setRooms(DB.load().rooms || []); window.addEventListener('storage',onstorage); return ()=>window.removeEventListener('storage',onstorage); }, []);

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <h4 style={{margin:0}}>{t('rooms')}</h4>
        <div className="small">{rooms.length} rooms</div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <input className="title" placeholder={t('create_room')} value={title} onChange={e=>setTitle(e.target.value)} />
        <button className="btn" onClick={createRoom}>{t('create_room')}</button>
      </div>

      <div className="rooms-list">
        {rooms.map(r=>(
          <div key={r.id} className="room-item" onClick={()=>onOpenRoom(r)}>
            <div>
              <div style={{fontWeight:600}}>{r.title}</div>
              <div className="muted">{(r.messages||[]).length} messages • {(r.members||[]).length} members</div>
            </div>
            <div>
              <button className="btn ghost" onClick={(e)=>{e.stopPropagation(); onOpenRoom(r)}}>{t('join_room')}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomModal({ room, onClose, user }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState(room?.messages || []);
  const [text, setText] = useState('');
  const [joined, setJoined] = useState((room?.members || []).includes(user?.username));
  const ref = useRef();

  useEffect(()=>{ setMessages((DB.load().rooms.find(r=>r.id===room.id)||{}).messages || []); }, [room]);

  useEffect(()=>{ if(ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages]);

  if(!room) return null;

  function postMessage(asGuest=false){
    if(!text) return;
    const data = DB.load();
    const found = data.rooms.find(r=>r.id===room.id);
    if(!found) return alert('room error');
    const author = asGuest ? 'Guest' : (user?.username || 'Member');
    const m = { id: Date.now().toString(), authorName: asGuest ? 'Guest' : (user?.name || 'Member'), author, text, createdAt: new Date().toISOString() };
    found.messages.push(m);
    DB.save(data); setMessages(found.messages.slice()); setText('');
  }

  function join(){
    if(!user) return alert(t('join_notice'));
    const data = DB.load();
    const found = data.rooms.find(r=>r.id===room.id);
    if(!found.members.includes(user.username)) found.members.push(user.username);
    DB.save(data); setJoined(true);
    alert('joined');
  }

  function reportMessage(msgId){
    // simple flagging: mark message as reported in local storage
    const data = DB.load();
    const found = data.rooms.find(r=>r.id===room.id);
    const msg = found.messages.find(m=>m.id===msgId);
    msg.reported = true;
    DB.save(data);
    setMessages(found.messages.slice());
    alert('reported');
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:70}}>
      <div className="card" style={{width:'95%',maxWidth:900}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0}}>{room.title}</h3>
          <div style={{display:'flex',gap:8}}>
            <button className="btn ghost" onClick={join}>{joined ? 'Joined' : t('join_room')}</button>
            <button className="btn ghost" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="messages" ref={ref}>
          {messages.length===0 && <div className="small">No messages yet — start the conversation.</div>}
          {messages.map(m=>(
            <div key={m.id} style={{padding:8,borderBottom:'1px solid #f3f6f7',display:'flex',justifyContent:'space-between',gap:8}}>
              <div>
                <div style={{fontWeight:600}}>{m.authorName} <span className="small muted">• {new Date(m.createdAt).toLocaleString()}</span></div>
                <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
                {m.reported && <div className="small muted">[reported]</div>}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <button className="btn ghost" onClick={()=>postMessage(false)}>Reply</button>
                <button className="btn ghost" onClick={()=>reportMessage(m.id)}>Report</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8,marginTop:8}}>
          <input className="title" placeholder={t('comment_placeholder')} value={text} onChange={e=>setText(e.target.value)} />
          <button className="btn" onClick={()=>postMessage(false)}>Send</button>
          <button className="btn ghost" onClick={()=>postMessage(true)}>{t('guest_comment')}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Profile and Theme ----------
function ProfilePanel({ user, setUser }) {
  const { t } = useTranslation();
  const [accent, setAccent] = useState(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0ea5a4');
  const [bg, setBg] = useState(getComputedStyle(document.documentElement).getPropertyValue('--page-bg').trim() || '#f8fafc');
  const [name, setName] = useState(user?.name || '');

  useEffect(()=>{ setName(user?.name || ''); }, [user]);

  function saveTheme(){
    if(!user) return alert('sign in to save theme');
    const data = DB.load();
    data.users[user.username].theme = {accent, bg};
    DB.save(data);
    // apply
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--page-bg', bg);
    alert('Theme saved');
  }

  function logout(){
    DB.saveLastUser(null);
    DB.save(DB.load());
    setUser(null);
    alert('signed out');
  }

  return (
    <div className="card">
      <h4>{t('profile')}</h4>
      <div className="small">Signed in as: {user?.name}</div>
      <div style={{marginTop:8}}>
        <label className="small">Display name</label>
        <input className="title" value={name} onChange={e=>setName(e.target.value)} />
        <div style={{marginTop:8}} className="theme-row">
          <div>
            <div className="small">Accent</div>
            <input type="color" value={accent} onChange={e=>setAccent(e.target.value)} />
          </div>
          <div>
            <div className="small">Background</div>
            <input type="color" value={bg} onChange={e=>setBg(e.target.value)} />
          </div>
        </div>

        <div style={{display:'flex',gap:8,marginTop:10}}>
          <button className="btn" onClick={saveTheme}>{t('save')}</button>
          <button className="btn ghost" onClick={logout}>{t('logout')}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main App ----------
function AppRoot(){
  const [lang, setLang] = useState(i18next.language || 'en');
  const [user, setUser] = useState(DB.loadLastUser());
  const [authOpen, setAuthOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { t } = useTranslation();

  // on mount, apply theme if present
  useEffect(()=>{
    const last = DB.loadLastUser();
    if(last){
      const data = DB.load();
      const u = data.users[last.username];
      if(u?.theme){
        document.documentElement.style.setProperty('--accent', u.theme.accent || '#0ea5a4');
        document.documentElement.style.setProperty('--page-bg', u.theme.bg || '#f8fafc');
      }
    }
  }, []);

  function handleLogin(u){
    DB.saveLastUser(u);
    setUser(u);
    // load user's saved theme
    const data = DB.load();
    const udata = data.users[u.username];
    if(udata?.theme){
      document.documentElement.style.setProperty('--accent', udata.theme.accent || '#0ea5a4');
      document.documentElement.style.setProperty('--page-bg', udata.theme.bg || '#f8fafc');
    }
  }

  function handleLogout(){ DB.saveLastUser(null); setUser(null); }

  function openRoom(r){ setActiveRoom(r); }

  return (
    <div className="app">
      <Header user={user} onAuthOpen={()=>setAuthOpen(true)} onLogout={handleLogout} setLang={setLang} onOpenProfile={()=>setProfileOpen(true)} />
      <div className="grid">
        <main style={{minWidth:0}}>
          <div style={{display:'grid',gap:12}}>
            <div className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
              <div>
                <h2 style={{margin:0}}>{t('title')}</h2>
                <div className="small">{t('subtitle')}</div>
              </div>
              <div>
                <button className="btn ghost" onClick={()=>{window.scrollTo({top:0,behavior:'smooth'})}}>Top</button>
              </div>
            </div>

            <Editor user={user} onPublish={(post)=>{ alert('Published'); }} />
            <div className="card">
              <h4 style={{marginTop:0}}>Recent</h4>
              <PostsList onDiscuss={(r)=>openRoom(r)} />
            </div>
          </div>
        </main>

        <aside>
          <RoomsPanel user={user} onOpenRoom={(r)=>openRoom(r)} />
          <div style={{height:12}}></div>
          { user ? <ProfilePanel user={user} setUser={setUser} /> : <div className="card"><div className="small">Sign in to customize your theme, create rooms, and join discussions.</div></div> }
        </aside>
      </div>

      <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} onLogin={(u)=>{ handleLogin(u); setAuthOpen(false); }} />

      { activeRoom && <RoomModal room={activeRoom} onClose={()=>setActiveRoom(null)} user={user} /> }

      { profileOpen && user && <div style={{position:'fixed',right:12,bottom:12}}><ProfilePanel user={user} setUser={setUser} /></div> }

      <footer className="small card style={{marginTop:18,textAlign:'center'}}>
        Built for creators — responsive, local-first, privacy-friendly.
      </footer>
    </div>
  );
}
