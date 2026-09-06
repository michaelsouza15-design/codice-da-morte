import {
  CardMethod,
  CardObject,
  CardEvidence,
  CardEvent,
  CardAbility,
  Character,
  MarkerInfo,
} from '../types/game';
import { CHARACTER_IMAGES } from '../assets/characters';

export const MARKER_INFOS: Record<string, MarkerInfo> = {
  vermelho: {
    color: 'vermelho',
    name: 'Vermelho',
    meaning: 'Perigo / Alta Relevância',
    shortRole: 'Perigo',
    hex: '#ef4444',
    bgClass: 'bg-red-500',
    borderClass: 'border-red-400',
    textClass: 'text-red-400',
  },
  azul: {
    color: 'azul',
    name: 'Azul',
    meaning: 'Ligado ao Método',
    shortRole: 'Método',
    hex: '#3b82f6',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-400',
    textClass: 'text-blue-400',
  },
  preto: {
    color: 'preto',
    name: 'Preto',
    meaning: 'Ligado ao Objeto',
    shortRole: 'Objeto',
    hex: '#18181b',
    bgClass: 'bg-zinc-900',
    borderClass: 'border-zinc-500',
    textClass: 'text-zinc-300',
  },
  dourado: {
    color: 'dourado',
    name: 'Dourado',
    meaning: 'Pista Central',
    shortRole: 'Pista Central',
    hex: '#eab308',
    bgClass: 'bg-amber-400',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-300',
  },
  cinza: {
    color: 'cinza',
    name: 'Cinza',
    meaning: 'Incerteza / Menos Confiável',
    shortRole: 'Incerteza',
    hex: '#9ca3af',
    bgClass: 'bg-gray-400',
    borderClass: 'border-gray-300',
    textClass: 'text-gray-300',
  },
};

// 60 Methods from the official rulebook (M01 to M60)
export const METHODS: CardMethod[] = [
  { id: 'M01', name: 'Asfixia Silenciosa', category: 'Físico', description: 'Bloqueio de ar sutil e sem deixar marcas evidentes' },
  { id: 'M02', name: 'Envenenamento Lento', category: 'Químico', description: 'Gotas de toxina misturadas em bebida ao longo de horas' },
  { id: 'M03', name: 'Queda Induzida', category: 'Físico', description: 'Perda súbita de equilíbrio sobre abismo ou escadaria' },
  { id: 'M04', name: 'Choque Elétrico', category: 'Mecânico', description: 'Descarga potente através de fiação desencapada' },
  { id: 'M05', name: 'Sugestão Fatal', category: 'Psicológico', description: 'Manipulação mental que induz a um ato irrevogável' },
  { id: 'M06', name: 'Estrangulamento', category: 'Físico', description: 'Pressão intensa na garganta com fios ou cordões' },
  { id: 'M07', name: 'Ingestão de Tinta', category: 'Químico', description: 'Consumo forçado de pigmentos alquímicos corrosivos' },
  { id: 'M08', name: 'Exposição ao Frio', category: 'Ambiental', description: 'Confinamento em câmaras glaciais até congelamento' },
  { id: 'M09', name: 'Trauma Craniano', category: 'Físico', description: 'Impacto contundente no crânio com artefato pesado' },
  { id: 'M10', name: 'Sufocamento por Pó', category: 'Ambiental', description: 'Inalação densa de partículas de restauração secas' },
  { id: 'M11', name: 'Queimadura de Óleo', category: 'Químico', description: 'Fluido quente espalhado sobre a pele e roupas' },
  { id: 'M12', name: 'Compressão Torácica', category: 'Físico', description: 'Peso esmagador colocado sobre a caixa torácica' },
  { id: 'M13', name: 'Vapor Tóxico', category: 'Químico', description: 'Emanação química liberada em ambiente fechado' },
  { id: 'M14', name: 'Desorientação Fatal', category: 'Psicológico', description: 'Ilusão de ótica e vertigem em altura perigosa' },
  { id: 'M15', name: 'Corte Preciso', category: 'Físico', description: 'Incisão cirúrgica em artéria vital por lâmina' },
  { id: 'M16', name: 'Hipotermia Induzida', category: 'Ambiental', description: 'Redução forçada da temperatura corporal' },
  { id: 'M17', name: 'Inalação de Fumaça', category: 'Ambiental', description: 'Fumos densos acumulados em cômodo sem janelas' },
  { id: 'M18', name: 'Paralisia por Toxina', category: 'Químico', description: 'Imobilização muscular progressiva até parada respiratória' },
  { id: 'M19', name: 'Impacto Contundente', category: 'Físico', description: 'Golpe seco desferido com peça sólida de ferro ou pedra' },
  { id: 'M20', name: 'Privação Sensorial', category: 'Psicológico', description: 'Isolamento e escuridão que colapsam a mente' },
  { id: 'M21', name: 'Afogamento Seco', category: 'Físico', description: 'Espasmo nas vias respiratórias por retenção de líquido' },
  { id: 'M22', name: 'Choque Térmico', category: 'Ambiental', description: 'Transição extrema entre calor escaldante e frio gélido' },
  { id: 'M23', name: 'Sobrecarga Neural', category: 'Psicológico', description: 'Estímulo proibido que sobrecarrega os sentidos' },
  { id: 'M24', name: 'Esmagamento', category: 'Mecânico', description: 'Estrutura desabada com peso monumental sobre o corpo' },
  { id: 'M25', name: 'Sufocamento por Tecido', category: 'Físico', description: 'Pano pesado ou veludo pressionado sobre o rosto' },
  { id: 'M26', name: 'Intoxicação por Solvente', category: 'Químico', description: 'Gases voláteis de limpeza de manuscritos antigos' },
  { id: 'M27', name: 'Queda de Prateleira', category: 'Mecânico', description: 'Desabamento provocado de estante carregada de livros' },
  { id: 'M28', name: 'Choque por Fio Descascado', category: 'Mecânico', description: 'Armadilha elétrica disposta em trilhos ou puxadores' },
  { id: 'M29', name: 'Sugestão de Pânico', category: 'Psicológico', description: 'Terror induzido levando à fuga desgovernada' },
  { id: 'M30', name: 'Estrangulamento por Corda', category: 'Físico', description: 'Laço de encadernação apertado com força letal' },
  { id: 'M31', name: 'Ingestão de Pó Tóxico', category: 'Químico', description: 'Partículas venenosas ingeridas por contaminação de taça' },
  { id: 'M32', name: 'Exposição Prolongada ao Frio', category: 'Ambiental', description: 'Horas no arquivo subterrâneo sem vestes adequadas' },
  { id: 'M33', name: 'Golpe na Nuca', category: 'Físico', description: 'Ataque traiçoeiro por trás na base do crânio' },
  { id: 'M34', name: 'Sufocamento por Nuvem de Pó', category: 'Ambiental', description: 'Nuvem espessa de conservante lançada no ar da sala' },
  { id: 'M35', name: 'Queimadura por Lâmpada', category: 'Químico', description: 'Óleo incandescente e vidro estilhaçado em chamas' },
  { id: 'M36', name: 'Compressão por Volumes', category: 'Mecânico', description: 'Pilhas colossais de enciclopédias caindo sobre a vítima' },
  { id: 'M37', name: 'Inalação de Vapor de Restauração', category: 'Químico', description: 'Gás ácido liberado durante processo de conservação' },
  { id: 'M38', name: 'Labirinto Mental', category: 'Psicológico', description: 'Desorientação total nas catacumbas do arquivo' },
  { id: 'M39', name: 'Corte com Lâmina Fina', category: 'Físico', description: 'Lâmina afiada de bisturi de restauração em ponto letal' },
  { id: 'M40', name: 'Congelamento Controlado', category: 'Ambiental', description: 'Bloqueio na câmara fria de manuscritos raros' },
  { id: 'M41', name: 'Fumaça de Papel Queimado', category: 'Ambiental', description: 'Monóxido liberado na queima de pergaminhos antigos' },
  { id: 'M42', name: 'Toxina de Planta Antiga', category: 'Químico', description: 'Extrato vegetal venenoso prensado entre páginas' },
  { id: 'M43', name: 'Impacto de Atlas', category: 'Físico', description: 'Arremesso de um atlas encapado em couro e cantoneiras' },
  { id: 'M44', name: 'Isolamento Total', category: 'Psicológico', description: 'Trancado em câmara acústica até a insanidade' },
  { id: 'M45', name: 'Líquido nas Vias Aéreas', category: 'Físico', description: 'Imersão da cabeça em bacia de banho químico' },
  { id: 'M46', name: 'Mudança Brusca de Temperatura', category: 'Ambiental', description: 'Choque do forno de cera para o vento gélido exterior' },
  { id: 'M47', name: 'Excesso de Informação do Códice', category: 'Psicológico', description: 'Revelação de segredos arcanos que paralisam o coração' },
  { id: 'M48', name: 'Desabamento de Estante', category: 'Mecânico', description: 'Madeira carcomida que cede com sabotagem de suporte' },
  { id: 'M49', name: 'Asfixia por Tecido Úmido', category: 'Físico', description: 'Pano embebido em água ou cera colocado sobre as vias' },
  { id: 'M50', name: 'Envenenamento por Tinta Concentrada', category: 'Químico', description: 'Absorção transdérmica de pigmento negro de mercúrio' },
  { id: 'M51', name: 'Empurrão na Escadaria', category: 'Físico', description: 'Impulso violento no topo da escadaria em espiral' },
  { id: 'M52', name: 'Curto-Circuito Fatal', category: 'Mecânico', description: 'Fio de cobre conectado ao corrimão de latão' },
  { id: 'M53', name: 'Hipnose Profunda', category: 'Psicológico', description: 'Pêndulo e fixação que levam ao transe fatal' },
  { id: 'M54', name: 'Estrangulamento por Fita', category: 'Físico', description: 'Fita de seda de encadernação apertada no pescoço' },
  { id: 'M55', name: 'Ingestão de Solvente', category: 'Químico', description: 'Frasco de solvente orgânico misturado ao chá' },
  { id: 'M56', name: 'Noite no Arquivo Frio', category: 'Ambiental', description: 'Tranca emperrada durante a nevasca no subsolo' },
  { id: 'M57', name: 'Golpe com Peso de Papel', category: 'Físico', description: 'Impacto maciço de bronze ou chumbo polido' },
  { id: 'M58', name: 'Nuvem de Pó de Restauração', category: 'Ambiental', description: 'Soprado diretamente nos olhos e pulmões da vítima' },
  { id: 'M59', name: 'Queimadura de Cera Quente', category: 'Químico', description: 'Cera fervente de selagem despejada em ferimento' },
  { id: 'M60', name: 'Esmagamento por Caixa de Arquivo', category: 'Mecânico', description: 'Baú reforçado de carvalho lançado de mezanino' },
];

// 64 Objects from the official rulebook (O01 to O64)
export const OBJECTS: CardObject[] = [
  { id: 'O01', name: 'Caneta de Pena', category: 'Instrumento', description: 'Pena de ganso com ponta de metal aguçada' },
  { id: 'O02', name: 'Cordão de Cortina', category: 'Têxtil', description: 'Corda grossa dourada com pingente de chumbo' },
  { id: 'O03', name: 'Volume do Códice', category: 'Documento', description: 'Tomo ancestral de capa dura encadernado em couro' },
  { id: 'O04', name: 'Lâmpada de Óleo', category: 'Iluminação', description: 'Lamparina de latão com combustível inflamável' },
  { id: 'O05', name: 'Chave de Ferro', category: 'Instrumento', description: 'Chave mestra pesada e ornamentada' },
  { id: 'O06', name: 'Frasco de Tinta', category: 'Recipiente', description: 'Recipiente de vidro escuro com extrato denso' },
  { id: 'O07', name: 'Lupa de Aumento', category: 'Instrumento', description: 'Lente convexa em armação grossa de bronze' },
  { id: 'O08', name: 'Fita de Marcação', category: 'Têxtil', description: 'Fita de veludo carmesim usada para marcar páginas' },
  { id: 'O09', name: 'Estátua de Bronze', category: 'Artefato', description: 'Miniatura maciça de uma gárgula de guarda' },
  { id: 'O10', name: 'Páginas Soltas', category: 'Documento', description: 'Folhas cortantes de pergaminho amarelado' },
  { id: 'O11', name: 'Tesoura de Restauração', category: 'Instrumento', description: 'Tesoura cirúrgica afiada para cortar velino' },
  { id: 'O12', name: 'Peso de Papel', category: 'Artefato', description: 'Globo de vidro maciço com entalhe de caveira' },
  { id: 'O13', name: 'Corda de Encadernação', category: 'Têxtil', description: 'Fio de cânhamo encerado e altamente resistente' },
  { id: 'O14', name: 'Frasco de Solvente', category: 'Recipiente', description: 'Vidro graduado com substância ácida volátil' },
  { id: 'O15', name: 'Lanterna de Mão', category: 'Iluminação', description: 'Lanterna cilíndrica de ferro com vidro fosco' },
  { id: 'O16', name: 'Martelo de Encadernador', category: 'Instrumento', description: 'Martelo de cabeça chata de carvalho e ferro' },
  { id: 'O17', name: 'Cadeado Antigo', category: 'Instrumento', description: 'Trava pesada de ferro fundido com segredo' },
  { id: 'O18', name: 'Pano de Limpeza', category: 'Têxtil', description: 'Flanela manchada de fuligem e reagentes' },
  { id: 'O19', name: 'Régua de Metal', category: 'Instrumento', description: 'Lâmina de corte com borda afiada e milimetrada' },
  { id: 'O20', name: 'Caixa de Madeira', category: 'Mobiliário', description: 'Caixa entalhada de nogueira com fecho secreto' },
  { id: 'O21', name: 'Espelho de Mão', category: 'Artefato', description: 'Espelho prateado com cabo decorado' },
  { id: 'O22', name: 'Garrafa de Água', category: 'Recipiente', description: 'Garrafa de vidro verde selada com cortiça' },
  { id: 'O23', name: 'Luvas de Couro', category: 'Têxtil', description: 'Par de luvas reforçadas para manuseio perigoso' },
  { id: 'O24', name: 'Fio de Cobre', category: 'Instrumento', description: 'Condutor metálico enrolado em carretel antigo' },
  { id: 'O25', name: 'Pó de Restauração', category: 'Recipiente', description: 'Talco químico em pó para absorver umidade' },
  { id: 'O26', name: 'Candelabro', category: 'Iluminação', description: 'Peça de cinco braços de prata fosca' },
  { id: 'O27', name: 'Mapa Enrolado', category: 'Documento', description: 'Carta náutica em tubo cilíndrico de chumbo' },
  { id: 'O28', name: 'Selo de Cera', category: 'Artefato', description: 'Bastão carmesim de lacre e carimbo de sinete' },
  { id: 'O29', name: 'Agulha de Encadernação', category: 'Instrumento', description: 'Agulha longa de aço temperado com ponta fina' },
  { id: 'O30', name: 'Vaso de Cerâmica', category: 'Artefato', description: 'Ânfora de barro cozido com inscrições' },
  { id: 'O31', name: 'Tinta Concentrada', category: 'Recipiente', description: 'Ampola de pigmento escuro com aroma metálico' },
  { id: 'O32', name: 'Corrente de Prata', category: 'Artefato', description: 'Elo resistente com medalhão de relógio' },
  { id: 'O33', name: 'Livro Pesado', category: 'Documento', description: 'Atlas enciclopédico de dez quilos' },
  { id: 'O34', name: 'Lente Queimada', category: 'Artefato', description: 'Pedaço de vidro com marcas de fuligem' },
  { id: 'O35', name: 'Saco de Linho', category: 'Têxtil', description: 'Bolsa opaca com cordão corrediço' },
  { id: 'O36', name: 'Parafuso de Prateleira', category: 'Instrumento', description: 'Pino de retenção de ferro com rosca sabotada' },
  { id: 'O37', name: 'Pena de Ganso', category: 'Instrumento', description: 'Haste afiada embebida em substância desconhecida' },
  { id: 'O38', name: 'Corda de Veludo', category: 'Têxtil', description: 'Cordão vermelho de contenção de área' },
  { id: 'O39', name: 'Tomos Empilhados', category: 'Documento', description: 'Coluna de tratados teológicos amarrados' },
  { id: 'O40', name: 'Lamparina de Bronze', category: 'Iluminação', description: 'Queimador de azeite com mecha de algodão' },
  { id: 'O41', name: 'Chave do Arquivo', category: 'Instrumento', description: 'Chave longa de latão da ala proibida' },
  { id: 'O42', name: 'Frasco de Pigmento', category: 'Recipiente', description: 'Pote cerâmico com pó avermelhado de cinábrio' },
  { id: 'O43', name: 'Lente de Aumento', category: 'Instrumento', description: 'Lente de relojoeiro ajustável para o olho' },
  { id: 'O44', name: 'Fita de Seda', category: 'Têxtil', description: 'Fita negra lisa e resistente à tração' },
  { id: 'O45', name: 'Busto de Mármore', category: 'Artefato', description: 'Escultura da face do fundador da biblioteca' },
  { id: 'O46', name: 'Pergaminho Antigo', category: 'Documento', description: 'Rolo de couro bovino com margens afiadas' },
  { id: 'O47', name: 'Estilete de Restauração', category: 'Instrumento', description: 'Pequena lâmina afiada como navalha' },
  { id: 'O48', name: 'Esfera de Vidro', category: 'Artefato', description: 'Globo transparente que focaliza a luz do sol' },
  { id: 'O49', name: 'Fio de Encadernação', category: 'Têxtil', description: 'Cabo fino de seda trançada com alma de aço' },
  { id: 'O50', name: 'Solvente de Limpeza', category: 'Recipiente', description: 'Frasco com álcool etílico desidratado e éter' },
  { id: 'O51', name: 'Lanterna de Óleo', category: 'Iluminação', description: 'Lamparina com quebra-vento de mica' },
  { id: 'O52', name: 'Martelo Pequeno', category: 'Instrumento', description: 'Martelo de relojoeiro com peso preciso' },
  { id: 'O53', name: 'Cadeado de Ferro', category: 'Instrumento', description: 'Tranca blindada com marca de violação recente' },
  { id: 'O54', name: 'Pano Úmido', category: 'Têxtil', description: 'Pano embebido em óleo de linhaça' },
  { id: 'O55', name: 'Régua de Bronze', category: 'Instrumento', description: 'Barra rígida de peso considerável' },
  { id: 'O56', name: 'Caixa de Arquivo', category: 'Mobiliário', description: 'Gaveta de madeira maciça com puxador de ferro' },
  { id: 'O57', name: 'Espelho Rachado', category: 'Artefato', description: 'Cacos pontiagudos de vidro espelhado' },
  { id: 'O58', name: 'Cantil de Água', category: 'Recipiente', description: 'Cantil metálico de campanha com cheiro estranho' },
  { id: 'O59', name: 'Luvas de Restauração', category: 'Têxtil', description: 'Luvas de algodão fino impregnadas de pó' },
  { id: 'O60', name: 'Fio Elétrico Antigo', category: 'Instrumento', description: 'Cabo com isolamento de tecido puído' },
  { id: 'O61', name: 'Pó Conservante', category: 'Recipiente', description: 'Vidro de bórax e cânfora para conservação' },
  { id: 'O62', name: 'Candelabro de Ferro', category: 'Iluminação', description: 'Suporte de vela único, pesado e com ponta cônica' },
  { id: 'O63', name: 'Mapa da Biblioteca', category: 'Documento', description: 'Planta baixa com passagens secretas anotadas' },
  { id: 'O64', name: 'Selo de Chumbo', category: 'Artefato', description: 'Peso de selagem papal com gravação em relevo' },
];

// 60 Evidences (E01 to E60) complete official deck
export const EVIDENCES: CardEvidence[] = [
  {
    id: 'E01',
    title: 'Causa da Morte',
    subtitle: 'Evidência Fundamental',
    options: ['Asfixia', 'Envenenamento', 'Trauma', 'Choque', 'Queda', 'Exposição'],
  },
  {
    id: 'E02',
    title: 'Natureza da Evidência',
    subtitle: 'Evidência Fundamental',
    options: ['Objeto pessoal', 'Material de restauração', 'Instrumento de trabalho', 'Objeto decorativo', 'Material de arquivo', 'Elemento estrutural'],
  },
  {
    id: 'E03',
    title: 'Estado do Objeto',
    subtitle: 'Condição Física',
    options: ['Intacto', 'Quebrado', 'Rachado', 'Queimado', 'Molhado', 'Desgastado'],
  },
  {
    id: 'E04',
    title: 'Local da Evidência',
    subtitle: 'Compartimento da Abadia',
    options: ['Arquivo', 'Sala de restauração', 'Biblioteca', 'Corredor', 'Escadaria', 'Sala de leitura'],
  },
  {
    id: 'E05',
    title: 'Tamanho do Objeto',
    subtitle: 'Dimensão',
    options: ['Pequeno', 'Médio', 'Grande', 'Comprido', 'Volumoso', 'Compacto'],
  },
  {
    id: 'E06',
    title: 'Material Principal',
    subtitle: 'Composição',
    options: ['Madeira', 'Metal', 'Vidro', 'Couro', 'Tecido', 'Papel'],
  },
  {
    id: 'E07',
    title: 'Aparência',
    subtitle: 'Aspecto Visual',
    options: ['Claro', 'Escuro', 'Metálico', 'Transparente', 'Colorido', 'Opaco'],
  },
  {
    id: 'E08',
    title: 'Peso',
    subtitle: 'Massa do Objeto',
    options: ['Muito leve', 'Leve', 'Moderado', 'Pesado', 'Muito pesado', 'Variável'],
  },
  {
    id: 'E09',
    title: 'Textura',
    subtitle: 'Superfície ao Toque',
    options: ['Áspera', 'Lisa', 'Macia', 'Rígida', 'Pegajosa', 'Úmida'],
  },
  {
    id: 'E10',
    title: 'Forma',
    subtitle: 'Geometria',
    options: ['Longa', 'Redonda', 'Quadrada', 'Fina', 'Irregular', 'Volumosa'],
  },
  {
    id: 'E11',
    title: 'Tipo de Ameaça',
    subtitle: 'Origem do Risco',
    options: ['Física', 'Química', 'Elétrica', 'Térmica', 'Ambiental', 'Mental'],
  },
  {
    id: 'E12',
    title: 'Forma de Contato',
    subtitle: 'Dinâmica de Ação',
    options: ['Toque', 'Ingestão', 'Inalação', 'Compressão', 'Impacto', 'Exposição'],
  },
  {
    id: 'E13',
    title: 'Mecanismo',
    subtitle: 'Princípio do Golpe',
    options: ['Pressão', 'Corte', 'Queda', 'Choque', 'Toxina', 'Temperatura'],
  },
  {
    id: 'E14',
    title: 'Velocidade do Acontecimento',
    subtitle: 'Intervalo de Ação',
    options: ['Instantâneo', 'Muito rápido', 'Rápido', 'Gradual', 'Lento', 'Prolongado'],
  },
  {
    id: 'E15',
    title: 'Interação Necessária',
    subtitle: 'Vínculo do Executor',
    options: ['Contato direto', 'Uso de objeto', 'Manipulação', 'Proximidade', 'Exposição', 'Sem contato'],
  },
  {
    id: 'E16',
    title: 'Rastro Deixado',
    subtitle: 'Vestígio Visível',
    options: ['Marca física', 'Resíduo', 'Líquido', 'Pó', 'Fumaça', 'Nenhum rastro aparente'],
  },
  {
    id: 'E17',
    title: 'Efeito no Ambiente',
    subtitle: 'Alteração do Cenário',
    options: ['Nada alterado', 'Objeto deslocado', 'Material espalhado', 'Quebra', 'Queimadura', 'Desorganização'],
  },
  {
    id: 'E18',
    title: 'Efeito no Corpo',
    subtitle: 'Sinais na Vítima',
    options: ['Marca externa', 'Ferimento', 'Alteração respiratória', 'Alteração neurológica', 'Alteração térmica', 'Sem marca evidente'],
  },
  {
    id: 'E19',
    title: 'Iluminação',
    subtitle: 'Luminosidade',
    options: ['Luz natural', 'Luz de óleo', 'Luz elétrica', 'Luz fraca', 'Escuridão', 'Luz interrompida'],
  },
  {
    id: 'E20',
    title: 'Condição do Local',
    subtitle: 'Estado da Sala',
    options: ['Organizado', 'Desorganizado', 'Danificado', 'Molhado', 'Queimado', 'Abandonado'],
  },
  {
    id: 'E21',
    title: 'O Que Foi Alterado',
    subtitle: 'Estrutura Modificada',
    options: ['Estante', 'Mesa', 'Porta', 'Iluminação', 'Arquivos', 'Objetos decorativos'],
  },
  {
    id: 'E22',
    title: 'Vestígio Encontrado',
    subtitle: 'Material Coletado',
    options: ['Fio', 'Pó', 'Líquido', 'Tecido', 'Papel', 'Metal'],
  },
  {
    id: 'E23',
    title: 'Posição da Evidência',
    subtitle: 'Disposição Espacial',
    options: ['Sobre a mesa', 'No chão', 'Em uma estante', 'Junto à vítima', 'Escondida', 'Fora do lugar'],
  },
  {
    id: 'E24',
    title: 'Distância da Vítima',
    subtitle: 'Proximidade do Corpo',
    options: ['Na mão', 'Ao lado', 'Muito próxima', 'A poucos metros', 'Distante', 'Em outro cômodo'],
  },
  {
    id: 'E25',
    title: 'Tipo de Material',
    subtitle: 'Suporte Documental',
    options: ['Livro', 'Pergaminho', 'Página', 'Mapa', 'Documento', 'Volume'],
  },
  {
    id: 'E26',
    title: 'Estado do Documento',
    subtitle: 'Condição do Tomo',
    options: ['Completo', 'Rasgado', 'Solto', 'Queimado', 'Manchado', 'Alterado'],
  },
  {
    id: 'E27',
    title: 'Tipo de Escrita',
    subtitle: 'Grafia Ancestral',
    options: ['Manuscrito', 'Anotação', 'Símbolo', 'Código', 'Assinatura', 'Texto apagado'],
  },
  {
    id: 'E28',
    title: 'Objeto Relacionado ao Arquivo',
    subtitle: 'Acessório de Guarda',
    options: ['Chave', 'Cadeado', 'Selo', 'Caixa', 'Mapa', 'Tomo'],
  },
  {
    id: 'E29',
    title: 'Acesso ao Local',
    subtitle: 'Franquia de Entrada',
    options: ['Aberto', 'Trancado', 'Arrombado', 'Escondido', 'Restrito', 'Abandonado'],
  },
  {
    id: 'E30',
    title: 'Segurança',
    subtitle: 'Proteção Existente',
    options: ['Sem proteção', 'Chave', 'Cadeado', 'Selo', 'Vigilância', 'Compartimento secreto'],
  },
  {
    id: 'E31',
    title: 'Material de Restauração',
    subtitle: 'Insumo de Oficina',
    options: ['Tinta', 'Solvente', 'Pigmento', 'Pó', 'Fio', 'Tecido'],
  },
  {
    id: 'E32',
    title: 'Ferramenta',
    subtitle: 'Instrumento Utilizado',
    options: ['Tesoura', 'Martelo', 'Régua', 'Agulha', 'Lente', 'Estilete'],
  },
  {
    id: 'E33',
    title: 'Material Manipulado',
    subtitle: 'Substrato Afetado',
    options: ['Papel', 'Madeira', 'Metal', 'Couro', 'Tecido', 'Cerâmica'],
  },
  {
    id: 'E34',
    title: 'Sinal de Manipulação',
    subtitle: 'Marca de Ação',
    options: ['Corte', 'Marca', 'Mancha', 'Desgaste', 'Quebra', 'Resíduo'],
  },
  {
    id: 'E35',
    title: 'Tipo de Resíduo',
    subtitle: 'Partícula Identificada',
    options: ['Pó branco', 'Pigmento', 'Tinta', 'Solvente', 'Cera', 'Pó conservante'],
  },
  {
    id: 'E36',
    title: 'Objeto de Trabalho',
    subtitle: 'Utensílio Profissional',
    options: ['Caneta', 'Tesoura', 'Martelo', 'Régua', 'Agulha', 'Estilete'],
  },
  {
    id: 'E37',
    title: 'Natureza do Vestígio',
    subtitle: 'Classificação Científica',
    options: ['Físico', 'Químico', 'Elétrico', 'Térmico', 'Mental', 'Desconhecido'],
  },
  {
    id: 'E38',
    title: 'Origem do Vestígio',
    subtitle: 'Proveniência',
    options: ['Biblioteca', 'Arquivo', 'Oficina', 'Sala de restauração', 'Corredor', 'Exterior'],
  },
  {
    id: 'E39',
    title: 'Intenção Aparente',
    subtitle: 'Propósito do Autor',
    options: ['Ocultar', 'Manipular', 'Distrair', 'Ferir', 'Ameaçar', 'Acessar'],
  },
  {
    id: 'E40',
    title: 'Grau de Mistério',
    subtitle: 'Clareza Forense',
    options: ['Evidente', 'Discreto', 'Oculto', 'Enganoso', 'Inexplicável', 'Sobrenatural'],
  },
  {
    id: 'E41',
    title: 'Relação com o Crime',
    subtitle: 'Pertinência Probatória',
    options: ['Fundamental', 'Direta', 'Indireta', 'Acidental', 'Secundária', 'Falsa pista'],
  },
  {
    id: 'E42',
    title: 'Quem Poderia Ter Usado',
    subtitle: 'Perfil do Agente',
    options: ['Restaurador', 'Bibliotecário', 'Pesquisador', 'Visitante', 'Funcionário', 'Intruso'],
  },
  {
    id: 'E43',
    title: 'Exige Eletricidade?',
    subtitle: 'Alimentação Energética',
    options: ['Sim', 'Não', 'Possivelmente', 'Equipamento elétrico', 'Fiação', 'Descarga acumulada'],
  },
  {
    id: 'E44',
    title: 'Envolve Líquido?',
    subtitle: 'Presença Fluida',
    options: ['Água', 'Tinta', 'Solvente', 'Cera derretida', 'Outro líquido', 'Nenhum'],
  },
  {
    id: 'E45',
    title: 'Envolve Pó?',
    subtitle: 'Substância Pulverulenta',
    options: ['Pó branco', 'Pó de restauração', 'Pó conservante', 'Pó de cera', 'Resíduo em pó', 'Nenhum'],
  },
  {
    id: 'E46',
    title: 'Envolve Tecido?',
    subtitle: 'Vestígio Têxtil',
    options: ['Corda', 'Fita', 'Pano', 'Saco', 'Tecido da vítima', 'Nenhum'],
  },
  {
    id: 'E47',
    title: 'Envolve Metal?',
    subtitle: 'Composto Metálico',
    options: ['Fio', 'Corrente', 'Martelo', 'Régua', 'Cadeado', 'Estátua'],
  },
  {
    id: 'E48',
    title: 'Envolve Papel?',
    subtitle: 'Suporte Celulósico',
    options: ['Páginas', 'Livro', 'Pergaminho', 'Mapa', 'Tomos', 'Documento'],
  },
  {
    id: 'E49',
    title: 'Objeto Poderia Ser Escondido?',
    subtitle: 'Ocultabilidade',
    options: ['Sim, facilmente', 'Sim, parcialmente', 'Dentro de uma caixa', 'Entre livros', 'Em uma roupa', 'Não'],
  },
  {
    id: 'E50',
    title: 'Objeto Poderia Ser Transportado?',
    subtitle: 'Portabilidade',
    options: ['No bolso', 'Na mão', 'Em uma bolsa', 'Em uma caixa', 'Com dificuldade', 'Não'],
  },
  {
    id: 'E51',
    title: 'Marca de Força',
    subtitle: 'Impressão Mecânica',
    options: ['Pressão', 'Impacto', 'Arrasto', 'Compressão', 'Queda', 'Nenhuma'],
  },
  {
    id: 'E52',
    title: 'Sinal de Calor',
    subtitle: 'Vestígio Térmico',
    options: ['Queimadura', 'Cera derretida', 'Óleo aquecido', 'Papel queimado', 'Metal aquecido', 'Nenhum'],
  },
  {
    id: 'E53',
    title: 'Sinal de Frio',
    subtitle: 'Variação Criogênica',
    options: ['Condensação', 'Gelo', 'Corpo frio', 'Ambiente frio', 'Material endurecido', 'Nenhum'],
  },
  {
    id: 'E54',
    title: 'Sinal de Toxina',
    subtitle: 'Indício Químico',
    options: ['Odor estranho', 'Resíduo', 'Líquido', 'Pó', 'Alteração da vítima', 'Nenhum'],
  },
  {
    id: 'E55',
    title: 'Sinal de Corte',
    subtitle: 'Lesão ou Incisão',
    options: ['Papel', 'Tecido', 'Fio', 'Pele', 'Material de restauração', 'Nenhum'],
  },
  {
    id: 'E56',
    title: 'Sinal de Impacto',
    subtitle: 'Avaria por Choque',
    options: ['Objeto quebrado', 'Marca na superfície', 'Amassado', 'Queda', 'Ferimento', 'Nenhum'],
  },
  {
    id: 'E57',
    title: 'Sinal de Acesso',
    subtitle: 'Mecanismo de Passagem',
    options: ['Chave', 'Cadeado', 'Selo', 'Porta', 'Caixa', 'Compartimento'],
  },
  {
    id: 'E58',
    title: 'Objeto com Valor',
    subtitle: 'Preciosidade',
    options: ['Livro', 'Estátua', 'Busto', 'Mapa', 'Códice', 'Selo'],
  },
  {
    id: 'E59',
    title: 'Objeto Frágil',
    subtitle: 'Suscetibilidade a Dano',
    options: ['Vidro', 'Cerâmica', 'Lente', 'Espelho', 'Pergaminho', 'Estátua'],
  },
  {
    id: 'E60',
    title: 'Evidência Principal',
    subtitle: 'Pilar Conclusivo',
    options: ['Objeto', 'Resíduo', 'Marca', 'Documento', 'Local', 'Comportamento'],
  },
];

// 16 Events from official rules (EV01 to EV16)
export const EVENTS: CardEvent[] = [
  {
    id: 'EV01',
    name: 'Apagão',
    effect: 'Uma evidência é virada e ocultada da mesa por 3 minutos.',
    duration: 180,
    assetKey: 'EV01',
    aliases: ['EV01', 'ev01', 'evento01', 'evento_01', 'apagao', 'apagão'],
  },
  {
    id: 'EV02',
    name: 'Pânico',
    effect: 'Tempo máximo de fala reduzido para 30 segundos por jogador neste turno.',
    duration: 30,
    assetKey: 'EV02',
    aliases: ['EV02', 'ev02', 'evento02', 'evento_02', 'panico', 'pânico'],
  },
  {
    id: 'EV03',
    name: 'Eco',
    effect: 'O Oráculo coloca imediatamente 1 marcador adicional na mesa.',
    assetKey: 'EV03',
    aliases: ['EV03', 'ev03', 'evento03', 'evento_03', 'eco'],
  },
  {
    id: 'EV04',
    name: 'Silêncio Forçado',
    effect: 'Nenhuma acusação pode ser feita durante os próximos 2 minutos.',
    duration: 120,
    assetKey: 'EV04',
    aliases: ['EV04', 'ev04', 'evento04', 'evento_04', 'silencio_forcado', 'silêncio_forçado', 'silencioforcado'],
  },
  {
    id: 'EV05',
    name: 'Testemunha Fantasma',
    effect: 'O Oráculo revela formalmente 1 pista em voz alta no diário.',
    assetKey: 'EV05',
    aliases: ['EV05', 'ev05', 'evento05', 'evento_05', 'testemunha_fantasma', 'testemunhafantasma'],
  },
  {
    id: 'EV06',
    name: 'Chuva Forte',
    effect: 'Uma evidência antiga é descartada da mesa devido à tempestade.',
    assetKey: 'EV06',
    aliases: ['EV06', 'ev06', 'evento06', 'evento_06', 'chuva_forte', 'chuvaforte'],
  },
  {
    id: 'EV07',
    name: 'Névoa',
    effect: 'O Oráculo adiciona 2 marcadores cinzas para indicar incerteza.',
    assetKey: 'EV07',
    aliases: ['EV07', 'ev07', 'evento07', 'evento_07', 'nevoa', 'névoa'],
  },
  {
    id: 'EV08',
    name: 'Tempestade',
    effect: 'O Oráculo é obrigado a usar ao menos um marcador Vermelho de perigo.',
    assetKey: 'EV08',
    aliases: ['EV08', 'ev08', 'evento08', 'evento_08', 'tempestade'],
  },
  {
    id: 'EV09',
    name: 'Acusação Antecipada',
    effect: 'Permite uma acusação rápida sem perder a ficha de voto normal.',
    duration: 300,
    assetKey: 'EV09',
    aliases: ['EV09', 'ev09', 'evento09', 'evento_09', 'acusacao_antecipada', 'acusação_antecipada', 'acusacaoantecipada'],
  },
  {
    id: 'EV10',
    name: 'Dúvida Crescente',
    effect: 'O Assassino move secretamente 1 marcador para outro item.',
    assetKey: 'EV10',
    aliases: ['EV10', 'ev10', 'evento10', 'evento_10', 'duvida_crescente', 'dúvida_crescente', 'duvidacrescente'],
  },
  {
    id: 'EV11',
    name: 'Pressão do Tempo',
    effect: 'O tempo total de discussão desta rodada é encurtado para 4 minutos.',
    duration: 240,
    assetKey: 'EV11',
    aliases: ['EV11', 'ev11', 'evento11', 'evento_11', 'pressao_do_tempo', 'pressão_do_tempo', 'pressaodotempo'],
  },
  {
    id: 'EV12',
    name: 'Confusão',
    effect: 'Todos fecham os olhos por 10s enquanto o Oráculo rearranja 2 marcadores.',
    duration: 10,
    assetKey: 'EV12',
    aliases: ['EV12', 'ev12', 'evento12', 'evento_12', 'confusao', 'confusão'],
  },
  {
    id: 'EV13',
    name: 'Sussurro',
    effect: 'Apenas 1 Investigador pode falar por 1 minuto; os outros ficam mudos.',
    duration: 60,
    assetKey: 'EV13',
    aliases: ['EV13', 'ev13', 'evento13', 'evento_13', 'sussurro'],
  },
  {
    id: 'EV14',
    name: 'Luz Fraca',
    effect: 'Apenas 3 evidências principais permanecem ativas na mesa.',
    assetKey: 'EV14',
    aliases: ['EV14', 'ev14', 'evento14', 'evento_14', 'luz_fraca', 'luzfraca'],
  },
  {
    id: 'EV15',
    name: 'Memória Frágil',
    effect: 'Proibido fazer anotações ou consultar histórico nesta rodada.',
    assetKey: 'EV15',
    aliases: ['EV15', 'ev15', 'evento15', 'evento_15', 'memoria_fragil', 'memória_frágil', 'memoriafragil'],
  },
  {
    id: 'EV16',
    name: 'Revelação Parcial',
    effect: 'O Oráculo aponta secretamente para um suspeito que não é o Assassino.',
    assetKey: 'EV16',
    aliases: ['EV16', 'ev16', 'evento16', 'evento_16', 'revelacao_parcial', 'revelação_parcial', 'revelacaoparcial'],
  },
];

// 12 Abilities from official rules (H01 to H12)
export const ABILITIES: CardAbility[] = [
  {
    id: 'H01',
    name: 'Arquivista',
    effect: 'Olha 1 evidência que foi descartada ou virada na partida.',
    assetKey: 'H01',
    aliases: ['H01', 'h01', 'hab01', 'habilidade01', 'habilidade_01', 'arquivista'],
  },
  {
    id: 'H02',
    name: 'Paleógrafo',
    effect: 'Move 1 marcador de lugar dentro da mesma carta de evidência.',
    assetKey: 'H02',
    aliases: ['H02', 'h02', 'hab02', 'habilidade02', 'habilidade_02', 'paleografo', 'paleógrafo'],
  },
  {
    id: 'H03',
    name: 'Bibliotecário',
    effect: 'Força o sorteio imediato de 1 Evento extra para a rodada.',
    assetKey: 'H03',
    aliases: ['H03', 'h03', 'hab03', 'habilidade03', 'habilidade_03', 'bibliotecario', 'bibliotecário'],
  },
  {
    id: 'H04',
    name: 'Analista',
    effect: 'O Oráculo deve confirmar qual de 2 itens selecionados é mais verdadeiro.',
    assetKey: 'H04',
    aliases: ['H04', 'h04', 'hab04', 'habilidade04', 'habilidade_04', 'analista'],
  },
  {
    id: 'H05',
    name: 'Cético',
    effect: 'Cancela imediatamente o efeito de 1 Evento ativo.',
    assetKey: 'H05',
    aliases: ['H05', 'h05', 'hab05', 'habilidade05', 'habilidade_05', 'cetico', 'cético'],
  },
  {
    id: 'H06',
    name: 'Observador',
    effect: 'Olha secretamente o papel de 1 jogador vizinho na mesa.',
    assetKey: 'H06',
    aliases: ['H06', 'h06', 'hab06', 'habilidade06', 'habilidade_06', 'observador'],
  },
  {
    id: 'H07',
    name: 'Relator',
    effect: 'Faz uma pergunta direta de Sim/Não ao Oráculo sobre um marcador.',
    assetKey: 'H07',
    aliases: ['H07', 'h07', 'hab07', 'habilidade07', 'habilidade_07', 'relator'],
  },
  {
    id: 'H08',
    name: 'Restaurador',
    effect: 'Recupera 1 evidência que havia sido descartada pela tempestade.',
    assetKey: 'H08',
    aliases: ['H08', 'h08', 'hab08', 'habilidade08', 'habilidade_08', 'restaurador'],
  },
  {
    id: 'H09',
    name: 'Guardião',
    effect: 'Protege 1 item da evidência de ter seu marcador movido ou retirado.',
    assetKey: 'H09',
    aliases: ['H09', 'h09', 'hab09', 'habilidade09', 'habilidade_09', 'guardiao', 'guardião'],
  },
  {
    id: 'H10',
    name: 'Intérprete',
    effect: 'Solicita que o Oráculo adicione 1 marcador dourado de pista central.',
    assetKey: 'H10',
    aliases: ['H10', 'h10', 'hab10', 'habilidade10', 'habilidade_10', 'interprete', 'intérprete'],
  },
  {
    id: 'H11',
    name: 'Cronista',
    effect: 'Anota 3 palavras ditas por um jogador para reler durante a acusação.',
    assetKey: 'H11',
    aliases: ['H11', 'h11', 'hab11', 'habilidade11', 'habilidade_11', 'cronista'],
  },
  {
    id: 'H12',
    name: 'Vigilante',
    effect: 'Força 1 jogador suspeito ao silêncio total por 1 minuto.',
    assetKey: 'H12',
    aliases: ['H12', 'h12', 'hab12', 'habilidade12', 'habilidade_12', 'vigilante'],
  },
];

// 42 Illustrated Gothic Characters matching the exact model grid
export { CHARACTERS, getCharacterById } from "./charactersData";

export interface StoryChapter {
  id: number;
  title: string;
  text: string;
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    title: 'CAPÍTULO I: O SILÊNCIO NA CRIPTA',
    text: 'A meia-noite caiu pesada sobre os vitrais quebrados da abadia. O corpo repousa inerte sobre o mármore frio, cercado por um círculo de cinzas e o eco sufocado de passos apressados.',
  },
  {
    id: 2,
    title: 'CAPÍTULO II: O PACTO DE MEIA-NOITE',
    text: 'Duas taças de prata repousavam na mesa de carvalho. Uma continha vinho envelhecido; a outra, um resíduo amargo de cicuta que não deixou chance de socorro à vítima.',
  },
  {
    id: 3,
    title: 'CAPÍTULO III: A PENA E O VENENO',
    text: 'Documentos confidenciais foram espalhados no chão do escritório. A assinatura no contrato de herança ainda estava úmida quando a respiração final cessou.',
  },
  {
    id: 4,
    title: 'CAPÍTULO IV: A SOMBRA NO CLAUSTRO',
    text: 'Um vulto encapuzado foi avistado cruzando o pátio interno sob a chuva torrencial. O relógio da torre soou três badaladas antes do grito abafado.',
  },
  {
    id: 5,
    title: 'CAPÍTULO V: O RITUAL INTERROMPIDO',
    text: 'Círios negros ardiam em suportes de ferro fundido. Um pergaminho rasgado pela metade sugere que o assassino buscava um segredo que não podia ser revelado.',
  },
  {
    id: 6,
    title: 'CAPÍTULO VI: A MARCA DE FERRO',
    text: 'Uma chave de ferro forjado foi encontrada longe da fechadura a que pertencia. Alguém trancou a vítima pelo lado de fora para garantir seu destino fatídico.',
  },
  {
    id: 7,
    title: 'CAPÍTULO VII: O RETRATO MANCHADO',
    text: 'O óleo fresco na tela retratava um nobre ancestral cujo olhar parecia vigiar a cena do crime. Gotas de sangue respingaram na moldura dourada.',
  },
  {
    id: 8,
    title: 'CAPÍTULO VIII: O LABIRINTO DE GELO',
    text: 'No jardim de inverno congelado, pegadas solitárias levavam até o coreto e desapareciam subitamente junto à fonte de pedra.',
  },
  {
    id: 9,
    title: 'CAPÍTULO IX: AS CORRENTES DA TORRE',
    text: 'O mecanismo do sino da torre fora sabotado com uma barra de ferro. Nenhum alarme pôde soar quando a porta do aposento foi arrombada.',
  },
  {
    id: 10,
    title: 'CAPÍTULO X: O FRASCO DE ÂMBAR',
    text: 'Um frasco de vidro escuro rolou para baixo da estante. A etiqueta raspada escondia a composição de um narcótico de ação rápida.',
  },
  {
    id: 11,
    title: 'CAPÍTULO XI: A MÁSCARA DE VELUDO',
    text: 'No baile de máscaras que precedeu o crime, o assassino misturou-se aos convidados sem ser notado, ocultando seu rosto sob uma máscara veneziana carmesim.',
  },
  {
    id: 12,
    title: 'CAPÍTULO XII: O DIÁRIO DAS CINZAS',
    text: 'Páginas arrancadas de um diário foram atiradas à lareira, mas as bordas queimadas ainda guardam pistas cruciais sobre a chantagem em andamento.',
  },
  {
    id: 13,
    title: 'CAPÍTULO XIII: O ESPELHO QUEBRADO',
    text: 'Fragmentos de espelho cobriam o tapete persa. Um golpe desferido pelas costas indica que a vítima não teve oportunidade de ver seu agressor.',
  },
  {
    id: 14,
    title: 'CAPÍTULO XIV: O RELÓGIO PARADO',
    text: 'O relógio de pêndulo parou pontualmente às 23h42, no exato instante em que o mecanismo foi atingido por um impacto violento.',
  },
  {
    id: 15,
    title: 'CAPÍTULO XV: A CÂMARA SECRETA',
    text: 'Atrás da tapeçaria desgastada, uma alavanca oculta abriu passagem para um corredor estreito repleto de pegadas recentes na poeira.',
  },
  {
    id: 16,
    title: 'CAPÍTULO XVI: O CÓDICE SELADO',
    text: 'O grande tomo encadernado em couro humano repousava no púlpito central. O selo de cera vermelha fora violado minutos antes da descoberta do corpo.',
  },
  {
    id: 17,
    title: 'CAPÍTULO XVII: O TESTAMENTO OCULTO',
    text: 'A chuva fustiga as janelas ogivais da abadia enquanto as sombras no piso de mármore revelam detalhes perturbadores. Entre os tomos empoeirados, uma carta rasgada e fragmentos de cera selada indicam que a vítima fora atraída com uma falsa promessa de redenção.',
  },
  {
    id: 18,
    title: 'CAPÍTULO XVIII: A TRAIÇÃO DO CÚMPLICE',
    text: 'Sussurros nos corredores da galeria denunciam a presença de um cúmplice que facilitou a fuga do carrasco pelas catacumbas abandonadas.',
  },
  {
    id: 19,
    title: 'CAPÍTULO XIX: O VÉU DA CONFISSÃO',
    text: 'No confessionário de madeira escura, foi deixado um lenço bordado com as iniciais do culpado, ensanguentado e abandonado às pressas.',
  },
  {
    id: 20,
    title: 'CAPÍTULO XX: O JULGAMENTO DO ORÁCULO',
    text: 'O Oráculo estende as mãos sobre a mesa de evidências. As marcas douradas e rubras alinham-se para revelar a verdade oculta perante todos os presentes.',
  },
];

export interface SecretRoleData {
  id: string;
  role: 'assassino' | 'oraculo' | 'investigador' | 'cumplice' | 'sabotador';
  name: string;
  title: string;
  subtitle: string;
  badgeClass: string;
  accentColor: string;
  description: string;
  objective: string;
  tip: string;
}

export const SECRET_ROLES: SecretRoleData[] = [
  {
    id: 'role_oraculo',
    role: 'oraculo',
    name: 'Oráculo',
    title: 'O ORÁCULO SAGRADO',
    subtitle: 'A testemunha onisciente do crime ancestral',
    badgeClass: 'bg-purple-950/90 border-purple-500 text-purple-100 shadow-purple-900/60',
    accentColor: '#a855f7',
    description: 'Você testemunhou os ecos do crime através do Códice! Você conhece o Assassino, o Método e o Objeto exatos.',
    objective: 'Posicione os marcadores nas tábuas de evidência para guiar os Investigadores até a verdade, sem jamais falar ou gesticular a resposta diretamente.',
    tip: 'Use marcadores de maior precisão nas tábuas que mais delimitam o método e o objeto do crime.',
  },
  {
    id: 'role_assassino',
    role: 'assassino',
    name: 'Assassino',
    title: 'O ASSASSINO',
    subtitle: 'O executor nas sombras da biblioteca',
    badgeClass: 'bg-red-950/90 border-red-500 text-red-100 shadow-red-900/60',
    accentColor: '#ef4444',
    description: 'Você consumou o crime mortal no silêncio dos arquivos ancestrais. Você deve escolher 1 Método e 1 Objeto entre os seus pertences para forjar a cena do crime.',
    objective: 'Mantenha sua identidade em sigilo absoluto. Confunda as deduções e evite ser desmascarado até o final da 3ª Rodada.',
    tip: 'Não tente defender suas cartas de forma óbvia. Aponte pistas de outros jogadores e semeie dúvidas sutis!',
  },
  {
    id: 'role_investigador',
    role: 'investigador',
    name: 'Investigador',
    title: 'O INVESTIGADOR',
    subtitle: 'A mente dedutiva do tribunal da abadia',
    badgeClass: 'bg-blue-950/90 border-blue-500 text-blue-100 shadow-blue-900/60',
    accentColor: '#3b82f6',
    description: 'Você é um perito convocado para desvendar o assassinato ocorrido na biblioteca proibida.',
    objective: 'Examine com atenção os marcadores do Oráculo, cruze os métodos e objetos de cada suspeito e acuse o culpado exato antes do fim das 3 rodadas.',
    tip: 'Analise as 4 cartas de Método e 4 de Objeto de cada jogador na sala e cruze com as pistas do Oráculo.',
  },
  {
    id: 'role_cumplice',
    role: 'cumplice',
    name: 'Cúmplice',
    title: 'O CÚMPLICE',
    subtitle: 'O aliado oculto da conspiração sangrenta',
    badgeClass: 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-emerald-900/60',
    accentColor: '#10b981',
    description: 'Você ajudou a planejar o crime e conhece a identidade do Assassino e o método/objeto escolhidos.',
    objective: 'Proteja o Assassino durante as discussões e acusações. Desvie as pistas e conduza as suspeitas para outros investigadores inocentes.',
    tip: 'Aja como um investigador comum e faça perguntas que induzam os outros a acusarem suspeitos errados.',
  },
  {
    id: 'role_sabotador',
    role: 'sabotador',
    name: 'Sabotador',
    title: 'O SABOTADOR',
    subtitle: 'O agente do caos nas sombras do tribunal',
    badgeClass: 'bg-amber-950/90 border-amber-500 text-amber-100 shadow-amber-900/60',
    accentColor: '#f59e0b',
    description: 'Você opera com segredos próprios. Seus interesses não se alinham com a verdade do tribunal.',
    objective: 'Crie discórdia e caos entre os investigadores para que a verdade permaneça enterrada nos tomos proibidos.',
    tip: 'Proponha teorias conspiratórias convincentes e questione as interpretações dos marcadores do Oráculo.',
  },
];

// ==========================================
// SYSTEMATIC ASSET & IDENTIFIER RESOLVER MAPS
// ==========================================

export const EVENT_MAP: Record<string, CardEvent> = (() => {
  const map: Record<string, CardEvent> = {};
  for (const event of EVENTS) {
    map[event.id] = event;
    map[event.id.toLowerCase()] = event;
    map[event.name.toLowerCase()] = event;
    if (event.aliases) {
      for (const alias of event.aliases) {
        map[alias] = event;
        map[alias.toLowerCase()] = event;
      }
    }
  }
  return map;
})();

export const ABILITY_MAP: Record<string, CardAbility> = (() => {
  const map: Record<string, CardAbility> = {};
  for (const ability of ABILITIES) {
    map[ability.id] = ability;
    map[ability.id.toLowerCase()] = ability;
    map[ability.name.toLowerCase()] = ability;
    if (ability.aliases) {
      for (const alias of ability.aliases) {
        map[alias] = ability;
        map[alias.toLowerCase()] = ability;
      }
    }
  }
  return map;
})();

export function getEventById(idOrName: string): CardEvent | undefined {
  if (!idOrName) return undefined;
  const clean = idOrName.trim();
  return EVENT_MAP[clean] || EVENT_MAP[clean.toLowerCase()];
}

export function getAbilityById(idOrName: string): CardAbility | undefined {
  if (!idOrName) return undefined;
  const clean = idOrName.trim();
  return ABILITY_MAP[clean] || ABILITY_MAP[clean.toLowerCase()];
}

export function getEventAssetAliases(eventIdOrName: string): string[] {
  const event = getEventById(eventIdOrName);
  if (!event) return [eventIdOrName];
  return Array.from(new Set([event.id, event.id.toLowerCase(), event.name.toLowerCase(), ...(event.aliases || [])]));
}

export function getAbilityAssetAliases(abilityIdOrName: string): string[] {
  const ability = getAbilityById(abilityIdOrName);
  if (!ability) return [abilityIdOrName];
  return Array.from(new Set([ability.id, ability.id.toLowerCase(), ability.name.toLowerCase(), ...(ability.aliases || [])]));
}


