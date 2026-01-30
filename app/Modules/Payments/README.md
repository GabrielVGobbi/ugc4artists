# Módulo de Pagamentos

Sistema modular e extensível para processamento de pagamentos com suporte a múltiplos gateways.

## Índice

- [Instalação](#instalação)
- [Arquitetura](#arquitetura)
- [Uso Rápido](#uso-rápido)
- [Facades](#facades)
- [Checkout Builder](#checkout-builder)
- [Serviços por Domínio](#serviços-por-domínio)
- [Configuração](#configuração)
- [Webhooks](#webhooks)
- [Adicionando Novo Gateway](#adicionando-novo-gateway)

---

## Instalação

### 1. Execute o comando de instalação

```bash
php artisan payments:install
```

Este comando irá:

- Verificar a configuração em `config/payments.php`
- Criar a migration para adicionar a coluna do external ID na tabela users
- Validar se as colunas necessárias existem no banco


```bash
php artisan vendor:publish --tag=payments-migrations
```

Este comando irá:

- Publicar Payments
- Criar a migration payments


### 2. Configure seu Model User

```php
use App\Modules\Payments\Core\Contracts\HasPaymentCustomerContract;
use App\Modules\Payments\Core\Traits\HasPayments;

class User extends Authenticatable implements HasPaymentCustomerContract
{
    use HasPayments;

    protected $fillable = [
        // ... outros campos
        'asaas_id', // ou o nome da coluna configurada
    ];
}
```

### 3. Configure as variáveis de ambiente

```env
PAYMENT_GATEWAY=asaas
PAYMENT_TEST_MODE=true

ASAAS_API_KEY=sua_api_key
ASAAS_SANDBOX=true
ASAAS_WEBHOOK_SECRET=seu_secret
```

### 4. Verifique o status da instalação

```bash
php artisan payments:status
```

### Opções do comando install

```bash
# Instalar para um gateway específico
php artisan payments:install --gateway=asaas

# Especificar a tabela (default: users)
php artisan payments:install --table=users

# Forçar sobrescrita de arquivos existentes
php artisan payments:install --force

# Pular criação de migration
php artisan payments:install --skip-migration
```

---

## Arquitetura

```
app/Modules/Payments/
├── Core/
│   ├── Contracts/          # Interfaces de serviços
│   ├── Abstract/           # Classes base abstratas
│   ├── DTOs/               # Data Transfer Objects
│   │   ├── Customer/
│   │   ├── Payment/
│   │   ├── Subscription/
│   │   ├── Transfer/
│   │   ├── Split/
│   │   └── Webhook/
│   └── Traits/             # Traits reutilizáveis
├── Gateways/
│   ├── Asaas/
│   │   ├── AsaasManager.php
│   │   ├── AsaasConfiguration.php
│   │   ├── Services/       # CustomersService, PaymentsService, etc.
│   │   └── Mappers/        # CustomerMapper, PaymentMapper, etc.
│   └── Iugu/
│       └── ... (mesma estrutura)
├── Facades/                # Asaas, Iugu, Gateway, Checkout
├── Checkout/               # CheckoutBuilder
├── Webhooks/               # WebhookDispatcher e handlers
├── Services/               # CheckoutService, SettlementService, RefundService
├── Models/                 # Payment, WebhookEvent
└── Events/                 # PaymentCreated, PaymentPaid, etc.
```

---

## Uso Rápido

### Via Facades (Recomendado)

```php
use App\Modules\Payments\Facades\Asaas;
use App\Modules\Payments\Core\DTOs\Customer\CustomerRequest;
use App\Modules\Payments\Core\DTOs\Payment\ChargeRequest;
use App\Modules\Payments\Enums\PaymentMethod;

// Criar cliente
$customer = Asaas::customers()->create(new CustomerRequest(
    name: 'João Silva',
    email: 'joao@email.com',
    document: '12345678900',
    phone: '11999999999',
));

// Criar cobrança PIX
$charge = Asaas::payments()->createCharge(new ChargeRequest(
    customerId: $customer->id,
    amountCents: 10000, // R$ 100,00
    method: PaymentMethod::PIX,
    description: 'Pagamento do serviço',
    externalReference: 'pedido-123',
));

// Acessar dados
echo $charge->checkoutUrl;
echo $charge->pix->payload; // Código PIX copia e cola
```

### Via Checkout Builder (Fluent API)

```php
use App\Modules\Payments\Facades\Checkout;
use App\Modules\Payments\Enums\PaymentMethod;

$payment = Checkout::for($user)
    ->billable($campaign)
    ->amount(10000)
    ->method(PaymentMethod::PIX)
    ->gateway('asaas')
    ->useWallet(true)
    ->description('Pagamento da campanha')
    ->dueDays(3)
    ->create();

// Dados do pagamento
$payment->uuid;
$payment->status;
$payment->meta['gateway']['qr_code_payload'];
```

### Via Injeção de Dependência

```php
use App\Modules\Payments\Gateways\Asaas\AsaasManager;

class PaymentController extends Controller
{
    public function __construct(
        private AsaasManager $asaas,
    ) {}

    public function createCustomer(Request $request)
    {
        return $this->asaas->customers()->create(
            CustomerRequest::fromArray($request->validated())
        );
    }
}
```

---

## Facades

### Asaas

```php
use App\Modules\Payments\Facades\Asaas;

// Serviços disponíveis
Asaas::customers();      // CustomerServiceInterface
Asaas::payments();       // PaymentServiceInterface
Asaas::subscriptions();  // SubscriptionServiceInterface
Asaas::transfers();      // TransferServiceInterface
Asaas::splits();         // SplitServiceInterface

// Métodos do manager
Asaas::name();           // 'asaas'
Asaas::isAvailable();    // true/false
Asaas::getBalance();     // ['balance' => 1000.00, 'pending' => 500.00]
```

### Iugu

```php
use App\Modules\Payments\Facades\Iugu;

// Mesma estrutura do Asaas
Iugu::customers()->create($request);
Iugu::payments()->createCharge($request);
```

### Gateway (Genérico)

```php
use App\Modules\Payments\Facades\Gateway;

// Usar gateway padrão (config)
Gateway::default()->customers()->create($request);

// Usar gateway específico
Gateway::driver('asaas')->payments()->createCharge($request);
Gateway::driver('iugu')->subscriptions()->create($request);

// Listar gateways
Gateway::getAvailableGateways();  // ['asaas', 'iugu']
Gateway::getGatewaysStatus();     // ['asaas' => true, 'iugu' => false]
```

---

## Checkout Builder

O `CheckoutBuilder` fornece uma API fluente para criar pagamentos de forma simplificada:

```php
use App\Modules\Payments\Facades\Checkout;

$payment = Checkout::for($user)
    // Obrigatórios
    ->billable($campaign)           // Model que está sendo pago
    ->amount(10000)                 // Valor em centavos

    // Opcionais
    ->amountDecimal(100.00)         // Alternativa: valor em reais
    ->method(PaymentMethod::PIX)    // Método de pagamento
    ->pix()                         // Shortcut para PIX
    ->creditCard()                  // Shortcut para cartão
    ->boleto()                      // Shortcut para boleto
    ->gateway('asaas')              // Gateway a usar
    ->useWallet(true)               // Usar saldo da carteira
    ->withoutWallet()               // Não usar carteira
    ->dueDate($date)                // Data de vencimento
    ->dueDays(3)                    // Dias até vencimento
    ->description('...')            // Descrição
    ->idempotencyKey('...')         // Chave de idempotência
    ->meta(['key' => 'value'])      // Metadados
    ->split('wallet_id', 1000)      // Split fixo (centavos)
    ->split('wallet_id', null, 10)  // Split percentual
    ->installments(3)               // Parcelas (cartão)

    // Criar o pagamento
    ->create();
```

---

## Serviços por Domínio

### Customers

```php
// Criar a partir de um User (recomendado)
$customer = Asaas::customers()->firstOrCreateFromModel($user);
// O external ID é sincronizado automaticamente no User

// Criar manualmente
$customer = Asaas::customers()->create(new CustomerRequest(...));

// Criar a partir de array
$customer = Asaas::customers()->firstOrCreate(
    CustomerRequest::fromArray($data),
    $user // opcional: model para sincronizar external ID
);

// Buscar
$customer = Asaas::customers()->find('cus_123');
$customer = Asaas::customers()->findByEmail('email@example.com');
$customer = Asaas::customers()->findByDocument('12345678900');

// Listar
$collection = Asaas::customers()->list(['limit' => 10]);
foreach ($collection as $customer) { ... }

// Atualizar
$customer = Asaas::customers()->update('cus_123', new CustomerRequest(...));

// Deletar
Asaas::customers()->delete('cus_123');
```

### Trabalhando com External IDs

O módulo sincroniza automaticamente o ID do cliente no gateway com o model local:

```php
// Verificar se o usuário já tem um external ID
if ($user->hasPaymentExternalId('asaas')) {
    $externalId = $user->getPaymentExternalId('asaas');
}

// Sincronizar manualmente (raro, pois é feito automaticamente)
$user->syncPaymentExternalId('cus_xxx', 'asaas');

// Obter a coluna configurada para o external ID
$column = $user->getPaymentExternalIdColumn('asaas'); // 'asaas_id'
```

### Payments

```php
// Criar cobrança
$charge = Asaas::payments()->createCharge(new ChargeRequest(
    customerId: 'cus_123',
    amountCents: 10000,
    method: PaymentMethod::PIX,
));

// Buscar
$charge = Asaas::payments()->find('pay_123');
$charge = Asaas::payments()->findByExternalReference('pedido-123');

// Listar
$charges = Asaas::payments()->list(['status' => 'PENDING']);
$charges = Asaas::payments()->listByCustomer('cus_123');

// PIX QR Code
$pix = Asaas::payments()->getPixQrCode('pay_123');
echo $pix->payload;

// Cancelar
Asaas::payments()->cancel('pay_123');

// Reembolsar
$refund = Asaas::payments()->refund('pay_123');
$refund = Asaas::payments()->refund('pay_123', new RefundRequest(amountCents: 5000));
```

### Subscriptions

```php
// Criar assinatura
$sub = Asaas::subscriptions()->create(new SubscriptionRequest(
    customerId: 'cus_123',
    amountCents: 9900,
    cycle: 'MONTHLY',
    method: PaymentMethod::CREDIT_CARD,
));

// Pausar/Retomar
Asaas::subscriptions()->pause('sub_123');
Asaas::subscriptions()->resume('sub_123');

// Cancelar
Asaas::subscriptions()->cancel('sub_123');

// Pagamentos da assinatura
$payments = Asaas::subscriptions()->getPayments('sub_123');
```

### Transfers

```php
// Criar transferência PIX
$transfer = Asaas::transfers()->create(new TransferRequest(
    amountCents: 50000,
    pixKey: 'email@example.com',
    type: 'PIX',
));

// Saldo disponível
$balance = Asaas::transfers()->getAvailableBalance(); // em centavos
```

### Splits

```php
// Criar split para pagamento
$split = Asaas::splits()->create(new SplitRequest(
    paymentId: 'pay_123',
    rules: [
        new SplitRuleRequest(walletId: 'wallet_1', percentageValue: 70),
        new SplitRuleRequest(walletId: 'wallet_2', percentageValue: 30),
    ],
));

// Split com valor fixo
$split = Asaas::splits()->createFixedSplit('pay_123', [
    'wallet_1' => 7000, // R$ 70,00
    'wallet_2' => 3000, // R$ 30,00
]);

// Split percentual
$split = Asaas::splits()->createPercentageSplit('pay_123', [
    'wallet_1' => 70,
    'wallet_2' => 30,
]);
```

---

## Configuração

### Variáveis de Ambiente

```env
# Gateway padrão
PAYMENT_GATEWAY=asaas

# Modo de teste
PAYMENT_TEST_MODE=true

# Logging
PAYMENT_LOGGING_ENABLED=true
PAYMENT_LOG_CHANNEL=stack

# Asaas
ASAAS_API_KEY=sua_api_key
ASAAS_SANDBOX=true
ASAAS_WEBHOOK_SECRET=seu_secret

# Iugu
IUGU_API_KEY=sua_api_key
IUGU_ACCOUNT_ID=seu_account_id
IUGU_WEBHOOK_TOKEN=seu_token
```

### Arquivo config/payments.php

```php
return [
    'default' => env('PAYMENT_GATEWAY', 'asaas'),

    'gateways' => [
        'asaas' => [
            'enabled' => true,
            'api_key' => env('ASAAS_API_KEY'),
            'sandbox' => env('ASAAS_SANDBOX', true),
            'features' => [
                'customers' => true,
                'payments' => true,
                'subscriptions' => true,
                'transfers' => true,
                'splits' => true,
            ],
        ],
        // ...
    ],
];
```

---

## Webhooks

### Configuração de Rotas

```php
// routes/api.php
Route::post('/webhooks/{provider}', [WebhookController::class, 'handle'])
    ->withoutMiddleware(['auth', 'throttle'])
    ->name('payments.webhook');
```

### URLs de Webhook

| Gateway | URL |
|---------|-----|
| Asaas | `https://seudominio.com/api/webhooks/asaas` |
| Iugu | `https://seudominio.com/api/webhooks/iugu` |

### Usando o WebhookDispatcher

```php
use App\Modules\Payments\Webhooks\WebhookDispatcher;

class WebhookController extends Controller
{
    public function __construct(
        private WebhookDispatcher $dispatcher,
    ) {}

    public function handle(Request $request, string $provider)
    {
        $event = $this->dispatcher->dispatch(
            gateway: $provider,
            payload: $request->all(),
            headers: $request->headers->all(),
        );

        return response()->json(['ok' => true]);
    }
}
```

---

## Adicionando Novo Gateway

### 1. Criar Configuração

```php
// Gateways/MercadoPago/MercadoPagoConfiguration.php
final class MercadoPagoConfiguration extends AbstractConfiguration
{
    public function getName(): string
    {
        return 'mercadopago';
    }

    public function getBaseUrl(): string
    {
        return $this->isSandbox()
            ? 'https://api.mercadopago.com/sandbox'
            : 'https://api.mercadopago.com';
    }
}
```

### 2. Criar Manager

```php
// Gateways/MercadoPago/MercadoPagoManager.php
final class MercadoPagoManager extends AbstractGatewayManager
{
    protected function createCustomersService(): CustomerServiceInterface
    {
        return new CustomersService($this->configuration);
    }

    // ... outros serviços
}
```

### 3. Criar Serviços e Mappers

Implementar cada serviço (Customers, Payments, etc.) seguindo as interfaces definidas.

### 4. Registrar no Provider

```php
// PaymentServiceProvider.php
$this->app->singleton(MercadoPagoManager::class);

// GatewayRegistry
$this->app->make(GatewayRegistry::class)
    ->extend('mercadopago', MercadoPagoManager::class);
```

### 5. Criar Facade

```php
// Facades/MercadoPago.php
class MercadoPago extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return MercadoPagoManager::class;
    }
}
```

---

## Eventos

| Evento | Quando |
|--------|--------|
| `PaymentCreated` | Pagamento criado |
| `PaymentPaid` | Pagamento confirmado |
| `PaymentFailed` | Pagamento falhou |
| `PaymentCanceled` | Pagamento cancelado |
| `PaymentRefunded` | Pagamento reembolsado |
| `WebhookReceived` | Webhook recebido |

```php
// Listener
class SendPaymentConfirmation
{
    public function handle(PaymentPaid $event): void
    {
        $payment = $event->payment;
        $payment->user->notify(new PaymentConfirmedNotification($payment));
    }
}
```

---

## DTOs Principais

### CustomerRequest / CustomerResponse

```php
new CustomerRequest(
    name: 'João Silva',
    email: 'joao@email.com',
    document: '12345678900',
    phone: '11999999999',
    address: new AddressRequest(...),
    externalReference: 'user-123',
);
```

### ChargeRequest / ChargeResponse

```php
new ChargeRequest(
    customerId: 'cus_123',
    amountCents: 10000,
    method: PaymentMethod::PIX,
    dueDate: now()->addDays(3),
    description: 'Descrição',
    externalReference: 'pedido-123',
    installments: 3,
    splits: [...],
);
```

---

## Benefícios da Arquitetura

- **Separação de Responsabilidades**: Cada serviço cuida de um domínio específico
- **Extensibilidade**: Fácil adicionar novos gateways seguindo o mesmo padrão
- **Testabilidade**: Interfaces facilitam mocking e testes unitários
- **Fluent API**: Uso intuitivo via Facades e Builders
- **Type Safety**: DTOs tipados garantem consistência
- **Manutenibilidade**: Código organizado e fácil de manter
- **DRY**: Lógica comum nas classes abstratas e traits
