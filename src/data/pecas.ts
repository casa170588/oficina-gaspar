export const TIPOS_PECA = [
  "Rastreamento",
  "Mecânica",
  "Pneus",
  "Filtro",
  "Freio",
  "Motor",
  "Suspensão",
  "Lubrificante",
  "Elétrica",
] as const;

export type TipoPeca = (typeof TIPOS_PECA)[number];

export interface ItemEstoque {
  id: number;
  nome: string;
  codigo: string;
  quantidade: number;
  tipo: string;
}

export const initialItems: ItemEstoque[] = [
  { id: 1, nome: "Filtro de Óleo", codigo: "FO-001", quantidade: 12, tipo: "Filtro" },
  { id: 2, nome: "Pastilha de Freio", codigo: "PF-002", quantidade: 8, tipo: "Freio" },
  { id: 3, nome: "Pneu 195/65R15", codigo: "PN-003", quantidade: 4, tipo: "Pneus" },
  { id: 4, nome: "Correia Dentada", codigo: "CD-004", quantidade: 0, tipo: "Motor" },
  { id: 5, nome: "Amortecedor Dianteiro", codigo: "AD-005", quantidade: 6, tipo: "Suspensão" },
  { id: 6, nome: "Vela de Ignição", codigo: "VI-006", quantidade: 20, tipo: "Motor" },
  { id: 7, nome: "Pneu 205/55R16", codigo: "PN-007", quantidade: 2, tipo: "Pneus" },
  { id: 8, nome: "Óleo Motor 5W30", codigo: "OM-008", quantidade: 15, tipo: "Lubrificante" },
  { id: 9, nome: "Rastreador GPS Veicular", codigo: "RT-001", quantidade: 10, tipo: "Rastreamento" },
  { id: 10, nome: "Antena Rastreamento", codigo: "RT-002", quantidade: 5, tipo: "Rastreamento" },
  { id: 11, nome: "Chicote Elétrico Rastreador", codigo: "RT-003", quantidade: 3, tipo: "Rastreamento" },
  { id: 12, nome: "Módulo GSM Rastreamento", codigo: "RT-004", quantidade: 0, tipo: "Rastreamento" },
  { id: 13, nome: "Relé de Bloqueio", codigo: "RT-005", quantidade: 7, tipo: "Rastreamento" },
];
