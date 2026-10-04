import axios from 'axios';

// The API answers errors as RFC 7807 problem details:
//   { status, detail, requestId, errors?: { "cpf": "CPF inválido", "items[0].quantity": "..." } }
interface ProblemDetail {
  status?: number;
  detail?: string;
  requestId?: string;
  errors?: Record<string, string>;
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  phone: 'Telefone',
  cpf: 'CPF',
  email: 'E-mail',
  address: 'Endereço',
  obs: 'Observações',
  observations: 'Observações',
  birthday: 'Nascimento',
  age: 'Idade',
  species: 'Espécie',
  race: 'Raça',
  weight: 'Peso',
  coatType: 'Pelagem',
  packagePrice: 'Preço do pacote',
  frequencia: 'Frequência',
  protocols: 'Serviços',
  protocolId: 'Serviço',
  quantity: 'Quantidade',
  category: 'Categoria',
  animalTarget: 'Animal',
  unit: 'Unidade',
  costPrice: 'Preço de custo',
  salePrice: 'Preço de venda',
  barcode: 'Código de barras',
  ncm: 'NCM',
  minStockQty: 'Estoque mínimo',
  currentStockQty: 'Estoque atual',
  customerId: 'Cliente',
  time: 'Data/hora',
  duration: 'Duração',
  price: 'Preço',
  discount: 'Desconto',
  items: 'Itens',
  description: 'Descrição',
  unitPrice: 'Preço unitário',
  username: 'Usuário',
  password: 'Senha',
};

/** "items[0].quantity" -> "Item 1 – Quantidade"; "scheduling.time" -> "Data/hora". */
function fieldLabel(path: string): string {
  const parts = path.split('.');
  const last = parts[parts.length - 1].replace(/\[\d+\]$/, '');
  const index = path.match(/\[(\d+)\]/);
  const label = FIELD_LABELS[last] ?? last;
  return index ? `Item ${Number(index[1]) + 1} – ${label}` : label;
}

/**
 * Message for a failed API call: the screen's own text, followed by what the server said
 * (field errors for 400, the business rule for 409/422) or the request ID for a 500.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err) || !err.response) return fallback;

  const { status } = err.response;
  const data = err.response.data as ProblemDetail | undefined;
  if (!data || typeof data !== 'object') return fallback;

  if (status >= 500) {
    return data.requestId ? `${fallback} (código ${data.requestId})` : fallback;
  }
  if (data.errors && Object.keys(data.errors).length > 0) {
    const fields = Object.entries(data.errors)
      .map(([field, message]) => `${fieldLabel(field)}: ${message}`)
      .join('; ');
    return `${fallback} — ${fields}`;
  }
  if ((status === 409 || status === 422) && data.detail) {
    return `${fallback} — ${data.detail}`;
  }
  return fallback;
}
