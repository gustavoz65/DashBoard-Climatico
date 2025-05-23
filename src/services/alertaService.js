import { TipoAlerta } from "../constants/alertaTypes";

class AlertaService {
  generateId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
  constructor() {
    this.subscribers = new Set();
    this.alertas = [];
    this.limites = {
      temperatura: {
        alta: 35,
        baixa: 10,
      },
      umidade: {
        alta: 80,
        baixa: 30,
      },
      qualidadeAr: {
        ruim: 150,
      },
    };
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach((callback) => callback(this.alertas));
  }

  async avaliarCondicoes(dados, cidade) {
    const { temperatura, umidade, qualidadeAr } = dados;

    if (temperatura >= this.limites.temperatura.alta) {
      await this.criarAlerta({
        tipo: TipoAlerta.TEMPERATURA,
        severidade: "alta",
        titulo: "Alerta de Temperatura Alta",
        mensagem: `Temperatura muito elevada em ${cidade}: ${temperatura}°C`,
        cidade,
      });
    } else if (temperatura <= this.limites.temperatura.baixa) {
      await this.criarAlerta({
        tipo: TipoAlerta.TEMPERATURA,
        severidade: "media",
        titulo: "Alerta de Temperatura Baixa",
        mensagem: `Temperatura muito baixa em ${cidade}: ${temperatura}°C`,
        cidade,
      });
    }

    if (umidade >= this.limites.umidade.alta) {
      await this.criarAlerta({
        tipo: TipoAlerta.UMIDADE,
        severidade: "media",
        titulo: "Alerta de Umidade Alta",
        mensagem: `Umidade do ar elevada em ${cidade}: ${umidade}%`,
        cidade,
      });
    } else if (umidade <= this.limites.umidade.baixa) {
      await this.criarAlerta({
        tipo: TipoAlerta.UMIDADE,
        severidade: "alta",
        titulo: "Alerta de Umidade Baixa",
        mensagem: `Umidade do ar muito baixa em ${cidade}: ${umidade}%`,
        cidade,
      });
    }

    if (qualidadeAr >= this.limites.qualidadeAr.ruim) {
      await this.criarAlerta({
        tipo: TipoAlerta.QUALIDADE_AR,
        severidade: "alta",
        titulo: "Alerta de Qualidade do Ar",
        mensagem: `Qualidade do ar ruim em ${cidade}. IQA: ${qualidadeAr}`,
        cidade,
      });
    }
  }

  async criarAlerta({ tipo, severidade, titulo, mensagem, cidade }) {
    const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const alertaSimilar = this.alertas.find(
      (alerta) =>
        alerta.tipo === tipo &&
        alerta.cidade === cidade &&
        new Date(alerta.timestamp) > duasHorasAtras
    );

    if (!alertaSimilar) {
      const novoAlerta = {
        id: this.generateId(),
        tipo,
        severidade,
        titulo,
        mensagem,
        cidade,
        timestamp: new Date().toISOString(),
      };

      this.alertas.unshift(novoAlerta);
      if (this.alertas.length > 10) {
        this.alertas.pop();
      }

      this.notifySubscribers();
      this.notificarUsuario(novoAlerta);
    }
  }

  dismissAlerta(id) {
    this.alertas = this.alertas.filter((alerta) => alerta.id !== id);
    this.notifySubscribers();
  }

  async notificarUsuario(alerta) {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification("Dashboard Climático", {
          body: alerta.mensagem,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: alerta.id,
          vibrate: [100, 50, 100],
        });

        notification.onclick = function () {
          window.focus();
          this.close();
        };
      } catch (error) {
        console.error("Erro ao criar notificação:", error);
      }
    }
  }

  async solicitarPermissaoNotificacoes() {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      } catch (error) {
        console.error("Erro ao solicitar permissão:", error);
        return false;
      }
    }
    return Notification.permission === "granted";
  }
}

const alertaService = new AlertaService();
export default alertaService;
