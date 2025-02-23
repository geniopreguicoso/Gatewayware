
# Documentação do GatewayWare

O **GatewayWare** é uma classe JavaScript que facilita a comunicação e o compartilhamento de dados entre diferentes janelas ou abas do navegador. Ele atua como um gateway centralizado, permitindo a sincronização de `LocalStorage`, transferência de arquivos e gerenciamento de conexões entre peers.


## Índice

1. [Instalação](#instalação)
2. [Inicialização](#inicialização)
3. [Métodos](#métodos)
   - [generateSecurityHash](#generatesecurityhash)
   - [initGateway](#initgateway)
   - [modifyURL](#modifyurl)
   - [setupConnection](#setupconnection)
   - [handleNewConnection](#handlenewconnection)
   - [exchangeLocalStorage](#exchangelocalstorage)
   - [receiveLocalStorage](#receivelocalstorage)
   - [exchangeFiles](#exchangefiles)
   - [receiveFiles](#receivefiles)
   - [getStoredFiles](#getstoredfiles)
   - [downloadLocalStorage](#downloadlocalstorage)
   - [downloadFiles](#downloadfiles)
   - [triggerDownload](#triggerdownload)
   - [on](#on)
   - [triggerEvent](#triggerevent)
   - [removePeer](#removepeer)
   - [shutdown](#shutdown)
4. [Eventos](#eventos)
   - [peerConnected](#peerconnected)
   - [peerDisconnected](#peerdisconnected)
   - [localStorageUpdated](#localstorageupdated)
   - [filesReceived](#filesreceived)
   - [gatewayShutdown](#gatewayshutdown)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Considerações de Segurança](#considerações-de-segurança)

---

## Instalação

O GatewayWare não requer instalação de pacotes externos. Basta incluir o código da classe em seu projeto JavaScript.

```javascript
// Copie e cole o código da classe GatewayWare em seu projeto.
```

---

## Inicialização

Para começar a usar o GatewayWare, crie uma instância da classe:

```javascript
const gateway = new GatewayWare();
```

Isso inicializa o gateway, ativa a comunicação entre peers e modifica a URL para incluir um hash de segurança único.

---

## Métodos

### `generateSecurityHash()`
Gera um hash de segurança único para identificar a instância do gateway.

**Retorno**:  
- `string`: Hash de segurança em formato Base64.

---

### `initGateway()`
Inicializa o gateway, configurando listeners de mensagens e modificando a URL.

---

### `modifyURL()`
Adiciona o hash de segurança à URL atual para identificar a sessão do gateway.

---

### `setupConnection()`
Configura o listener de mensagens para aceitar conexões de peers.

---

### `handleNewConnection(source, id)`
Gerencia novas conexões de peers.

**Parâmetros**:
- `source`: A origem da conexão (janela ou aba).
- `id`: Identificador único do peer.

---

### `exchangeLocalStorage(peer, id)`
Compartilha o conteúdo do `LocalStorage` com um peer.

**Parâmetros**:
- `peer`: O peer com quem compartilhar os dados.
- `id`: Identificador único do peer.

---

### `receiveLocalStorage(data)`
Processa e armazena dados do `LocalStorage` recebidos de um peer.

**Parâmetros**:
- `data`: Dados do `LocalStorage` em formato JSON.

---

### `exchangeFiles(peer, id)`
Compartilha arquivos armazenados no `LocalStorage` com um peer.

**Parâmetros**:
- `peer`: O peer com quem compartilhar os arquivos.
- `id`: Identificador único do peer.

---

### `receiveFiles(data)`
Processa e armazena arquivos recebidos de um peer.

**Parâmetros**:
- `data`: Lista de arquivos recebidos.

---

### `getStoredFiles()`
Retorna uma lista de arquivos armazenados no `LocalStorage`.

**Retorno**:  
- `Array`: Lista de arquivos no formato `{ name: string, content: string }`.

---

### `downloadLocalStorage(data)`
Faz o download do conteúdo do `LocalStorage` como um arquivo JSON.

**Parâmetros**:
- `data`: Dados do `LocalStorage` para download.

---

### `downloadFiles(files)`
Faz o download de uma lista de arquivos.

**Parâmetros**:
- `files`: Lista de arquivos no formato `{ name: string, content: string }`.

---

### `triggerDownload(blob, filename)`
Dispara o download de um arquivo.

**Parâmetros**:
- `blob`: O conteúdo do arquivo em formato `Blob`.
- `filename`: Nome do arquivo para download.

---

### `on(event, callback)`
Registra um listener para eventos personalizados.

**Parâmetros**:
- `event`: Nome do evento.
- `callback`: Função a ser executada quando o evento for disparado.

---

### `triggerEvent(event, data)`
Dispara um evento personalizado.

**Parâmetros**:
- `event`: Nome do evento.
- `data`: Dados a serem passados para os listeners.

---

### `removePeer(id)`
Remove um peer da lista de conexões.

**Parâmetros**:
- `id`: Identificador único do peer.

---

### `shutdown()`
Encerra o gateway, desconectando todos os peers e desativando a comunicação.

---

## Eventos

### `peerConnected`
Disparado quando um novo peer se conecta.

**Dados**:
- `id`: Identificador único do peer.
- `source`: Origem da conexão.

---

### `peerDisconnected`
Disparado quando um peer é desconectado.

**Dados**:
- `id`: Identificador único do peer.

---

### `localStorageUpdated`
Disparado quando o `LocalStorage` é atualizado com dados recebidos de um peer.

**Dados**:
- `data`: Conteúdo atualizado do `LocalStorage`.

---

### `filesReceived`
Disparado quando arquivos são recebidos de um peer.

**Dados**:
- `files`: Lista de arquivos recebidos.

---

### `gatewayShutdown`
Disparado quando o gateway é encerrado.

---

## Exemplos de Uso

### Sincronização de LocalStorage
```javascript
gateway.on("localStorageUpdated", (data) => {
  console.log("LocalStorage atualizado:", data);
});
```

### Transferência de Arquivos
```javascript
gateway.on("filesReceived", (files) => {
  console.log("Arquivos recebidos:", files);
});
```

### Encerramento do Gateway
```javascript
gateway.shutdown();
```

---

## Considerações de Segurança

1. **Validação de Origem**: Todas as mensagens são validadas para garantir que vêm da mesma origem (`origin`).
2. **Hash de Segurança**: Um hash único é gerado para cada instância do gateway, evitando conflitos entre sessões.
3. **Heartbeat**: O sistema de heartbeat detecta peers desconectados e mantém a conexão ativa.

---
