class GatewayWare {
  constructor() {
    this.peers = new Map(); // Armazena conexões ativas com peers
    this.gatewayActive = false; // Estado do gateway
    this.securityHash = this.generateSecurityHash(); // Hash de segurança único
    this.eventListeners = new Map(); // Ouvintes de eventos personalizados
    this.filesShared = new Map(); // Arquivos compartilhados
    this.connectionTimeout = 5000; // Tempo limite para conexões
    this.initGateway(); // Inicializa o gateway
  }

  // Gera um hash de segurança único
  generateSecurityHash() {
    return btoa(Math.random().toString(36).substr(2, 10));
  }

  // Inicializa o gateway
  initGateway() {
    if (window.GatewayWareActive) {
      console.warn("Gateway já está ativo!");
      return;
    }
    window.GatewayWareActive = true;
    this.gatewayActive = true;
    this.modifyURL(); // Modifica a URL para incluir o hash de segurança
    this.setupConnection(); // Configura a conexão com os peers
    this.setupHeartbeat(); // Configura o heartbeat para manter conexões ativas
  }

  // Modifica a URL para incluir o hash de segurança
  modifyURL() {
    if (window.location.href.includes("gateway")) return;
    const newUrl = `${window.location.origin}${window.location.pathname}?gateway=${this.securityHash}`;
    window.history.replaceState({}, "", newUrl);
  }

  // Configura a conexão com os peers
  setupConnection() {
    window.addEventListener("message", (event) => {
      if (event.origin !== window.location.origin) return; // Valida a origem da mensagem

      switch (event.data.type) {
        case "GATEWAY_CONNECT":
          this.handleNewConnection(event.source, event.data.id);
          break;
        case "GATEWAY_LOCAL_STORAGE":
          this.receiveLocalStorage(event.data.data);
          break;
        case "GATEWAY_FILE_TRANSFER":
          this.receiveFiles(event.data.data);
          break;
        case "GATEWAY_HEARTBEAT":
          this.handleHeartbeat(event.data.id);
          break;
        default:
          console.warn("Tipo de mensagem desconhecido:", event.data.type);
      }
    });
  }

  // Configura o heartbeat para manter conexões ativas
  setupHeartbeat() {
    setInterval(() => {
      this.peers.forEach((peer, id) => {
        peer.postMessage({ type: "GATEWAY_HEARTBEAT", id }, "*");
      });
    }, this.connectionTimeout);
  }

  // Lida com o heartbeat dos peers
  handleHeartbeat(id) {
    if (this.peers.has(id)) {
      console.log(`Peer ${id} está ativo.`);
    }
  }

  // Lida com novas conexões
  handleNewConnection(source, id) {
    if (!this.peers.has(id)) {
      this.peers.set(id, source);
      source.postMessage({ type: "GATEWAY_ACK", message: "Conexão aceita" }, "*");
      this.triggerEvent("peerConnected", { id, source });
    }
  }

  // Troca dados do LocalStorage com o peer
  exchangeLocalStorage(peer, id) {
    const localStorageData = JSON.stringify(localStorage);
    peer.postMessage({ type: "GATEWAY_LOCAL_STORAGE", data: localStorageData, id }, "*");
  }

  // Recebe dados do LocalStorage
  receiveLocalStorage(data) {
    try {
      const parsedData = JSON.parse(data);
      for (const key in parsedData) {
        localStorage.setItem(key, parsedData[key]);
      }
      this.downloadLocalStorage(parsedData);
      this.triggerEvent("localStorageUpdated", parsedData);
    } catch (e) {
      console.error("Erro ao processar LocalStorage recebido:", e);
    }
  }

  // Troca arquivos com o peer
  exchangeFiles(peer, id) {
    const files = this.getStoredFiles();
    peer.postMessage({ type: "GATEWAY_FILE_TRANSFER", data: files, id }, "*");
  }

  // Recebe arquivos do peer
  receiveFiles(data) {
    try {
      for (const file of data) {
        this.filesShared.set(file.name, file.content);
      }
      this.downloadFiles(data);
      this.triggerEvent("filesReceived", data);
    } catch (e) {
      console.error("Erro ao processar arquivos recebidos:", e);
    }
  }

  // Obtém arquivos armazenados no LocalStorage
  getStoredFiles() {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const content = localStorage.getItem(key);
      files.push({ name: `${key}.gatewayware.dwl`, content });
    }
    return files;
  }

  // Faz o download do LocalStorage
  downloadLocalStorage(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    this.triggerDownload(blob, "localstorage.gatewayware.dwl");
  }

  // Faz o download dos arquivos
  downloadFiles(files) {
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" });
      this.triggerDownload(blob, file.name);
    });
  }

  // Dispara o download de um arquivo
  triggerDownload(blob, filename) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Registra ouvintes de eventos
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  // Dispara eventos personalizados
  triggerEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => callback(data));
    }
  }

  // Remove um peer da lista de conexões
  removePeer(id) {
    if (this.peers.has(id)) {
      this.peers.delete(id);
      this.triggerEvent("peerDisconnected", { id });
    }
  }

  // Encerra o gateway
  shutdown() {
    this.peers.forEach((peer, id) => {
      peer.postMessage({ type: "GATEWAY_SHUTDOWN", message: "Gateway encerrado" }, "*");
    });
    this.peers.clear();
    this.gatewayActive = false;
    window.GatewayWareActive = false;
    this.triggerEvent("gatewayShutdown", null);
  }
}

// Configura o listener global para mensagens
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin) return;

  switch (event.data.type) {
    case "GATEWAY_LOCAL_STORAGE":
      gateway.receiveLocalStorage(event.data.data);
      break;
    case "GATEWAY_FILE_TRANSFER":
      gateway.receiveFiles(event.data.data);
      break;
    case "GATEWAY_SHUTDOWN":
      console.warn("Gateway foi encerrado.");
      break;
    default:
      console.warn("Tipo de mensagem desconhecido:", event.data.type);
  }
});

// Inicializa o gateway
const gateway = new GatewayWare();