<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Publication Plans
    |--------------------------------------------------------------------------
    |
    | Define os planos de publicação disponíveis para campanhas.
    | Cada plano tem um identificador único, label, preço e descrição.
    |
    */
    'publication_plans' => [
        [
            'id' => 'basic',
            'label' => 'Básico',
            'price' => 0,
            'description' => 'Lista normal de campanhas',
            'features' => [
                'Acesso ao pool de criadores',
                'Listagem padrão',
            ],
        ],
        [
            'id' => 'highlight',
            'label' => 'Destaque',
            'price' => 29.90,
            'description' => 'Prioridade nas listas',
            'features' => [
                'Selo de destaque',
                'Prioridade nas buscas',
                'Maior visibilidade',
            ],
        ],
        [
            'id' => 'premium',
            'label' => 'Premium',
            'price' => 49.90,
            'description' => 'Destaque + acompanhamento',
            'features' => [
                'Todos os benefícios do Destaque',
                'Curadoria estratégica',
                'Acompanhamento dedicado',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Publication Plan
    |--------------------------------------------------------------------------
    */
    'default_publication_plan' => 'basic',
];
