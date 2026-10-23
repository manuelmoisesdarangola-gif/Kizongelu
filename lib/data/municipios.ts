/**
 * @file lib/data/municipios.ts
 * Lista oficial de Províncias e Municípios de Angola para o Wizard de Orçamentação.
 */

export interface ProvinceData {
  id: string;
  name: string;
  isPriority: boolean;
  municipios: string[];
}

export const PROVINCES_ANGOLA: ProvinceData[] = [
  {
    id: 'Luanda',
    name: 'Luanda',
    isPriority: true,
    municipios: [
      'Belas',
      'Cacuaco',
      'Cazenga',
      'Icolo e Bengo',
      'Kilamba Kiaxi',
      'Luanda',
      'Quiçama',
      'Talatona',
      'Viana',
    ],
  },
  {
    id: 'Benguela',
    name: 'Benguela',
    isPriority: true,
    municipios: [
      'Baía Farta',
      'Balombo',
      'Benguela',
      'Bocoio',
      'Caimbambo',
      'Catumbela',
      'Chongorói',
      'Ganda',
      'Lobito',
    ],
  },
  {
    id: 'Huíla',
    name: 'Huíla',
    isPriority: true,
    municipios: [
      'Caconda',
      'Cacula',
      'Caluquembe',
      'Chiange',
      'Chibia',
      'Chicomba',
      'Chipindo',
      'Cuvango',
      'Humpata',
      'Jamba',
      'Lubango',
      'Matala',
      'Quilengues',
      'Quipungo',
    ],
  },
  {
    id: 'Huambo',
    name: 'Huambo',
    isPriority: true,
    municipios: [
      'Bailundo',
      'Caála',
      'Catchiungo',
      'Chicala-Cholohanga',
      'Chinjenje',
      'Ecunha',
      'Huambo',
      'Londuimbali',
      'Longonjo',
      'Mungo',
      'Ucuma',
    ],
  },
  {
    id: 'Malanje',
    name: 'Malanje',
    isPriority: true,
    municipios: [
      'Cacuso',
      'Calandula',
      'Cambundi-Catembo',
      'Cangandala',
      'Kiwaba Nzoji',
      'Kunda dya Baze',
      'Luquembo',
      'Malanje',
      'Marimba',
      'Massango',
      'Mucari',
      'Quela',
      'Quirima',
    ],
  },
  {
    id: 'Cabinda',
    name: 'Cabinda',
    isPriority: true,
    municipios: [
      'Belize',
      'Buco-Zau',
      'Cabinda',
      'Cacongo',
    ],
  },
  {
    id: 'Lunda Norte',
    name: 'Lunda Norte',
    isPriority: true,
    municipios: [
      'Cambulo',
      'Capenda-Camulemba',
      'Caungula',
      'Chitato',
      'Cuango',
      'Cuílo',
      'Lóvua',
      'Lubalo',
      'Lucapa',
      'Xá-Muteba',
    ],
  },
  {
    id: 'Lunda Sul',
    name: 'Lunda Sul',
    isPriority: true,
    municipios: [
      'Cacolo',
      'Dala',
      'Muconda',
      'Saurimo',
    ],
  },
  {
    id: 'Bengo',
    name: 'Bengo',
    isPriority: false,
    municipios: ['Ambriz', 'Bula Atumba', 'Dande', 'Dembos', 'Nambuangongo', 'Pango Aluquém'],
  },
  {
    id: 'Bié',
    name: 'Bié',
    isPriority: false,
    municipios: ['Andulo', 'Camacupa', 'Catabola', 'Chinguar', 'Chitembo', 'Cuemba', 'Cuíto', 'Cunhinga', 'Nharea'],
  },
  {
    id: 'Cuanza Norte',
    name: 'Cuanza Norte',
    isPriority: false,
    municipios: ['Ambaca', 'Banga', 'Bolongongo', 'Cambambe', 'Cazengo', 'Golungo Alto', 'Gonguembo', 'Lucala', 'Quiculungo', 'Samba Cajú'],
  },
  {
    id: 'Cuanza Sul',
    name: 'Cuanza Sul',
    isPriority: false,
    municipios: ['Amboim', 'Cassongue', 'Cela', 'Conda', 'Ebo', 'Libolo', 'Mussende', 'Porto Amboim', 'Quibala', 'Quilenda', 'Seles', 'Sumbe'],
  },
  {
    id: 'Cunene',
    name: 'Cunene',
    isPriority: false,
    municipios: ['Cahama', 'Cuanhama', 'Curoca', 'Cuvelai', 'Namacunde', 'Ombadja'],
  },
  {
    id: 'Cuando Cubango',
    name: 'Cuando Cubango',
    isPriority: false,
    municipios: ['Calai', 'Cuangar', 'Cuchi', 'Cuito Cuanavale', 'Dirico', 'Mavinga', 'Menongue', 'Nancova', 'Rivungo'],
  },
  {
    id: 'Moxico',
    name: 'Moxico',
    isPriority: false,
    municipios: ['Alto Zambeze', 'Bundas', 'Camanongue', 'Leua', 'Luacano', 'Luau', 'Luchazes', 'Lumeje', 'Moxico (Luena)'],
  },
  {
    id: 'Namibe',
    name: 'Namibe',
    isPriority: false,
    municipios: ['Bibala', 'Camucuio', 'Moçâmedes', 'Tômbwa', 'Virei'],
  },
  {
    id: 'Uíge',
    name: 'Uíge',
    isPriority: false,
    municipios: ['Alto Cauale', 'Ambuíla', 'Bembe', 'Buengas', 'Bungo', 'Damba', 'Milunga', 'Mucaba', 'Negage', 'Puri', 'Quimbele', 'Quitexe', 'Sanza Pombo', 'Songo', 'Uíge', 'Zombo'],
  },
  {
    id: 'Zaire',
    name: 'Zaire',
    isPriority: false,
    municipios: ['Cuimba', 'Mbanza Kongo', 'Noqui', 'Nzetu', 'Soyo', 'Tomboco'],
  },
  {
    id: 'Outra',
    name: 'Outra Província',
    isPriority: false,
    municipios: ['Outro Município'],
  },
];

export function getMunicipiosByProvince(provinceName: string): string[] {
  const found = PROVINCES_ANGOLA.find(
    (p) => p.name.toLowerCase() === provinceName.toLowerCase() || p.id.toLowerCase() === provinceName.toLowerCase()
  );
  return found ? found.municipios : ['Sede Municipal', 'Outro Município'];
}
