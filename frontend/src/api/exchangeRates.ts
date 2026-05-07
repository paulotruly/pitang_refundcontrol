import axios from "axios";

// criação de uma instância do axios para fazer requisições à API externa de taxas de câmbio
const externalApi = axios.create({
  baseURL: "https://economia.awesomeapi.com.br/json",
});

// interface para representar as informações de uma taxa de câmbio
export interface ExchangeRate {
  code: string;
  codein: string;
  name: string;
  high: string;
  low: string;
  bid: string;
  create_date: string;
}

// interface para a resposta da API, contendo as taxas de câmbio para USD-BRL, EUR-BRL e GBP-BRL
export interface ExchangeRatesResponse {
  USDBRL: ExchangeRate;
  EURBRL: ExchangeRate;
  GBPBRL: ExchangeRate;
}

// função para buscar as taxas de câmbio (USD-BRL, EUR-BRL, GBP-BRL)
export async function getExchangeRates(): Promise<ExchangeRatesResponse> {
  const response = await externalApi.get<ExchangeRatesResponse>(
    "/last/USD-BRL,EUR-BRL,GBP-BRL" // endpoint para obter as últimas taxas de câmbio para USD-BRL, EUR-BRL e GBP-BRL
  );
  return response.data;
}