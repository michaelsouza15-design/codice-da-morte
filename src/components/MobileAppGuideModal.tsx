import React, { useState } from 'react';
import {
  Smartphone,
  Globe,
  Share2,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Layers,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Wifi,
} from 'lucide-react';

interface MobileAppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onTriggerInstall?: () => void;
  currentAppUrl: string;
}

export const MobileAppGuideModal: React.FC<MobileAppGuideModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onTriggerInstall,
  currentAppUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'host' | 'apk'>('host');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const capacitorCommands = `# 1. Instalar as dependências do Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Inicializar o projeto mobile
npx cap init "O Codice da Morte" "com.codicedamorte.app" --web-dir dist

# 3. Compilar os arquivos da web
npm run build

# 4. Adicionar a plataforma Android
npx cap add android

# 5. Abrir no Android Studio para gerar o APK assinado
npx cap open android`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md animate-fade-in text-[#e0d8d0] overflow-y-auto">
      <div className="glass-ui-amber card-shadow border-amber-500/40 p-6 sm:p-8 rounded-3xl max-w-2xl w-full my-auto space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl glass-ui hover:border-amber-400 text-zinc-400 hover:text-amber-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl glass-ui-amber border-amber-400/60 flex items-center justify-center shadow-lg shrink-0">
            <Smartphone className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-black text-white uppercase tracking-[0.15em]">
              Guia: App de Celular & Host Online
            </h2>
            <p className="text-xs text-amber-300/80 font-serif">
              Tudo o que você precisa para jogar online com amigos e instalar no celular.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 glass-ui bg-black/50 rounded-2xl border-white/10">
          <button
            onClick={() => setActiveTab('host')}
            className={`py-2.5 px-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'host'
                ? 'bg-amber-600/80 text-white border border-amber-400/60 shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1.</span> Host Online
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-2.5 px-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'bg-amber-600/80 text-white border border-amber-400/60 shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2.</span> Instalar no Celular
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2.5 px-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-amber-600/80 text-white border border-amber-400/60 shadow-lg'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3.</span> Gerar APK Nativo
          </button>
        </div>

        {/* Tab 1: How Host Online Works */}
        {activeTab === 'host' && (
          <div className="space-y-4 text-xs font-serif leading-relaxed">
            <div className="p-4 rounded-2xl glass-ui-dark border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Wifi className="w-4 h-4 text-emerald-400" />
                Como funciona o Host Online no Celular:
              </div>
              <p className="text-zinc-200">
                O backend do jogo roda com <strong>WebSockets (Socket.IO)</strong> em tempo real. Qualquer jogador pode ser o Host pelo celular ou computador.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl glass-ui border-white/10 space-y-1">
                  <span className="text-amber-400 font-bold text-[11px] block">1. Crie a Sala</span>
                  <span className="text-[11px] text-zinc-300 block">
                    Toque em "Criar Sala Privada Online". Um código único de 5 letras é gerado.
                  </span>
                </div>

                <div className="p-3 rounded-xl glass-ui border-white/10 space-y-1">
                  <span className="text-amber-400 font-bold text-[11px] block">2. Convide Amigos</span>
                  <span className="text-[11px] text-zinc-300 block">
                    Use o botão <strong>"Compartilhar Link"</strong> (WhatsApp) ou exiba o <strong>QR Code</strong> na tela.
                  </span>
                </div>

                <div className="p-3 rounded-xl glass-ui border-white/10 space-y-1">
                  <span className="text-amber-400 font-bold text-[11px] block">3. Entrada Instantânea</span>
                  <span className="text-[11px] text-zinc-300 block">
                    Seus amigos clicam no link ou apontam a câmera do celular e já entram na sala automaticamente!
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl glass-ui border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Link base do seu servidor:
                </span>
                <span className="text-xs font-mono text-amber-300 break-all select-all">
                  {currentAppUrl}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(currentAppUrl, 'app_url')}
                className="px-3 py-2 rounded-xl glass-ui-amber text-amber-200 text-xs font-serif font-bold hover:border-amber-400 transition-all shrink-0 flex items-center gap-1.5"
              >
                {copiedCmd === 'app_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Install as PWA (Web App) */}
        {activeTab === 'pwa' && (
          <div className="space-y-4 text-xs font-serif leading-relaxed">
            <div className="p-4 rounded-2xl glass-ui-dark border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Instalar como App sem Loja (PWA)
                </div>
                {deferredPrompt && (
                  <button
                    onClick={onTriggerInstall}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow border border-amber-400 animate-pulse flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Instalar Agora
                  </button>
                )}
              </div>
              <p className="text-zinc-200">
                O jogo é um <strong>PWA oficial</strong>. Ele funciona em tela cheia no celular, com ícone próprio na grade de apps, sem barra do navegador e com carregamento ultra-rápido.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Android Chrome */}
                <div className="p-3.5 rounded-xl glass-ui border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Smartphone className="w-4 h-4" />
                    No Android (Google Chrome / Brave)
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300">
                    <li>Abra o link do jogo no Chrome.</li>
                    <li>Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito.</li>
                    <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                    <li>O ícone do <em>Códice da Morte</em> aparecerá nos seus apps!</li>
                  </ol>
                </div>

                {/* iPhone iOS */}
                <div className="p-3.5 rounded-xl glass-ui border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                    <Smartphone className="w-4 h-4" />
                    No iPhone (Safari iOS)
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300">
                    <li>Abra o link do jogo no navegador <strong>Safari</strong>.</li>
                    <li>Toque no botão de <strong>Compartilhar (⎋)</strong> na barra inferior.</li>
                    <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
                    <li>Toque em <strong>"Adicionar"</strong> no topo direito.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Native APK via Capacitor */}
        {activeTab === 'apk' && (
          <div className="space-y-4 text-xs font-serif leading-relaxed">
            <div className="p-4 rounded-2xl glass-ui-dark border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Terminal className="w-4 h-4 text-amber-400" />
                Como compilar para APK Android (Google Play ou Instalação Direta)
              </div>
              <p className="text-zinc-200">
                Você pode empacotar este projeto React + Vite em um APK nativo usando o <strong>Capacitor</strong> ou o <strong>PWABuilder</strong>:
              </p>

              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-black/80 border border-white/15 text-[11px] font-mono text-amber-200 overflow-x-auto">
                  {capacitorCommands}
                </pre>
                <button
                  onClick={() => copyToClipboard(capacitorCommands, 'cap_cmd')}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-lg glass-ui-amber text-amber-200 text-[10px] font-mono hover:border-amber-400 transition-all flex items-center gap-1"
                >
                  {copiedCmd === 'cap_cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar Comandos
                </button>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
                <span>
                  💡 <strong>Alternativa Online sem instalar nada:</strong> Use o site gratuito <strong>PWABuilder.com</strong> inserindo a URL do jogo para gerar o APK pronto para a Google Play Store.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Salas sincronizadas em tempo real com WebSockets
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl glass-ui-amber text-amber-200 text-xs font-serif font-bold uppercase tracking-wider hover:border-amber-400 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
