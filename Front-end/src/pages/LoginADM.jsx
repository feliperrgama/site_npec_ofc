import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoginLogo from "../components/LoginLogo";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function LoginADM() {
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [saveLogin, setSaveLogin] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    // ── Validação ────────────────────────────────────────
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      // A API usa OAuth2PasswordRequestForm → application/x-www-form-urlencoded
      const body = new URLSearchParams();
      body.append("username", email);   // FastAPI lê "username" como e-mail
      body.append("password", password);

      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Credenciais inválidas.");
        return;
      }

      // Salva token — localStorage se "manter conectado", sessionStorage se não
      const storage = saveLogin ? localStorage : sessionStorage;
      storage.setItem("access_token", data.access_token);
      storage.setItem("user", JSON.stringify(data.user));

      toast.success(`Bem-vindo, ${data.user.nome}!`);
      navigate("/admin/dashboard");
    } catch {
      toast.error("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      {/* Blobs decorativos */}
      <div className="login-bg" aria-hidden="true">
        <span className="blob blob-1" />
        <span className="blob blob-2" />
        <span className="blob blob-3" />
      </div>

      <div className="login-card">
        {/* ── Formulário ── */}
        <div className="login-form-side">
          <div className="login-header">
            <div className="login-badge">ADM</div>
            <h1>Área Restrita</h1>
            <p>Acesso exclusivo para administradores do NPEC</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* E-mail */}
            <div className="field-group">
              <label htmlFor="email">E-mail</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senha */}
            <div className="field-group">
              <label htmlFor="password">Senha</label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Manter conectado */}
            <label className="save-label">
              <input
                type="checkbox"
                checked={saveLogin}
                onChange={(e) => setSaveLogin(e.target.checked)}
                disabled={loading}
              />
              <span className="checkmark" />
              Manter-me conectado
            </label>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Entrando…</> : "Entrar"}
            </button>
          </form>
        </div>

        {/* ── Logo direita ── */}
        <div className="login-logo-side" aria-hidden="true">
          <LoginLogo />
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #020b18;
          overflow: hidden;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* Blobs */
        .login-bg { position: absolute; inset: 0; pointer-events: none; }
        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: .35;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .blob-1 { width:520px;height:520px;background:#0033a0;top:-120px;left:-140px;animation-delay:0s; }
        .blob-2 { width:380px;height:380px;background:#00c8c8;bottom:-80px;right:-100px;animation-delay:-4s; }
        .blob-3 { width:280px;height:280px;background:#0066ff;top:50%;left:55%;animation-delay:-8s; }
        @keyframes drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(40px,30px) scale(1.08); }
        }

        /* Card */
        .login-card {
          position: relative; z-index: 1;
          display: flex;
          width: min(900px, 95vw);
          min-height: 520px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.06);
        }

        /* Formulário */
        .login-form-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 22px;
          padding: 52px 48px;
          background: rgba(8,20,45,0.94);
          border-right: 1px solid rgba(0,200,200,.1);
        }

        .login-header { display:flex; flex-direction:column; gap:8px; }

        .login-badge {
          display:inline-flex; align-items:center; justify-content:center;
          width:44px; height:22px; border-radius:6px;
          background:linear-gradient(135deg,#0055ff,#00c8c8);
          color:#fff; font-size:10px; font-weight:800; letter-spacing:.12em;
          margin-bottom:2px;
        }

        .login-header h1 { font-size:26px; font-weight:700; color:#fff; }
        .login-header p  { font-size:13px; color:rgba(255,255,255,.4); line-height:1.5; }

        /* Campos */
        .field-group { display:flex; flex-direction:column; gap:7px; }
        .field-group label { font-size:12.5px; font-weight:600; color:rgba(255,255,255,.65); letter-spacing:.04em; }

        .input-wrap { position:relative; display:flex; align-items:center; }

        .input-icon { position:absolute; left:14px; display:flex; color:rgba(255,255,255,.28); }
        .input-icon svg { width:15px; height:15px; }

        .input-wrap input {
          width:100%; height:46px;
          padding:0 44px 0 42px;
          border-radius:12px;
          border:1.5px solid rgba(255,255,255,.09);
          background:rgba(255,255,255,.05);
          color:#fff; font-size:14px; outline:none;
          transition:border-color .2s,background .2s,box-shadow .2s;
        }
        .input-wrap input::placeholder { color:rgba(255,255,255,.22); }
        .input-wrap input:focus {
          border-color:#00c8c8;
          background:rgba(0,200,200,.06);
          box-shadow:0 0 0 3px rgba(0,200,200,.15);
        }
        .input-wrap input:disabled { opacity:.5; cursor:not-allowed; }

        .toggle-pass {
          position:absolute; right:12px;
          background:none; border:none; cursor:pointer;
          color:rgba(255,255,255,.28); display:flex;
          padding:4px; border-radius:6px; transition:color .2s;
        }
        .toggle-pass:hover { color:rgba(255,255,255,.65); }
        .toggle-pass svg { width:15px; height:15px; }

        /* Checkbox */
        .save-label {
          display:flex; align-items:center; gap:10px;
          font-size:13px; color:rgba(255,255,255,.45);
          cursor:pointer; user-select:none;
        }
        .save-label input[type="checkbox"] { display:none; }
        .checkmark {
          width:17px; height:17px; border-radius:5px;
          border:1.5px solid rgba(255,255,255,.18);
          background:rgba(255,255,255,.05);
          flex-shrink:0; transition:all .2s; position:relative;
        }
        .save-label input:checked ~ .checkmark { background:#00c8c8; border-color:#00c8c8; }
        .save-label input:checked ~ .checkmark::after {
          content:''; position:absolute;
          top:2px; left:5px;
          width:5px; height:9px;
          border:2px solid #020b18;
          border-top:none; border-left:none;
          transform:rotate(45deg);
        }

        /* Botão */
        .btn-submit {
          width:100%; height:48px; border:none; border-radius:14px;
          background:linear-gradient(135deg,#0055ff 0%,#00c8c8 100%);
          color:#fff; font-size:15px; font-weight:700; letter-spacing:.04em;
          cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px;
          transition:opacity .2s,transform .15s,box-shadow .2s;
          box-shadow:0 4px 24px rgba(0,100,255,.3);
          margin-top:6px;
        }
        .btn-submit:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); box-shadow:0 6px 32px rgba(0,100,255,.45); }
        .btn-submit:active:not(:disabled) { transform:scale(.97); }
        .btn-submit:disabled { opacity:.5; cursor:not-allowed; }

        /* Spinner */
        .spinner {
          width:17px; height:17px;
          border:2.5px solid rgba(255,255,255,.3);
          border-top-color:#fff; border-radius:50%;
          animation:spin .7s linear infinite;
        }
        @keyframes spin { to { transform:rotate(360deg); } }

        /* Logo direita */
        .login-logo-side {
          width:320px;
          display:flex; align-items:center; justify-content:center;
          background:linear-gradient(145deg,#001235 0%,#002b6b 60%,#003d5c 100%);
        }

        /* Responsivo */
        @media (max-width:680px) {
          .login-logo-side { display:none; }
          .login-form-side { padding:40px 24px; }
          .login-card { border-radius:20px; }
        }
      `}</style>
    </div>
  );
}

export default LoginADM;
