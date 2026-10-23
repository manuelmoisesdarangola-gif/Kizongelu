/**
 * @file src/db/provinces-database.ts
 * Repositório e tabela de base de dados para Províncias de Angola e coeficientes regionais.
 * Os preços e coeficientes vivem na base de dados simulada e são parametrizáveis.
 */

import { AngolaProvince, ProvinceData } from '../types/domain';

export const PROVINCIAS_ANGOLA: Record<AngolaProvince, ProvinceData> = {
  luanda: {
    id: 'luanda',
    nome: 'Luanda',
    capital: 'Luanda',
    coeficienteLogistica: 1.00, // Capital de referência e principal polo de importação (1.00)
    coeficienteMaoDeObra: 1.00,
  },
  'icolo-e-bengo': {
    id: 'icolo-e-bengo',
    nome: 'Icolo e Bengo',
    capital: 'Catete',
    coeficienteLogistica: 1.03, // Polo agroindustrial e expansão metropolitana (+3%)
    coeficienteMaoDeObra: 0.98,
  },
  bengo: {
    id: 'bengo',
    nome: 'Bengo',
    capital: 'Caxito',
    coeficienteLogistica: 1.05, // Caxito e periferia norte (+5%)
    coeficienteMaoDeObra: 0.96,
  },
  benguela: {
    id: 'benguela',
    nome: 'Benguela',
    capital: 'Benguela / Lobito',
    coeficienteLogistica: 1.08, // Porto Comercial do Lobito e transporte costeiro (+8%)
    coeficienteMaoDeObra: 0.95,
  },
  namibe: {
    id: 'namibe',
    nome: 'Namibe',
    capital: 'Moçâmedes',
    coeficienteLogistica: 1.09, // Porto de Moçâmedes e Litoral Sul (+9%)
    coeficienteMaoDeObra: 0.94,
  },
  'cuanza-sul': {
    id: 'cuanza-sul',
    nome: 'Cuanza Sul',
    capital: 'Sumbe',
    coeficienteLogistica: 1.11, // Eixo costeiro centro (+11%)
    coeficienteMaoDeObra: 0.92,
  },
  'cuanza-norte': {
    id: 'cuanza-norte',
    nome: 'Cuanza Norte',
    capital: 'Ndalatando',
    coeficienteLogistica: 1.12, // Corredor rodoviário norte (+12%)
    coeficienteMaoDeObra: 0.91,
  },
  huambo: {
    id: 'huambo',
    nome: 'Huambo',
    capital: 'Huambo',
    coeficienteLogistica: 1.15, // Planalto Central via CFB / EN (+15%)
    coeficienteMaoDeObra: 0.90,
  },
  bie: {
    id: 'bie',
    nome: 'Bié',
    capital: 'Cuito',
    coeficienteLogistica: 1.15, // Eixo centro interior (+15%)
    coeficienteMaoDeObra: 0.88,
  },
  uige: {
    id: 'uige',
    nome: 'Uíge',
    capital: 'Uíge',
    coeficienteLogistica: 1.15, // Planalto norte (+15%)
    coeficienteMaoDeObra: 0.88,
  },
  huila: {
    id: 'huila',
    nome: 'Huíla',
    capital: 'Lubango',
    coeficienteLogistica: 1.18, // Polo sul com entrepostos de Lubango (+18%)
    coeficienteMaoDeObra: 0.92,
  },
  zaire: {
    id: 'zaire',
    nome: 'Zaire',
    capital: 'Mbanza Kongo / Soyo',
    coeficienteLogistica: 1.18, // Corredor petrolífero norte (+18%)
    coeficienteMaoDeObra: 0.95,
  },
  cunene: {
    id: 'cunene',
    nome: 'Cunene',
    capital: 'Ondjiva',
    coeficienteLogistica: 1.19, // Eixo fronteiriço sul (+19%)
    coeficienteMaoDeObra: 0.90,
  },
  malanje: {
    id: 'malanje',
    nome: 'Malanje',
    capital: 'Malanje',
    coeficienteLogistica: 1.20, // Corredor leste de Luanda (+20%)
    coeficienteMaoDeObra: 0.88,
  },
  cubango: {
    id: 'cubango',
    nome: 'Cubango',
    capital: 'Menongue',
    coeficienteLogistica: 1.23, // Eixo sul interior (+23%)
    coeficienteMaoDeObra: 0.88,
  },
  cuando: {
    id: 'cuando',
    nome: 'Cuando',
    capital: 'Mavinga',
    coeficienteLogistica: 1.26, // Sudeste interior (+26%)
    coeficienteMaoDeObra: 0.85,
  },
  'moxico-leste': {
    id: 'moxico-leste',
    nome: 'Moxico Leste',
    capital: 'Luau',
    coeficienteLogistica: 1.28, // Fronteira RDC e Corredor Lobito (+28%)
    coeficienteMaoDeObra: 0.90,
  },
  cabinda: {
    id: 'cabinda',
    nome: 'Cabinda',
    capital: 'Cabinda',
    coeficienteLogistica: 1.29, // Enclave com cabotagem marítima (+29%)
    coeficienteMaoDeObra: 1.10,
  },
  'lunda-sul': {
    id: 'lunda-sul',
    nome: 'Lunda Sul',
    capital: 'Saurimo',
    coeficienteLogistica: 1.33, // Logística Leste e centro diamantífero (+33%)
    coeficienteMaoDeObra: 1.05,
  },
  'lunda-norte': {
    id: 'lunda-norte',
    nome: 'Lunda Norte',
    capital: 'Dundo',
    coeficienteLogistica: 1.35, // Rota Leste e dispersão geográfica (+35%)
    coeficienteMaoDeObra: 1.05,
  },
  moxico: {
    id: 'moxico',
    nome: 'Moxico',
    capital: 'Luena',
    coeficienteLogistica: 1.38, // Corredor ferroviário leste (+38%)
    coeficienteMaoDeObra: 1.00,
  },
};

export function getProvinceData(provinceId: AngolaProvince): ProvinceData {
  const data = PROVINCIAS_ANGOLA[provinceId];
  if (!data) {
    return PROVINCIAS_ANGOLA.luanda;
  }
  return data;
}

export function getAllProvinces(): ProvinceData[] {
  return Object.values(PROVINCIAS_ANGOLA);
}
