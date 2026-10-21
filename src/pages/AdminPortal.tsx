// Handle Login Authentication (Compatível com Netlify e GitHub Pages)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = googleEmailInput.trim().toLowerCase();
    const cleanPass = passkeyInput.trim();

    if (!cleanEmail) {
      setAuthError('Por favor, informe o e-mail autorizado de administrador.');
      return;
    }
    if (!cleanPass) {
      setAuthError('Por favor, informe a senha de acesso do administrador.');
      return;
    }
    setAuthError('');
    setIsAuthenticating(true);

    const authorizedEmail = 'fedinheiroedestino@gmail.com'.toLowerCase();
    const validStaticKeys = ['WorthoraAdmin2026!', 'OmniAdmin2026!', 'worthoraadmin2026!', 'omniadmin2026!'];
    const customPass = localStorage.getItem('worthora_custom_pass');
    if (customPass) validStaticKeys.push(customPass);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          passkey: cleanPass
        })
      });

      const contentType = res.headers.get('content-type') || '';
      const isJsonResponse = contentType.includes('application/json');

      if (res.status === 429 && isJsonResponse) {
        const data = await res.json().catch(() => null);
        setAuthError(data?.error || 'Console bloqueado temporariamente por excesso de tentativas. Aguarde alguns minutos.');
        setIsAuthenticating(false);
        return;
      }

      if (res.ok && isJsonResponse) {
        const data = await res.json();
        if (data.success && data.token) {
          onLogin(data.token);
          setGoogleEmailInput('');
          setPasskeyInput('');
          setIsAuthenticating(false);
          return;
        } else {
          setAuthError(data.error || 'Acesso negado: Credenciais inválidas.');
          setIsAuthenticating(false);
          return;
        }
      } else if ((res.status === 401 || res.status === 403) && isJsonResponse) {
        const data = await res.json().catch(() => null);
        setAuthError(data?.error || 'Acesso negado: Credenciais inválidas.');
        setIsAuthenticating(false);
        return;
      }
    } catch (err) {
      // Netlify / GitHub Pages fallback
    }

    // Validação direta no navegador para hospedagens estáticas (Netlify / GitHub):
    const isPassValid = validStaticKeys.includes(cleanPass) || 
      validStaticKeys.map(k => k.toLowerCase()).includes(cleanPass.toLowerCase());

    if (cleanEmail === authorizedEmail && isPassValid) {
      const clientToken = `worthora_session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      onLogin(clientToken);
      setGoogleEmailInput('');
      setPasskeyInput('');
      showToast('Bem-vindo ao Worthora Owner Console!', 'success');
    } else {
      setAuthError('Acesso negado: E-mail ou senha incorretos. Use fedinheiroedestino@gmail.com e a senha mestra.');
    }
    setIsAuthenticating(false);
  };
