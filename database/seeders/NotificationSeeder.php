<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            return;
        }

        $types = ['info', 'success', 'warning', 'error', 'campaign', 'payment', 'system'];

        $templates = [
            'info' => [
                ['title' => 'Bem-vindo à plataforma!', 'message' => 'Explore todas as funcionalidades disponíveis para você.'],
                ['title' => 'Nova funcionalidade disponível', 'message' => 'Confira as novidades que preparamos para você.'],
                ['title' => 'Dica do dia', 'message' => 'Complete seu perfil para aumentar suas chances de ser encontrado.'],
            ],
            'success' => [
                ['title' => 'Perfil atualizado', 'message' => 'Suas informações foram salvas com sucesso.'],
                ['title' => 'Verificação concluída', 'message' => 'Sua conta foi verificada com sucesso.'],
                ['title' => 'Conexão estabelecida', 'message' => 'Você agora está conectado com a marca.'],
            ],
            'warning' => [
                ['title' => 'Complete seu perfil', 'message' => 'Adicione mais informações para melhorar sua visibilidade.'],
                ['title' => 'Documento pendente', 'message' => 'Envie seus documentos para liberar todas as funcionalidades.'],
                ['title' => 'Prazo se aproximando', 'message' => 'Você tem uma entrega pendente para amanhã.'],
            ],
            'error' => [
                ['title' => 'Falha no upload', 'message' => 'Não foi possível enviar seu arquivo. Tente novamente.'],
                ['title' => 'Pagamento recusado', 'message' => 'Verifique os dados do seu cartão e tente novamente.'],
            ],
            'campaign' => [
                ['title' => 'Nova campanha disponível', 'message' => 'Uma marca está procurando criadores como você!'],
                ['title' => 'Convite para campanha', 'message' => 'Você foi convidado para participar de uma campanha exclusiva.'],
                ['title' => 'Campanha aprovada', 'message' => 'Sua participação na campanha foi aprovada!'],
            ],
            'payment' => [
                ['title' => 'Pagamento recebido', 'message' => 'R$ 500,00 foram creditados na sua carteira.'],
                ['title' => 'Saque processado', 'message' => 'Seu saque de R$ 300,00 está em processamento.'],
                ['title' => 'Fatura disponível', 'message' => 'Sua fatura do mês está disponível para download.'],
            ],
            'system' => [
                ['title' => 'Manutenção programada', 'message' => 'O sistema estará em manutenção amanhã das 2h às 4h.'],
                ['title' => 'Atualização de termos', 'message' => 'Nossos termos de uso foram atualizados.'],
                ['title' => 'Nova versão disponível', 'message' => 'Atualize o app para ter acesso às novidades.'],
            ],
        ];

        foreach ($users as $user) {
            // Create 30-50 notifications per user
            $count = rand(30, 50);

            for ($i = 0; $i < $count; $i++) {
                $type = $types[array_rand($types)];
                $template = $templates[$type][array_rand($templates[$type])];

                Notification::create([
                    'user_id' => $user->id,
                    'type' => $type,
                    'title' => $template['title'],
                    'message' => $template['message'],
                    'read_at' => rand(0, 1) ? now()->subMinutes(rand(1, 1000)) : null,
                    'created_at' => now()->subMinutes(rand(1, 10000)),
                ]);
            }
        }
    }
}
