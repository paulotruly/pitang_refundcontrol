# Sistema de gerenciamento de solicitações de reembolso

## Descrição do projeto
Sistema web para controle e gerenciamento de solicitações de reembolso corporativo, permitindo que colaboradores criem pedidos, gestores validem, a equipe financeira realize pagamentos e administradores gerenciem categorias e usuários. O projeto segue boas práticas de desenvolvimento com TypeScript, validações rigorosas e testes automatizados.

## Passo inicial: clonar o repositório
Antes de configurar o backend ou o frontend, clone este repositório em sua máquina local:
```bash
git clone <https://github.com/paulotruly/pitang_refundcontrol>
cd pitang_refundcontrol
```

## Instruções para rodar o backend
O backend utiliza Node.js, Express, TypeScript e Prisma com SQLite para desenvolvimento. Siga os passos na ordem:

1. Acesse o diretório do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente copiando o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
4. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate dev
   ```
5. (Recomendado) Popule o banco com dados iniciais para teste executando o script de seed:
    ```bash
    npm run seed
    ```
    Este comando criará usuários de todos os perfis (administrador, gestor, financeiro e colaborador) e categorias padrão de reembolso, permitindo que o sistema seja testado imediatamente após a instalação.
6. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
O backend estará disponível em `http://localhost:3000` por padrão.

## Instruções para rodar o frontend
O frontend utiliza React, Vite, TypeScript, Tailwind CSS e ShadcnUI. Certifique-se de que o backend esteja em execução antes de iniciar o frontend.

1. Acesse o diretório do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente copiando o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```
   (Ajuste a variável `VITE_API_URL` para apontar para o backend, ex: `http://localhost:3000`)
4. Inicie a aplicação em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
O frontend estará disponível em `http://localhost:5173` por padrão.

## Variáveis de ambiente
Crie arquivos `.env` nas pastas de backend e frontend baseados nos exemplos abaixo:

### Backend (.env.example)
```env
# Porta do servidor
PORT=3000
# URL do banco de dados (SQLite para desenvolvimento)
DATABASE_URL="file:./dev.db"
# Chave secreta para JWT (gere uma string aleatória segura)
JWT_SECRET=sua_chave_secreta_jwt_aqui
# Tempo de expiração do access token (ex: 15m, 1h)
JWT_EXPIRES_IN=15m
# Tempo de expiração do refresh token (ex: 7d)
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Frontend (.env.example)
```env
# URL base da API do backend
VITE_API_URL=http://localhost:3000
```

## Credenciais de teste
O script de seed cria usuários para todos os perfis. Use as credenciais abaixo para acessar o sistema:

| Perfil       | Email                  | Senha      |
|--------------|------------------------|------------|
| Administrador| admin@pitang.com       | 123456     |
| Gestor       | gestor@pitang.com      | 123456     |
| Financeiro   | financeiro@pitang.com  | 123456     |
| Colaborador  | colaborador@pitang.com | 123456     |

## Explicação das decisões técnicas
As principais escolhas tecnológicas foram feitas visando segurança, manutenibilidade e aderência aos requisitos:

- **TypeScript**: Utilizado em todo o projeto para tipagem estática, reduzindo erros em tempo de desenvolvimento.
- **Prisma + SQLite**: Prisma simplifica modelagem e migrações; SQLite é usado em desenvolvimento por ser leve e não exigir configuração de servidor de banco.
- **Zod**: Validação de todas as entradas da API e formulários, garantindo integridade de dados.
- **JWT + js-cookie**: Autenticação stateless com tokens JWT, persistidos via cookies seguros no frontend.
- **ShadcnUI + Tailwind CSS**: Componentes acessíveis e customizáveis, com estilização rápida e responsiva.
- **TanStack Router**: Roteamento baseado em configuração, com suporte nativo a rotas protegidas.
- **Context API**: Gerenciamento de estado de autenticação no frontend, evitando prop drilling.
- **Jest + Supertest/RTL**: Testes automatizados para garantir qualidade de código em backend e frontend.

## Lista de tecnologias utilizadas
### Backend
- Node.js
- Express
- TypeScript
- Prisma (ORM)
- SQLite (banco de dados de desenvolvimento)
- Zod
- jsonwebtoken (JWT)
- bcrypt
- DayJS
- Jest
- Supertest
- multer (upload de arquivos)

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- ShadcnUI
- TanStack Router
- Context API
- Axios
- js-cookie
- Jest
- React Testing Library
- Intl/DayJS (formatação de datas)

## Lista do que foi Implementado
### Obrigatório
- **Backend**: Autenticação JWT, CRUD completo de usuários/categorias/solicitações, fluxo completo de transições de status, histórico de auditoria, anexos, validações com Zod, tratamento de erros HTTP, testes com Jest/Supertest.
- **Frontend**: Telas de login, cadastro, dashboard, criação/edição/detalhe de solicitações, gestão de categorias (admin), fluxos de aprovação/rejeição/pagamento, histórico, navegação protegida por perfil, tratamento de estados de loading/erro/vazio, testes básicos com Jest/RTL.

### Diferenciais
- Paginação, filtros (status, categoria, nome de colaborador) e ordenação em listagens.
- Upload real de anexos com multer.
- Limite de valor configurável por categoria, bloqueio de despesas futuras e solicitações sem anexo acima de valor limite.
- Seed script com dados iniciais.
- Refresh token para renovação de sessão.
- Soft delete em categorias e solicitações.

## Lista do que ficou pendente
- **Backend**: Docker Compose para containerização com PostgreSQL, collection exportável do Postman.
- **Frontend**: Download de anexos, dark mode toggle, responsividade completa, testes expandidos, consumo de API externa, animações de transição, skeleton loaders.