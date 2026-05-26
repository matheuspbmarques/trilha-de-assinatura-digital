<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitação de Assinatura</title>
    <style>
        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: none;
            -ms-text-size-adjust: none;
        }
        .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #1769aa;
            background-image: linear-gradient(135deg, #1769aa 0%, #0d47a1 100%);
            padding: 32px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 40px 32px;
        }
        .content h2 {
            font-size: 20px;
            font-weight: 600;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 16px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            color: #475569;
            margin-top: 0;
            margin-bottom: 24px;
        }
        .details-box {
            background-color: #f1f5f9;
            border-left: 4px solid #1769aa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 32px;
        }
        .details-box h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
        }
        .details-box p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
            line-clamp: 3;
        }
        .btn-container {
            text-align: center;
            margin-bottom: 32px;
        }
        .btn {
            display: inline-block;
            background-color: #1769aa;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(23, 105, 170, 0.2), 0 2px 4px -2px rgba(23, 105, 170, 0.2);
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #0d47a1;
        }
        .footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
        }
        .footer p {
            margin: 4px 0;
        }
        .warning-text {
            font-size: 13px !important;
            color: #94a3b8 !important;
            text-align: center;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Trilha de Assinatura Digital</h1>
            </div>
            <div class="content">
                <h2>Olá, {{ $signatarioNome }}!</h2>
                <p>Você foi convidado para revisar e assinar (aprovar ou reprovar) o processo digital descrito abaixo:</p>
                
                <div class="details-box">
                    <h3>{{ $processoTitulo }}</h3>
                    <p>{{ $processoDescricao }}</p>
                </div>
                
                <p>Para visualizar os detalhes do documento e registrar sua decisão, clique no botão seguro abaixo:</p>
                
                <div class="btn-container">
                    <a href="{{ $urlAssinatura }}" class="btn" target="_blank">Revisar e Assinar Processo</a>
                </div>
                
                <p class="warning-text">Este link de assinatura é único e exclusivo para você. Por motivos de segurança, ele expira em 7 dias.</p>
            </div>
            <div class="footer">
                <p>Este é um e-mail automático enviado pelo sistema Trilha de Assinatura Digital.</p>
                <p>© {{ date('Y') }} Trilha de Assinatura Digital. Todos os direitos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>
