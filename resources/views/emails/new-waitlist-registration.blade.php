<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo cadastro na Waitlist</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    {{-- Header --}}
                    <tr>
                        <td style="background-color: #111827; padding: 30px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">
                                Novo cadastro na Waitlist da UGC
                            </h1>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding: 32px 40px;">
                            <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.6;">
                                Um novo artista se cadastrou na lista de espera. Confira os detalhes abaixo:
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                                <tr style="background-color: #f9fafb;">
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; width: 180px; border-bottom: 1px solid #e5e7eb;">Nome artístico</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">{{ $registration->stage_name }}</td>
                                </tr>

                                @if($registration->instagram_handle)
                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Instagram</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">{{ $registration->instagram_handle }}</td>
                                </tr>
                                @endif

                                @if($registration->youtube_handle)
                                <tr style="background-color: #f9fafb;">
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">YouTube</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">{{ $registration->youtube_handle }}</td>
                                </tr>
                                @endif

                                @if($registration->tiktok_handle)
                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">TikTok</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">{{ $registration->tiktok_handle }}</td>
                                </tr>
                                @endif

                                <tr style="background-color: #f9fafb;">
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Email de contato</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">
                                        <a href="mailto:{{ $registration->contact_email }}" style="color: #2563eb; text-decoration: none;">{{ $registration->contact_email }}</a>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Tipos de artista</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">
                                        {{ implode(', ', $registration->artist_types) }}
                                        @if($registration->other_artist_type)
                                            , {{ $registration->other_artist_type }}
                                        @endif
                                    </td>
                                </tr>

                                @if($registration->main_genre)
                                <tr style="background-color: #f9fafb;">
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Gênero principal</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">{{ $registration->main_genre }}</td>
                                </tr>
                                @endif

                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Tipo de participação</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">{{ implode(', ', $registration->participation_types) }}</td>
                                </tr>

                                @if($registration->portfolio_link)
                                <tr style="background-color: #f9fafb;">
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Portfólio</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">
                                        <a href="{{ $registration->portfolio_link }}" style="color: #2563eb; text-decoration: none;" target="_blank">{{ $registration->portfolio_link }}</a>
                                    </td>
                                </tr>
                                @endif

                                @if($registration->city_state)
                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Cidade/Estado</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">{{ $registration->city_state }}</td>
                                </tr>
                                @endif

                                <tr style="background-color: #f9fafb;">
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Disponibilidade</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827; border-bottom: 1px solid #e5e7eb;">{{ $registration->creation_availability }}</td>
                                </tr>

                                <tr>
                                    <td style="padding: 12px 16px; font-size: 13px; color: #6b7280; font-weight: 600;">Data de cadastro</td>
                                    <td style="padding: 12px 16px; font-size: 14px; color: #111827;">{{ $registration->created_at->format('d/m/Y H:i:s') }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding: 20px 40px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Este é um email automático enviado pelo sistema UGC Para Artistas.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
