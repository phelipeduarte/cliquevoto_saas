import { useState, useEffect } from 'react';
import { User, CheckCircle2, ChevronRight, Loader2, AlertTriangle, Check, MonitorPlay, LogOut, RefreshCw, BarChart3 } from 'lucide-react';
import axios from 'axios';

// Aponta para a AWS na Vercel, ou para o localhost no seu PC
const API_URL = import.meta.env.VITE_API_URL || 'https://api.cliquevoto.com.br/api';

export default function App() {
  const [etapa, setEtapa] = useState(1);
  const [cpf, setCpf] = useState('');
  const [eleicao, setEleicao] = useState<any>(null);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  
  // Novos estados para a aba de Resultados
  const [aba, setAba] = useState<'votacao' | 'resultados'>('votacao');
  const [resultados, setResultados] = useState<any>(null);
  const [carregandoResultados, setCarregandoResultados] = useState(false);

  useEffect(() => {
    const carregarUrna = async () => {
      try {
        const res = await axios.get(`${API_URL}/eleicoes/ativas`);
        if (res.data.length > 0) {
          const ativa = res.data[0];
          setEleicao(ativa);
          
          const resOp = await axios.get(`${API_URL}/eleicoes/${ativa.id}/opcoes`);
          setCandidatos(resOp.data);
        } else {
          setErro("Nenhuma eleição ativa no momento.");
        }
      } catch (err) {
        setErro("Não foi possível conectar ao servidor. Verifique sua internet.");
      } finally {
        setLoading(false);
      }
    };
    carregarUrna();
  }, []);

  // Função para buscar os resultados na API
  const carregarResultados = async () => {
    if (!eleicao) return;
    setCarregandoResultados(true);
    try {
      const res = await axios.get(`${API_URL}/eleicoes/${eleicao.id}/resultados`);
      setResultados(res.data);
    } catch (err) {
      console.error("Erro ao carregar resultados", err);
    } finally {
      setCarregandoResultados(false);
    }
  };

  const handleIrParaConfirmacao = () => {
    if (candidatoSelecionado) {
      setEtapa(2.5);
    }
  };

  const handleCorrigirVoto = () => {
    setCandidatoSelecionado(null);
    setEtapa(2);
  };

  const handleConfirmarVotoFinal = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/votar`, {
        evento_id: eleicao.id,
        opcao_id: candidatoSelecionado,
        cpf_eleitor: cpf
      });
      setEtapa(3);
    } catch (err: any) {
      alert(err.response?.data?.erro || "Erro ao registrar o voto.");
      setEtapa(1); 
      setCpf('');
      setCandidatoSelecionado(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && etapa === 1) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
    </div>
  );

  if (erro) return (
    <div className="h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-xl text-center border-t-4 border-red-500 max-w-md w-full">
        <AlertTriangle className="mx-auto text-red-500 mb-4 w-12 h-12" />
        <p className="font-bold text-slate-200">{erro}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-emerald-500 font-bold hover:underline">Tentar novamente</button>
      </div>
    </div>
  );

  const candidatoRevisao = candidatos.find(c => c.id === candidatoSelecionado);

  return (
    <div className="h-screen lg:overflow-hidden bg-slate-900 text-slate-200 flex flex-col font-sans">
      
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-sm z-50 shrink-0">
        <div className="flex items-center">
          {eleicao?.logo_url ? (
            <img src={eleicao.logo_url} alt="Logo do Cliente" className="h-10 object-contain" />
          ) : (
            <div className="h-10 px-4 bg-slate-700/50 rounded flex items-center justify-center border border-slate-600 border-dashed">
              <span className="font-bold text-slate-400 text-sm tracking-widest">LOGO DO CLIENTE</span>
            </div>
          )}
        </div>

        {etapa > 1 && etapa < 3 && aba === 'votacao' && (
          <div className="flex items-center gap-3 bg-slate-700/50 px-4 py-2 rounded-full border border-slate-600">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300 hidden sm:inline">CPF: {cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</span>
            <button 
              onClick={() => { setEtapa(1); setCpf(''); setCandidatoSelecionado(null); }} 
              title="Sair" 
              className="ml-2 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row gap-6 relative overflow-y-auto lg:overflow-hidden">
        
        {/* Coluna do Vídeo */}
        <div className="flex-[2] flex flex-col items-center justify-start min-h-[300px] lg:h-full shrink-0 lg:shrink">
          <section className="w-full h-full bg-black rounded-2xl border border-slate-700 flex flex-col items-center justify-center overflow-hidden shadow-2xl relative">
            <MonitorPlay className="w-16 h-16 text-slate-800 mb-4 absolute z-0" />
            <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/60 backdrop-blur-sm">
               <p className="text-slate-300 font-medium text-lg tracking-wide bg-black/50 px-4 py-2 rounded-lg">Transmissão da Assembleia</p>
            </div>
          </section>
        </div>

        {/* Coluna da Urna */}
        <div className="flex-[1] flex flex-col items-center lg:items-start justify-start w-full lg:h-full min-h-0">
          <section className="max-w-md w-full bg-slate-800 rounded-2xl border border-slate-700 flex flex-col overflow-hidden shadow-2xl h-full flex-1">
            
            {/* Abas Superiores */}
            <div className="flex border-b border-slate-700 bg-slate-800/80 shrink-0">
              <button 
                onClick={() => setAba('votacao')}
                className={`px-6 py-4 font-bold text-sm tracking-wide transition-colors ${aba === 'votacao' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'}`}
              >
                VOTAÇÃO
              </button>
              <button 
                onClick={() => { setAba('resultados'); carregarResultados(); }}
                className={`px-6 py-4 font-bold text-sm tracking-wide transition-colors flex items-center gap-2 ${aba === 'resultados' ? 'border-b-2 border-emerald-500 text-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'}`}
              >
                <BarChart3 className="w-4 h-4" /> RESULTADOS
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col min-h-0">
              
              {/* === TELA DE VOTAÇÃO === */}
              {aba === 'votacao' && (
                <>
                  {etapa !== 3 && (
                    <div className="flex justify-between items-start mb-8 shrink-0">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-1 leading-tight">{eleicao?.titulo || "Carregando..."}</h2>
                        <p className="text-sm text-slate-400">{eleicao?.organizacao_nome}</p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        Aberta
                      </span>
                    </div>
                  )}

                  {etapa === 1 && (
                    <div className="space-y-6 flex-1 flex flex-col justify-center animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-slate-400 text-sm font-medium">Digite seu CPF para acessar a urna</label>
                        <input 
                          type="text" 
                          placeholder="Somente números"
                          value={cpf}
                          onChange={e => setCpf(e.target.value.replace(/\D/g, ''))}
                          className="w-full p-4 rounded-xl bg-slate-900 border border-slate-600 text-center text-xl font-mono text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 shadow-inner"
                          maxLength={11}
                        />
                      </div>
                      <button 
                        onClick={() => setEtapa(2)}
                        disabled={cpf.length < 11}
                        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex justify-center items-center hover:bg-emerald-500 transition-colors"
                      >
                        ACESSAR PAINEL <ChevronRight className="w-5 h-5 ml-2" />
                      </button>
                    </div>
                  )}

                  {etapa === 2 && (
                    <div className="space-y-4 flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-300">
                      <h3 className="text-slate-300 font-medium pb-2 border-b border-slate-700 shrink-0">Selecione uma opção:</h3>
                      
                      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {candidatos.map(c => (
                          <button 
                            key={c.id}
                            onClick={() => setCandidatoSelecionado(c.id)}
                            className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                              candidatoSelecionado === c.id 
                                ? 'border-emerald-500 bg-slate-700/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]' 
                                : 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/60'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-full bg-slate-600 border-2 border-slate-500 overflow-hidden mr-4 flex items-center justify-center flex-shrink-0">
                                {eleicao?.mostrar_fotos && c.foto_url ? (
                                  <img src={c.foto_url} alt={c.nome} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              <div className="text-left">
                                <span className="font-bold text-slate-200 block text-lg">{c.nome}</span>
                                {c.numero && <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">Número: {c.numero}</span>}
                              </div>
                            </div>
                            
                            {candidatoSelecionado === c.id && (
                              <div className="text-emerald-400 bg-emerald-400/10 p-1.5 rounded-full animate-in zoom-in duration-200">
                                <Check className="w-5 h-5 font-bold" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-slate-700 shrink-0 mt-2">
                        <button 
                          onClick={handleIrParaConfirmacao}
                          disabled={!candidatoSelecionado}
                          className={`w-full py-4 rounded-xl font-bold flex justify-center items-center transition-all duration-300 ${
                            !candidatoSelecionado
                              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/50'
                          }`}
                        >
                          PROSSEGUIR
                        </button>
                      </div>
                    </div>
                  )}

                  {etapa === 2.5 && candidatoRevisao && (
                    <div className="flex-1 flex flex-col justify-center animate-in slide-in-from-right-4 duration-300">
                      <div className="text-center mb-8">
                        <p className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">Você está votando em</p>
                        
                        <div className="bg-slate-700/50 rounded-2xl p-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] inline-block w-full">
                          <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 border-4 border-emerald-500 overflow-hidden mb-4 flex items-center justify-center shadow-lg">
                            {eleicao?.mostrar_fotos && candidatoRevisao.foto_url ? (
                              <img src={candidatoRevisao.foto_url} alt={candidatoRevisao.nome} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-12 h-12 text-slate-500" />
                            )}
                          </div>
                          
                          <h3 className="text-2xl font-bold text-white">{candidatoRevisao.nome}</h3>
                          {candidatoRevisao.numero && <p className="text-lg text-emerald-400 font-mono mt-2 bg-slate-800/80 inline-block px-4 py-1 rounded-lg">Nº {candidatoRevisao.numero}</p>}
                        </div>
                      </div>

                      <div className="flex gap-4 shrink-0 mt-auto">
                        <button 
                          onClick={handleCorrigirVoto}
                          disabled={loading}
                          className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                          CORRIGIR
                        </button>
                        <button 
                          onClick={handleConfirmarVotoFinal}
                          disabled={loading}
                          className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "CONFIRMAR VOTO"}
                        </button>
                      </div>
                    </div>
                  )}

                  {etapa === 3 && (
                    <div className="text-center py-10 flex-1 flex flex-col justify-center animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold text-white mb-2">Voto Computado!</h2>
                      <p className="text-slate-400">Obrigado pela sua participação.</p>
                      <div className="mt-8 p-4 bg-slate-800 rounded-xl border border-slate-700">
                         <p className="text-sm text-slate-500">Comprovante gerado com sucesso para o CPF final {cpf.slice(-2)}.</p>
                      </div>
                      <button 
                        onClick={() => { setEtapa(1); setCpf(''); setCandidatoSelecionado(null); }} 
                        className="mt-8 px-6 py-4 bg-slate-700 font-bold text-emerald-400 rounded-xl hover:bg-slate-600 transition-colors w-full"
                      >
                        Voltar ao Início
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* === TELA DE RESULTADOS === */}
              {aba === 'resultados' && (
                <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                      <h2 className="text-xl font-bold text-white leading-tight">Apuração em Tempo Real</h2>
                      <p className="text-sm text-slate-400">Acompanhe os votos computados</p>
                    </div>
                    <button 
                      onClick={carregarResultados} 
                      className="p-3 bg-slate-700/50 rounded-xl hover:bg-slate-700 border border-slate-600 text-emerald-400 transition-all shadow-sm"
                      title="Atualizar Apuração"
                    >
                      <RefreshCw className={`w-5 h-5 ${carregandoResultados ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {carregandoResultados && !resultados ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                      </div>
                    ) : (
                      resultados?.ranking?.map((c: any, index: number) => (
                        <div key={index} className="bg-slate-700/30 p-4 rounded-xl border border-slate-600 relative overflow-hidden group hover:border-slate-500 transition-colors">
                          <div className="flex justify-between items-center mb-3 relative z-10">
                            <div className="flex items-center gap-3">
                              {/* Bolinha de Posição */}
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-xs font-bold text-slate-400 border border-slate-600">
                                {index + 1}º
                              </span>
                              <span className="font-bold text-slate-200 text-lg">{c.nome}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-emerald-400 text-lg block">{c.porcentagem}%</span>
                              <span className="text-xs text-slate-400 font-mono">{c.votos} votos</span>
                            </div>
                          </div>
                          
                          {/* Barra de Progresso */}
                          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden shadow-inner relative z-10">
                            <div 
                              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${c.porcentagem}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {!carregandoResultados && resultados?.ranking?.length === 0 && (
                      <div className="text-center text-slate-500 py-10">
                        Nenhum voto computado ainda.
                      </div>
                    )}
                  </div>

                  {resultados && (
                    <div className="mt-4 pt-4 border-t border-slate-700 shrink-0 text-center flex items-center justify-between bg-slate-800 p-4 rounded-xl">
                      <span className="text-slate-400 font-medium">Total de votos apurados:</span>
                      <span className="font-bold text-2xl text-white bg-slate-900 px-4 py-1 rounded-lg border border-slate-700">
                        {resultados.total_geral}
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>
          </section>
        </div>

      </main>
    </div>
  );
}