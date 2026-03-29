import { C } from "./colors";

export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${C.bg};
    color: ${C.onSurface};
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #353436; border-radius: 4px; }

  .font-headline { font-family: 'Manrope', sans-serif; }
  .icon { font-family: 'Material Symbols Outlined'; font-weight: 400; font-style: normal; font-size: 20px; line-height: 1; letter-spacing: normal; text-transform: none; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; vertical-align: middle; }
  .icon-fill { font-variation-settings: 'FILL' 1; }

  .glass-panel {
    background: rgba(42,42,43,0.6);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }
  .ai-glow { box-shadow: 0 0 48px -10px rgba(192,193,255,0.12); }
  .glow-shadow { box-shadow: 0 24px 48px -12px rgba(192,193,255,0.05); }
  .luminous-shadow { box-shadow: 0 24px 48px -12px rgba(192,193,255,0.07); }

  .gradient-text {
    background: linear-gradient(135deg, #c0c1ff 0%, #8083ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .signature-gradient { background: linear-gradient(135deg, #c0c1ff 0%, #8083ff 100%); }

  .curator-pulse {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: ${C.tertiary};
    box-shadow: 0 0 8px rgba(255,183,131,0.8);
    animation: pulse 2s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,183,131,0.8); }
    50% { opacity: 0.5; box-shadow: 0 0 16px rgba(255,183,131,0.4); }
  }

  .nav-item {
    display: flex; align-items: center; gap: 16px;
    padding: 12px 16px; border-radius: 10px;
    font-family: 'Inter', sans-serif; font-size: 11px;
    text-transform: uppercase; letter-spacing: 0.15em;
    text-decoration: none; transition: all 0.2s ease;
    cursor: pointer; color: #908fa0; border: none;
    background: transparent; width: 100%;
  }
  .nav-item:hover { color: #c7c4d7; background: rgba(255,255,255,0.04); transform: translateX(2px); }
  .nav-item.active { color: #c0c1ff; background: rgba(192,193,255,0.08); }

  .btn-primary {
    background: linear-gradient(135deg, #c0c1ff 0%, #8083ff 100%);
    color: #1000a9; border: none; border-radius: 999px;
    padding: 12px 24px; font-family: 'Inter', sans-serif;
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.15em; cursor: pointer;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:active { transform: scale(0.95); }

  .btn-ghost {
    background: transparent; border: 1px solid rgba(70,69,84,0.4);
    color: ${C.onSurfaceVariant}; border-radius: 999px;
    padding: 8px 20px; font-family: 'Inter', sans-serif;
    font-size: 11px; font-weight: 500; cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-ghost:hover { border-color: rgba(192,193,255,0.5); background: rgba(192,193,255,0.05); color: ${C.primary}; }

  .chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 12px; border-radius: 999px;
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; font-family: 'Inter', sans-serif;
  }

  .article-card {
    background: ${C.surfaceLow}; border-radius: 16px;
    overflow: hidden; border: 1px solid transparent;
    transition: all 0.3s ease; cursor: pointer;
  }
  .article-card:hover { border-color: rgba(70,69,84,0.3); transform: translateY(-2px); }

  .input-field {
    background: transparent; border: none; outline: none;
    color: ${C.onSurface}; font-family: 'Inter', sans-serif;
    font-size: 14px; width: 100%;
  }
  .input-field::placeholder { color: #4d4d54; }

  .search-bar-container {
    display: flex; align-items: center;
    background: ${C.surfaceLowest}; border-radius: 999px;
    padding: 8px 16px; gap: 8px;
  }

  .mobile-nav {
    display: none;
  }

  @media (max-width: 768px) {
    .sidebar { display: none !important; }
    .mobile-nav { display: flex !important; }
    .main-content { margin-left: 0 !important; }
    .right-sidebar { display: none !important; }
    .top-nav-search { display: none !important; }
  }

  .tag { color: ${C.primary}; background: rgba(192,193,255,0.12); border: 1px solid rgba(192,193,255,0.2); }
  .tag-tertiary { color: ${C.tertiary}; background: rgba(255,183,131,0.12); border: 1px solid rgba(255,183,131,0.2); }

  .chat-bubble-user {
    background: ${C.surfaceHigh}; border-radius: 20px 20px 4px 20px;
    padding: 16px 22px; max-width: 75%;
    color: ${C.onSurface}; font-size: 14px; line-height: 1.6;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }

  .ai-response-card {
    border-radius: 24px; padding: 32px;
    border: 1px solid rgba(192,193,255,0.08);
  }

  .insight-card {
    background: rgba(53,52,54,0.5); border-radius: 16px;
    padding: 16px; border: 1px solid rgba(70,69,84,0.2);
    display: flex; gap: 12px; align-items: flex-start;
  }

  .history-item {
    padding: 12px 14px; border-radius: 12px;
    cursor: pointer; border: 1px solid transparent;
    transition: all 0.2s ease;
  }
  .history-item:hover { background: ${C.surfaceHigh}; }
  .history-item.active { background: ${C.surfaceHigh}; border-color: rgba(192,193,255,0.2); }

  .hero-section {
    position: relative; border-radius: 20px;
    overflow: hidden; cursor: pointer;
  }
  .hero-section:hover img { transform: scale(1.03); }
  .hero-section img { transition: transform 0.7s ease; }

  .search-result-item {
    padding: 20px; border-radius: 16px;
    border: 1px solid rgba(70,69,84,0.15);
    background: ${C.surfaceLow};
    transition: all 0.2s ease; cursor: pointer;
  }
  .search-result-item:hover { border-color: rgba(192,193,255,0.25); background: ${C.surfaceHigh}; }

  .tab-btn {
    padding: 8px 20px; border-radius: 999px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    border: none; background: transparent;
    color: ${C.outline}; font-family: 'Inter', sans-serif;
    transition: all 0.2s ease;
  }
  .tab-btn.active { background: ${C.surfaceHighest}; color: ${C.primary}; }
  .tab-btn:hover:not(.active) { color: ${C.onSurfaceVariant}; }

  .detail-body { font-size: 16px; line-height: 1.85; color: ${C.onSurfaceVariant}; }
  .detail-body p { margin-bottom: 20px; }

  .gradient-border-card {
    position: relative; background: ${C.surfaceContainer};
    border-radius: 20px; padding: 24px;
  }
  .gradient-border-card::before {
    content: ''; position: absolute; inset: 0;
    border-radius: 20px; padding: 1px;
    background: linear-gradient(135deg, rgba(192,193,255,0.3), rgba(128,131,255,0.1));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    pointer-events: none;
  }

  .typing-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${C.primary}; opacity: 0.5;
    animation: typing 1.4s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-6px); opacity: 1; }
  }

  .fade-in { animation: fadeIn 0.4s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
