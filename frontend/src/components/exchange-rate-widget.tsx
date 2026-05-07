import { useEffect, useState } from "react";
import { getExchangeRates, type ExchangeRate } from "@/api/exchangeRates";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

// ícone da bandeira via unicode ou texto
// Record é um objeto que mapeia o código da moeda para a sigla da bandeira (ex: USD -> US)
const flags: Record<string, string> = {
  USD: "US",
  EUR: "EU",
  GBP: "GB",
};

// componente para exibir a taxa de câmbio de uma moeda específica
// recebe 
function RateCard({ rate }: { rate: ExchangeRate }) {
  const flag = flags[rate.code] || rate.code; // fallback para mostrar o código se não tiver bandeira definida
  const bid = parseFloat(rate.bid); // valor atual da taxa de câmbio

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur p-4">
      <div className="flex items-center justify-between mb-2">
         
        {/* ícone da bandeira */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-white">{flag}</span>
          <span className="text-xs text-zinc-500">{rate.code}/BRL</span>
        </div>

        {/* data e hora da última atualização */}
        <span className="text-xs text-zinc-600 font-mono">
          {new Date(rate.create_date).toLocaleTimeString("pt-BR")}
        </span>

      </div>

      {/* valor atual da taxa de câmbio */}
      <p className="text-lg font-semibold text-white tabular-nums">
        R$ {bid.toFixed(2)}
      </p>

      {/* valor máximo da taxa de câmbio */}
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] text-zinc-600">
          Máx: R$ {parseFloat(rate.high).toFixed(2)}
        </span>
      </div>

    </div>
  );
}

export default function ExchangeRateWidget() {
                                // usando o Record para mapear o código da moeda para a taxa de câmbio correspondente
  const [rates, setRates] = useState<Record<string, ExchangeRate> | null>(null); // estado para armazenar as taxas de câmbio
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(""); 
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null); // // estado para armazenar a data e hora da última atualização das taxas de câmbio

  const fetchRates = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getExchangeRates(); // busca as taxas de câmbio da API
      setRates({ USD: data.USDBRL, EUR: data.EURBRL, GBP: data.GBPBRL }); // atualiza o estado com as taxas de câmbio
      setLastUpdate(new Date()); // atualiza o estado com a data e hora da última atualização
    } catch {
      setError("Não foi possível carregar as cotações");
    } finally {
      setLoading(false);
    }
  };

  // useEffect para buscar as taxas de câmbio quando o componente for montado e a cada 5 minutos
  // isso é necessário pra garantir que as taxas de câmbio sejam atualizadas regularmente, já que elas podem mudar com frequência
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm p-5 mb-5">

      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-white">Câmbio</h2>
          {lastUpdate && (
            <span className="text-[10px] text-zinc-600 font-mono">
              {lastUpdate.toLocaleTimeString("pt-BR")} {/* exibe a hora da última atualização das taxas de câmbio */}
            </span>
          )}
        </div>

        {/* botão para atualizar as taxas de câmbio */}
        <button
          onClick={fetchRates} 
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>


      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : (
        // exibe as taxas de câmbio em um grid de 3 colunas, usando o componente RateCard para cada taxa de câmbio
        <div className="grid grid-cols-3 gap-3">
          {rates
            ? Object.values(rates).map((rate) => (
                <RateCard key={rate.code} rate={rate} />
              ))
            : Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 animate-pulse"
                >
                  <div className="h-4 w-16 bg-zinc-800 rounded mb-2" />
                  <div className="h-6 w-20 bg-zinc-800 rounded" />
                </div>
              ))}
        </div>
      )}
    </div>
  );
}