# Projeto Lamport Clocks

Este projeto implementa uma simulação distribuída baseada no algoritmo de Relógios Lógicos de Lamport. O sistema é composto por múltiplos processos (nós) que se comunicam entre si para manter a ordenação parcial de eventos, demonstrando na prática como a sincronização de relógios lógicos funciona em sistemas distribuídos.

## 🏗️ Arquitetura

A arquitetura do projeto é dividida em duas partes principais:

1. **Backend (Nós Distribuídos)**:
   - Desenvolvido em Node.js com TypeScript.
   - Composto por 6 processos independentes (P1 a P6).
   - **Comunicação Inter-Processos (TCP)**: Cada processo possui uma porta TCP (5001 a 5006) dedicada para enviar e receber mensagens entre si, atualizando seus respectivos relógios lógicos.
   - **Interface HTTP**: Cada processo expõe uma API HTTP (portas 3001 a 3006) utilizada para receber comandos e consultar o estado atual do processo a partir da interface visual.

2. **Frontend**:
   - Desenvolvido utilizando React e Vite.
   - Serve como um painel central unificado para visualizar o estado de todos os processos (P1 a P6).
   - Conecta-se às APIs HTTP de cada processo para enviar ações e mostrar a evolução dos relógios em tempo real.

O sistema foi desenhado para ser flexível, podendo rodar inteiramente em uma única máquina (para testes e desenvolvimento) ou distribuído em duas máquinas distintas, simulando um ambiente de rede real.

---

## 🚀 Como Executar

O projeto utiliza Docker e Docker Compose para facilitar a execução. Existem duas formas principais de subir a infraestrutura: em um único computador ou distribuído em dois computadores.

### Opção 1: Execução em um único PC (Local)

Esta é a maneira mais simples de rodar o projeto. Todos os 6 processos e o frontend serão executados na sua máquina local.

1. Certifique-se de ter o [Docker](https://www.docker.com/) e o [Docker Compose](https://docs.docker.com/compose/) instalados.
2. Na raiz do projeto, execute o comando:
   ```bash
   docker-compose up --build -d
   ```
3. Aguarde os containers inicializarem.
4. Acesse a interface web através do navegador: **http://localhost:3000**
5. *Para parar a execução:* `docker-compose down`

### Opção 2: Execução distribuída em 2 PCs

Para simular um ambiente distribuído real, você pode dividir os processos em dois computadores (Máquina 1 e Máquina 2) que estejam na mesma rede ou tenham comunicação mútua.

* **Máquina 1** irá rodar: Frontend, Processos P1, P2 e P3.
* **Máquina 2** irá rodar: Processos P4, P5 e P6.

> **Importante**: Ambas as máquinas precisam usar as imagens do Docker Hub (`nalbertsan/lamport-backend:latest` e `nalbertsan/lamport-frontend:latest`).

#### Na Máquina 1:
1. Descubra o endereço IP da Máquina 2 (ex: `192.168.1.102`).
2. Execute o docker-compose específico para a máquina 1, passando o IP da máquina 2 como variável de ambiente:
   
   **No Linux/macOS:**
   ```bash
   M2_IP=192.168.1.102 docker-compose -f docker-compose.m1.yml up -d
   ```
   **No Windows (PowerShell):**
   ```powershell
   $env:M2_IP="192.168.1.102"; docker-compose -f docker-compose.m1.yml up -d
   ```
3. A interface web estará acessível na Máquina 1 em **http://localhost:3000** ou pelo IP da Máquina 1 na rede.

#### Na Máquina 2:
1. Descubra o endereço IP da Máquina 1 (ex: `192.168.1.101`).
2. Execute o docker-compose específico para a máquina 2, passando o IP da máquina 1 como variável de ambiente:

   **No Linux/macOS:**
   ```bash
   M1_IP=192.168.1.101 docker-compose -f docker-compose.m2.yml up -d
   ```
   **No Windows (PowerShell):**
   ```powershell
   $env:M1_IP="192.168.1.101"; docker-compose -f docker-compose.m2.yml up -d
   ```

---

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, TypeScript, Express (HTTP), Sockets Nativos (TCP)
- **Frontend**: React, Vite, TypeScript
- **Infraestrutura**: Docker, Docker Compose
