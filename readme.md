Aqui está o arquivo `README.md` atualizado com um tópico sobre a estrutura do projeto:

```markdown
# 🚀 Projeto API - Fastify com Swagger e Zod

Bem-vindo ao projeto de API usando **Fastify** com documentação gerada automaticamente via **Swagger**! Esta API está configurada para validar entradas e saídas com **Zod** e possui documentação interativa para facilitar o entendimento e uso.

---

## ⚡ Funcionalidades

- **Criação de usuários** com validação de dados.
- **Obtenção de usuários** armazenados em um banco simulado.
- **Documentação Swagger** para visualização interativa da API.
- **Validação de dados** com Zod e **type-safe**.

---

## 💡 Como rodar o projeto

Para rodar a API localmente, siga os passos abaixo:

### 1. Clonar o repositório

```bash
git clone https://github.com/Guih-henriqueee/backend-test.git
cd seu-projeto
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Rodar a aplicação

```bash
pnpm start
```

Agora, a API estará disponível em `http://localhost:3000`. Você pode acessar a documentação interativa em `http://localhost:3000/docs`.

---

## 📚 Documentação da API

A documentação da API está disponível via Swagger UI. Com a aplicação rodando, acesse:

[Visite a documentação Swagger](http://localhost:3000/docs)

### Endpoints

- **GET /users**: Retorna todos os usuários.
- **POST /users**: Cria um novo usuário.
- **GET /Agendamentos**: Lista todos os agendamentos.
- **POST /Agendamentos**: Cria um novo agendamento.
- **PUT /Agendamentos/{id}**: Atualiza um agendamento existente.
- **DELETE /Agendamentos/{id}**: Deleta um agendamento.

---

## 🗂 Estrutura do Projeto

A estrutura do projeto é organizada da seguinte forma:

```
.
├── README.md
├── package.json
├── src
│   ├── auth
│   │   └── functionAuth.ts        # Funções para geração e validação de tokens
│   ├── routes.ts                  # Definição das rotas da API
│   ├── schema
│   │   └── interfaces.ts          # Definições de tipos e interfaces
│   ├── server.ts                  # Configuração do servidor Fastify
│   └── types
│       └── types.ts               # Definições adicionais de tipos
├── tsconfig.json                  # Configurações do TypeScript
```

A estrutura do diretório inclui as pastas e arquivos principais necessários para o funcionamento da API. Os diretórios como `node_modules/` e `.pnpm-store/` estão ignorados no repositório e não são versionados.

---

## 🚀 Desenvolvimento

Se você deseja contribuir para este projeto, siga os passos abaixo para configurar o ambiente de desenvolvimento.

### 1. Instalar dependências de desenvolvimento

```bash
pnpm install --save-dev
```

### 2. Executar testes

```bash
pnpm run dev
```

---

## 🔧 Ferramentas Utilizadas

- **Fastify** - Framework web rápido e leve.
- **Swagger** - Para gerar e exibir a documentação da API.
- **Zod** - Biblioteca de validação de tipos.
- **TypeScript** - Para tipagem estática.
- **Docker** (opcional) - Para rodar a aplicação em contêineres.

---

## ⚖️ Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 💬 Contribuições

Contribuições são sempre bem-vindas! Se você deseja contribuir com melhorias ou correções, siga estas etapas:

1. Faça um fork do projeto.
2. Crie uma branch para sua feature: `git checkout -b minha-feature`.
3. Faça suas alterações e adicione testes.
4. Envie um pull request.

---

## 📞 Contato

- **Email**: gmartinsdevelop@gmail.com
- **GitHub**: [https://github.com/guih-henriqueee](https://github.com/guih-henriqueee)
```
