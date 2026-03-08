<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Bem-vindo(a) à UGC Para Artistas</title>
    <!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Georgia,'Times New Roman',serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

    {{-- Preheader (oculto, exibido no snippet do cliente de email) --}}
    <div style="display:none;font-size:1px;color:#0a0a0a;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        Sua jornada na UGC começa agora. Conecte-se com marcas, crie conteúdo e seja remunerado. &#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
    </div>

    {{-- Wrapper externo --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;min-height:100vh;">
        <tr>
            <td align="center" style="padding:40px 16px 60px;">

                {{-- Container principal (600px) --}}
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

                    {{-- ========== CABEÇALHO COM LOGO ========== --}}
                    <tr>
                        <td style="padding-bottom:32px;text-align:center;">
                            {{-- Logo SVG inline --}}
                            <a href="{{ config('app.url') }}" style="display:inline-block;text-decoration:none;">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="64" height="64" style="display:block;">
                                    <path fill="#ffffff" d="M361.7,98.94L101.28,363.04v79.35h260.42v-79.35h-147.21l147.21-145.05v145.05h76.64V98.94h-76.64Z"/>
                                    <path fill="#ff7900" d="M361.7,363.04v338.02h76.64l260.38-264.1v-73.92h-337.02ZM438.34,582.01v-139.62h147.21l-147.21,139.62Z"/>
                                </svg>
                            </a>
                        </td>
                    </tr>

                    {{-- ========== CARD HERO ========== --}}
                    <tr>
                        <td style="background-color:#111111;border-radius:16px 16px 0 0;overflow:hidden;padding:0;">

                            {{-- Faixa decorativa superior laranja --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="height:4px;background:linear-gradient(90deg,#ff7900 0%,#ff9a3c 50%,#ff7900 100%);line-height:4px;font-size:4px;">&nbsp;</td>
                                </tr>
                            </table>

                            {{-- Conteúdo hero --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:52px 52px 44px;text-align:center;">

                                        {{-- Badge de boas-vindas --}}
                                        <div style="display:inline-block;background-color:#1a1a1a;border:1px solid #ff7900;border-radius:50px;padding:6px 20px;margin-bottom:28px;">
                                            <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#ff7900;">
                                                Cadastro Confirmado
                                            </span>
                                        </div>

                                        {{-- Título principal --}}
                                        <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:400;line-height:1.2;color:#ffffff;letter-spacing:-0.5px;">
                                            Bem-vindo(a),<br>
                                            <span style="color:#ff7900;font-style:italic;">{{ $user->name }}</span>
                                        </h1>

                                        {{-- Subtítulo --}}
                                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:17px;line-height:1.7;color:#9ca3af;">
                                            Sua conta na <strong style="color:#e5e7eb;">UGC Para Artistas</strong> foi criada com sucesso.<br>
                                            A plataforma que conecta músicos e criadores às melhores marcas do Brasil.
                                        </p>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    {{-- ========== CARD DIVISOR DECORATIVO ========== --}}
                    <tr>
                        <td style="background-color:#111111;padding:0 52px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="height:1px;background-color:#1f1f1f;line-height:1px;font-size:1px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- ========== PRÓXIMOS PASSOS ========== --}}
                    <tr>
                        <td style="background-color:#111111;padding:44px 52px;">

                            <h2 style="margin:0 0 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:#6b7280;">
                                Por onde começar
                            </h2>

                            {{-- Step 1 --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                                <tr>
                                    <td width="48" valign="top" style="padding-right:16px;">
                                        <div style="width:44px;height:44px;background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;text-align:center;line-height:44px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;font-weight:700;color:#ff7900;">
                                            1
                                        </div>
                                    </td>
                                    <td valign="top">
                                        <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:600;color:#e5e7eb;">
                                            Complete seu perfil
                                        </p>
                                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#6b7280;">
                                            Adicione sua bio, links das redes sociais e portfólio para atrair as melhores oportunidades.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            {{-- Step 2 --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                                <tr>
                                    <td width="48" valign="top" style="padding-right:16px;">
                                        <div style="width:44px;height:44px;background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;text-align:center;line-height:44px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;font-weight:700;color:#ff7900;">
                                            2
                                        </div>
                                    </td>
                                    <td valign="top">
                                        <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:600;color:#e5e7eb;">
                                            Explore as campanhas
                                        </p>
                                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#6b7280;">
                                            Navegue pelas campanhas disponíveis e candidate-se àquelas que combinam com seu estilo.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            {{-- Step 3 --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td width="48" valign="top" style="padding-right:16px;">
                                        <div style="width:44px;height:44px;background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;text-align:center;line-height:44px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;font-weight:700;color:#ff7900;">
                                            3
                                        </div>
                                    </td>
                                    <td valign="top">
                                        <p style="margin:0 0 4px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:600;color:#e5e7eb;">
                                            Crie, entregue e seja pago
                                        </p>
                                        <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#6b7280;">
                                            Envie seu conteúdo, receba aprovação da marca e o pagamento cai direto na sua carteira UGC.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    {{-- ========== CTA BUTTON ========== --}}
                    <tr>
                        <td style="background-color:#111111;padding:0 52px 52px;text-align:center;">

                            {{-- Linha divisória antes do CTA --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
                                <tr>
                                    <td style="height:1px;background-color:#1f1f1f;line-height:1px;font-size:1px;">&nbsp;</td>
                                </tr>
                            </table>

                            <a href="{{ $dashboardUrl }}"
                               style="display:inline-block;background-color:#ff7900;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:15px;font-weight:700;letter-spacing:0.5px;text-decoration:none;padding:16px 44px;border-radius:8px;line-height:1;">
                                Acessar minha conta
                            </a>

                            @if($isGoogleUser)
                            <p style="margin:20px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:#4b5563;">
                                Conta criada via Google — você pode entrar a qualquer momento usando o botão "Continuar com Google".
                            </p>
                            @endif

                        </td>
                    </tr>

                    {{-- ========== RODAPÉ ========== --}}
                    <tr>
                        <td style="background-color:#0d0d0d;border-radius:0 0 16px 16px;padding:32px 52px;text-align:center;border-top:1px solid #1a1a1a;">

                            {{-- Logo pequeno no footer --}}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="32" height="32" style="display:inline-block;margin-bottom:16px;opacity:0.4;">
                                <path fill="#ffffff" d="M361.7,98.94L101.28,363.04v79.35h260.42v-79.35h-147.21l147.21-145.05v145.05h76.64V98.94h-76.64Z"/>
                                <path fill="#ff7900" d="M361.7,363.04v338.02h76.64l260.38-264.1v-73.92h-337.02ZM438.34,582.01v-139.62h147.21l-147.21,139.62Z"/>
                            </svg>

                            <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;font-weight:600;color:#4b5563;letter-spacing:0.5px;">
                                UGC Para Artistas
                            </p>

                            <p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;line-height:1.7;color:#374151;">
                                Este é um email automático. Por favor, não responda a esta mensagem.
                            </p>

                            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;color:#2d2d2d;">
                                © {{ date('Y') }} UGC Para Artistas. Todos os direitos reservados.<br>
                                <a href="{{ $loginUrl }}" style="color:#ff7900;text-decoration:none;">Acessar plataforma</a>
                                &nbsp;&middot;&nbsp;
                                <a href="{{ config('app.url') }}" style="color:#ff7900;text-decoration:none;">ugc4artists.com.br</a>
                            </p>

                        </td>
                    </tr>

                    {{-- Espaço inferior --}}
                    <tr>
                        <td style="height:32px;">&nbsp;</td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
