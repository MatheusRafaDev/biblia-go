import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  G,
  Path,
  Circle,
  Rect,
  Polygon,
  Line,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
} from 'react-native-svg';

export type CharacterIllustrationId =
  | 'adao'
  | 'sete'
  | 'noe'
  | 'abraao'
  | 'isaque'
  | 'jaco'
  | 'juda'
  | 'moises'
  | 'davi'
  | 'salomao'
  | 'jesus';

interface CharacterIllustrationProps {
  id: string;
  size?: number;
  showBackdrop?: boolean;
}

export function CharacterIllustration({
  id,
  size = 64,
  showBackdrop = true,
}: CharacterIllustrationProps) {
  const normId = id.toLowerCase() as CharacterIllustrationId;

  // Render specific character illustration
  const renderArtwork = () => {
    switch (normId) {
      case 'adao':
        // Adão: Árvore da Vida no Jardim do Éden, Sol da Criação e Folhagens
        return (
          <G>
            {/* Sol da Criação */}
            <Circle cx="64" cy="40" r="24" fill="#FDE047" opacity="0.4" />
            <Circle cx="64" cy="40" r="16" fill="#FACC15" />
            {/* Colinas do Éden */}
            <Path d="M0,105 Q35,80 64,95 T128,100 L128,128 L0,128 Z" fill="#22C55E" />
            <Path d="M0,115 Q45,100 80,112 T128,110 L128,128 L0,128 Z" fill="#15803D" />
            {/* Tronco da Árvore da Vida */}
            <Path d="M60,65 L60,105 Q64,107 68,105 L68,65 Z" fill="#92400E" />
            <Path d="M54,102 Q64,105 74,102" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
            {/* Copa frondosa da Árvore */}
            <Circle cx="64" cy="55" r="24" fill="#16A34A" />
            <Circle cx="48" cy="62" r="16" fill="#22C55E" />
            <Circle cx="80" cy="62" r="16" fill="#4ADE80" />
            <Circle cx="64" cy="45" r="15" fill="#86EFAC" />
            {/* Frutos Dourados da Vida */}
            <Circle cx="56" cy="52" r="3.5" fill="#F59E0B" />
            <Circle cx="72" cy="56" r="3.5" fill="#F59E0B" />
            <Circle cx="64" cy="66" r="3.5" fill="#F59E0B" />
            {/* Folhas caídas / flores */}
            <Circle cx="35" cy="115" r="3" fill="#FDE047" />
            <Circle cx="95" cy="118" r="3" fill="#FDE047" />
          </G>
        );

      case 'sete':
        // Sete: Altar de pedras sagradas, fogo e fumaça de invocação do Senhor
        return (
          <G>
            {/* Brilho divino de oração */}
            <Circle cx="64" cy="55" r="34" fill="#FEF3C7" opacity="0.6" />
            {/* Pedras do Altar */}
            <Rect x="36" y="94" width="56" height="18" rx="4" fill="#78716C" />
            <Rect x="42" y="80" width="44" height="16" rx="3" fill="#A8A29E" />
            <Rect x="48" y="68" width="32" height="14" rx="2" fill="#D6D3D1" />
            {/* Detalhes de fenda nas pedras */}
            <Path d="M55,94 L55,112 M73,94 L73,112" stroke="#57534E" strokeWidth="2" />
            <Path d="M60,80 L60,96" stroke="#57534E" strokeWidth="1.5" />
            {/* Chamas Vivas do Altar (Invocação ao Senhor) */}
            <Path
              d="M64,30 Q74,48 68,66 Q64,68 60,66 Q54,48 64,30 Z"
              fill="#EF4444"
            />
            <Path
              d="M64,38 Q70,50 66,66 Q64,67 62,66 Q58,50 64,38 Z"
              fill="#F97316"
            />
            <Path
              d="M64,48 Q67,55 65,66 Q64,67 63,66 Q61,55 64,48 Z"
              fill="#FDE047"
            />
            {/* Faíscas ascendentes de oração */}
            <Circle cx="54" cy="35" r="2" fill="#F59E0B" />
            <Circle cx="74" cy="38" r="2.5" fill="#F59E0B" />
            <Circle cx="64" cy="22" r="2" fill="#FDE047" />
          </G>
        );

      case 'noe':
        // Noé: A Arca sobre as águas, o Arco-íris da Promessa e a Pomba
        return (
          <G>
            {/* Arco-Íris da Aliança (faixas concêntricas) */}
            <Path d="M20,70 A44,44 0 0,1 108,70" stroke="#EF4444" strokeWidth="3" fill="none" opacity="0.85" />
            <Path d="M24,70 A40,40 0 0,1 104,70" stroke="#F59E0B" strokeWidth="3" fill="none" opacity="0.85" />
            <Path d="M28,70 A36,36 0 0,1 100,70" stroke="#10B981" strokeWidth="3" fill="none" opacity="0.85" />
            <Path d="M32,70 A32,32 0 0,1 96,70" stroke="#3B82F6" strokeWidth="3" fill="none" opacity="0.85" />
            {/* Águas profundas */}
            <Path d="M0,102 Q32,96 64,102 T128,102 L128,128 L0,128 Z" fill="#0284C7" />
            <Path d="M0,112 Q32,106 64,112 T128,112 L128,128 L0,128 Z" fill="#0369A1" />
            {/* Casco da Arca de Madeira */}
            <Path d="M34,86 L94,86 L86,104 L42,104 Z" fill="#78350F" />
            {/* Estrutura superior da Arca */}
            <Rect x="44" y="74" width="40" height="13" rx="2" fill="#92400E" />
            <Polygon points="40,74 64,64 88,74" fill="#B45309" />
            {/* Janela de Noé */}
            <Rect x="60" y="77" width="8" height="6" rx="1" fill="#FEF08A" />
            {/* Pomba da Paz no céu */}
            <Path d="M85,50 Q91,48 95,53 Q91,55 87,54 Q83,50 85,50 Z" fill="#FFFFFF" />
            <Circle cx="87" cy="51" r="1" fill="#0F172A" />
            {/* Ramo de Oliveira verde */}
            <Path d="M93,54 Q97,56 95,58" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" />
          </G>
        );

      case 'abraao':
        // Abraão: O Céu estrelado da promessa ("Conta as estrelas"), tenda e cajado
        return (
          <G>
            {/* Céu Noturno Estrelado de Ur/Canaã */}
            <Rect x="0" y="0" width="128" height="128" fill="#0F172A" opacity="0.25" />
            {/* Constelação de Estrelas da Promessa */}
            <Path d="M64,18 L66,24 L72,26 L66,28 L64,34 L62,28 L56,26 L62,24 Z" fill="#FDE047" />
            <Circle cx="34" cy="28" r="2.5" fill="#FDE047" />
            <Circle cx="94" cy="32" r="2.5" fill="#FDE047" />
            <Circle cx="24" cy="48" r="1.8" fill="#FEF08A" />
            <Circle cx="102" cy="50" r="1.8" fill="#FEF08A" />
            <Circle cx="48" cy="42" r="1.5" fill="#FFFFFF" />
            <Circle cx="82" cy="40" r="1.5" fill="#FFFFFF" />
            <Circle cx="64" cy="48" r="1.5" fill="#FFFFFF" />
            {/* Dunas do Deserto */}
            <Path d="M0,95 Q40,82 80,95 T128,92 L128,128 L0,128 Z" fill="#D97706" />
            <Path d="M0,108 Q50,98 100,108 T128,106 L128,128 L0,128 Z" fill="#B45309" />
            {/* Tenda Patriarcal de Abraão */}
            <Polygon points="40,114 64,82 88,114" fill="#FDE68A" />
            <Polygon points="58,114 64,96 70,114" fill="#78350F" />
            {/* Cajado do Patriarca */}
            <Path
              d="M88,114 L88,76 Q88,70 94,70 Q99,70 99,76"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </G>
        );

      case 'isaque':
        // Isaque: O Cordeiro da Aliança no Monte Moriá e o Poço de Águas Vivas
        return (
          <G>
            {/* Luz do Amanhecer no Monte Moriá */}
            <Circle cx="64" cy="45" r="30" fill="#FDE68A" opacity="0.5" />
            {/* Encosta do Monte Moriá */}
            <Path d="M0,90 Q50,75 128,95 L128,128 L0,128 Z" fill="#CA8A04" />
            <Path d="M0,105 Q60,95 128,105 L128,128 L0,128 Z" fill="#A16207" />
            {/* Poço de Berseba (pedras esculpidas) */}
            <Rect x="46" y="85" width="36" height="24" rx="4" fill="#78716C" />
            <Rect x="44" y="82" width="40" height="6" rx="2" fill="#A8A29E" />
            <Rect x="50" y="88" width="28" height="6" fill="#38BDF8" opacity="0.8" />
            {/* Vigas de madeira do poço */}
            <Path d="M48,82 L48,60 L80,60 L80,82" stroke="#92400E" strokeWidth="2.5" fill="none" />
            <Polygon points="44,60 64,50 84,60" fill="#B45309" />
            {/* Cordeiro Simbólico com Chifres nos arbustos */}
            <Circle cx="96" cy="80" r="10" fill="#FFFFFF" />
            <Circle cx="102" cy="76" r="6" fill="#F8FAFC" />
            <Path d="M102,72 Q108,68 106,75" stroke="#F59E0B" strokeWidth="2" fill="none" />
            <Circle cx="104" cy="76" r="1" fill="#0F172A" />
          </G>
        );

      case 'jaco':
        // Jacó: A Escada de Betel até o Céu, Raios Celestiais e a Pedra de Unção
        return (
          <G>
            {/* Glória celestial abrindo os céus */}
            <Path d="M64,15 L30,120 L98,120 Z" fill="#60A5FA" opacity="0.25" />
            <Circle cx="64" cy="20" r="14" fill="#FDE047" opacity="0.8" />
            {/* Escada de Betel que alcança o Céu */}
            <Path d="M52,22 L44,106" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <Path d="M76,22 L84,106" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            {/* Degraus luminosos da Escada */}
            <Line x1="51" y1="32" x2="77" y2="32" stroke="#FDE047" strokeWidth="2.5" />
            <Line x1="50" y1="46" x2="78" y2="46" stroke="#FDE047" strokeWidth="2.5" />
            <Line x1="48" y1="60" x2="80" y2="60" stroke="#FDE047" strokeWidth="2.5" />
            <Line x1="47" y1="74" x2="81" y2="74" stroke="#FDE047" strokeWidth="2.5" />
            <Line x1="45" y1="88" x2="83" y2="88" stroke="#FDE047" strokeWidth="2.5" />
            {/* Pedra erigida e ungida por Jacó (Betel) */}
            <Rect x="54" y="100" width="20" height="18" rx="3" fill="#A8A29E" />
            <Path d="M54,100 Q64,96 74,100" stroke="#F59E0B" strokeWidth="2" />
            {/* Anjos como feixes de luz ascendentes e descendentes */}
            <Polygon points="64,38 61,44 67,44" fill="#FFFFFF" />
            <Polygon points="64,68 67,62 61,62" fill="#FFFFFF" />
          </G>
        );

      case 'juda':
        // Judá: O Leão da Tribo de Judá e o Cetro Real
        return (
          <G>
            {/* Brasão Dourado de Fundo */}
            <Circle cx="64" cy="64" r="44" fill="#FEF3C7" opacity="0.6" />
            {/* Juba do Leão de Judá */}
            <Circle cx="64" cy="62" r="32" fill="#D97706" />
            <Circle cx="64" cy="62" r="26" fill="#B45309" />
            {/* Rosto do Leão */}
            <Circle cx="64" cy="66" r="18" fill="#F59E0B" />
            {/* Orelhas */}
            <Circle cx="48" cy="46" r="8" fill="#B45309" />
            <Circle cx="48" cy="46" r="4.5" fill="#FEF3C7" />
            <Circle cx="80" cy="46" r="8" fill="#B45309" />
            <Circle cx="80" cy="46" r="4.5" fill="#FEF3C7" />
            {/* Olhos e Focinho do Leão */}
            <Circle cx="56" cy="62" r="2.8" fill="#451A03" />
            <Circle cx="72" cy="62" r="2.8" fill="#451A03" />
            <Polygon points="64,69 59,75 69,75" fill="#451A03" />
            <Path d="M64,75 L64,79 M60,79 Q64,82 68,79" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" />
            {/* Coroa Real do Cetro de Judá */}
            <Path d="M50,38 L54,32 L64,36 L74,32 L78,38 Z" fill="#FDE047" stroke="#B45309" strokeWidth="1.5" />
            <Circle cx="54" cy="32" r="2" fill="#EF4444" />
            <Circle cx="64" cy="35" r="2" fill="#3B82F6" />
            <Circle cx="74" cy="32" r="2" fill="#EF4444" />
            {/* Cetro Real na Base */}
            <Path d="M38,108 L90,108" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            <Circle cx="64" cy="108" r="6" fill="#FDE047" stroke="#B45309" strokeWidth="2" />
          </G>
        );

      case 'moises':
        // Moisés: As Tábuas da Lei no Monte Sinai com Raios de Glória e a Sarça
        return (
          <G>
            {/* Raios de Glória do Sinai */}
            <Path d="M64,20 L35,85 L93,85 Z" fill="#FEF08A" opacity="0.35" />
            {/* Tábuas de Pedra dos Dez Mandamentos */}
            {/* Tábua Esquerda (Mandamentos I a V) */}
            <Path
              d="M40,50 Q48,42 56,50 L56,92 L40,92 Z"
              fill="#E2E8F0"
              stroke="#64748B"
              strokeWidth="2"
            />
            {/* Linhas de Mandamentos Gravadas */}
            <Line x1="44" y1="58" x2="52" y2="58" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <Line x1="44" y1="66" x2="52" y2="66" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <Line x1="44" y1="74" x2="52" y2="74" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <Line x1="44" y1="82" x2="52" y2="82" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

            {/* Tábua Direita (Mandamentos VI a X) */}
            <Path
              d="M72,50 Q80,42 88,50 L88,92 L72,92 Z"
              fill="#F1F5F9"
              stroke="#64748B"
              strokeWidth="2"
            />
            <Line x1="76" y1="58" x2="84" y2="58" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <Line x1="76" y1="66" x2="84" y2="66" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <Line x1="76" y1="74" x2="84" y2="74" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <Line x1="76" y1="82" x2="84" y2="82" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

            {/* Raio de Luz Divina entre as Tábuas */}
            <Line x1="64" y1="36" x2="64" y2="92" stroke="#F59E0B" strokeWidth="2.5" />
            <Circle cx="64" cy="36" r="4" fill="#FDE047" />

            {/* Chamas da Sarça Ardente na base */}
            <Path d="M42,106 Q48,94 54,106 Q64,92 74,106 Q80,94 86,106 Z" fill="#F97316" />
            <Path d="M48,106 Q54,98 60,106 Q64,96 68,106 Q74,98 80,106 Z" fill="#FDE047" />
          </G>
        );

      case 'davi':
        // Davi: A Harpa de Ouro dos Salmos e a Coroa Real de Israel
        return (
          <G>
            {/* Brilho da Coroa e da Harpa */}
            <Circle cx="64" cy="64" r="42" fill="#FEF3C7" opacity="0.6" />
            {/* Coroa Imperial de Davi */}
            <Path
              d="M44,40 L48,28 L56,36 L64,24 L72,36 L80,28 L84,40 Z"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="2"
            />
            {/* Pedras Preciosas da Coroa */}
            <Circle cx="64" cy="27" r="2.5" fill="#3B82F6" />
            <Circle cx="49" cy="30" r="2" fill="#EF4444" />
            <Circle cx="79" cy="30" r="2" fill="#EF4444" />
            <Rect x="44" y="40" width="40" height="5" rx="1.5" fill="#D97706" />

            {/* A Harpa dos Salmos */}
            {/* Corpo de Madeira da Harpa */}
            <Path
              d="M48,54 C48,54 44,70 46,90 C48,106 60,110 70,110 C80,110 82,104 82,104 C82,104 68,104 64,94 C60,84 62,60 76,54 Z"
              fill="#B45309"
            />
            <Path
              d="M50,56 C50,56 46,70 48,90 C50,102 60,106 68,106"
              stroke="#F59E0B"
              strokeWidth="3"
              fill="none"
            />
            {/* Cordas Douradas da Harpa de Louvor */}
            <Line x1="56" y1="60" x2="56" y2="100" stroke="#FDE047" strokeWidth="1.5" />
            <Line x1="61" y1="62" x2="61" y2="98" stroke="#FDE047" strokeWidth="1.5" />
            <Line x1="66" y1="64" x2="66" y2="96" stroke="#FDE047" strokeWidth="1.5" />
            <Line x1="71" y1="66" x2="71" y2="92" stroke="#FDE047" strokeWidth="1.5" />
          </G>
        );

      case 'salomao':
        // Salomão: O Templo Monumental de Jerusalém e as Colunas de Bronze (Jaquim e Boaz)
        return (
          <G>
            {/* Aura Dourada da Sabedoria e da Glória do Templo */}
            <Circle cx="64" cy="64" r="42" fill="#EDE9FE" opacity="0.7" />
            {/* Escadaria Sagrada do Templo */}
            <Rect x="26" y="104" width="76" height="6" rx="2" fill="#CBD5E1" />
            <Rect x="32" y="98" width="64" height="6" rx="1.5" fill="#E2E8F0" />
            <Rect x="38" y="92" width="52" height="6" rx="1" fill="#F8FAFC" />

            {/* Fachada do Templo de Jerusalém */}
            <Rect x="42" y="52" width="44" height="40" fill="#F59E0B" />
            {/* Frontão Triangular Superior */}
            <Polygon points="38,52 64,32 90,52" fill="#D97706" />
            <Polygon points="44,52 64,36 84,52" fill="#FDE047" />

            {/* Portal Nobre de Entrada */}
            <Path d="M56,92 L56,66 Q64,60 72,66 L72,92 Z" fill="#78350F" />
            <Path d="M58,92 L58,68 Q64,63 70,68 L70,92 Z" fill="#451A03" />

            {/* Duas Colunas Imponentes de Bronze: Jaquim e Boaz */}
            {/* Coluna Esquerda (Jaquim) */}
            <Rect x="30" y="46" width="8" height="52" rx="2" fill="#B45309" />
            <Rect x="28" y="42" width="12" height="6" rx="2" fill="#F59E0B" />
            {/* Coluna Direita (Boaz) */}
            <Rect x="90" y="46" width="8" height="52" rx="2" fill="#B45309" />
            <Rect x="88" y="42" width="12" height="6" rx="2" fill="#F59E0B" />
          </G>
        );

      case 'jesus':
      default:
        // Jesus Cristo: A Cruz Gloriosa de Redenção, a Auréola Divina e Alfa/Ômega
        return (
          <G>
            {/* Auréola de Glória Celestial com Raios Dourados */}
            <Circle cx="64" cy="54" r="38" fill="#3B82F6" opacity="0.25" />
            <Circle cx="64" cy="54" r="28" fill="#FDE047" opacity="0.35" />
            {/* Raios da Luz do Mundo */}
            <Line x1="64" y1="12" x2="64" y2="22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <Line x1="64" y1="86" x2="64" y2="96" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <Line x1="22" y1="54" x2="32" y2="54" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <Line x1="96" y1="54" x2="106" y2="54" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            <Line x1="34" y1="24" x2="42" y2="32" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="94" y1="24" x2="86" y2="32" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="34" y1="84" x2="42" y2="76" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <Line x1="94" y1="84" x2="86" y2="76" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

            {/* A Santa Cruz Redentora */}
            {/* Haste Vertical */}
            <Rect x="58" y="24" width="12" height="78" rx="3" fill="#3B6EF5" />
            <Rect x="60" y="26" width="8" height="74" rx="2" fill="#60A5FA" />
            {/* Haste Horizontal */}
            <Rect x="32" y="44" width="64" height="12" rx="3" fill="#3B6EF5" />
            <Rect x="34" y="46" width="60" height="8" rx="2" fill="#60A5FA" />

            {/* Centro Resplandecente com Estrela de Ouro */}
            <Circle cx="64" cy="50" r="10" fill="#F59E0B" />
            <Circle cx="64" cy="50" r="6" fill="#FDE047" />

            {/* Coroa Real do Rei dos Reis */}
            <Path d="M52,24 L56,16 L64,20 L72,16 L76,24 Z" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
            <Circle cx="64" cy="18" r="1.5" fill="#EF4444" />

            {/* Símbolos Gregos: Alfa (A) e Ômega (Ω) nas extremidades */}
            {/* Alfa no canto esquerdo */}
            <Path d="M26,82 L30,72 L34,82 M27,78 L33,78" stroke="#3B6EF5" strokeWidth="2" strokeLinecap="round" />
            {/* Ômega no canto direito */}
            <Path d="M94,82 L97,82 Q96,72 102,72 Q108,72 107,82 L110,82" stroke="#3B6EF5" strokeWidth="2" strokeLinecap="round" fill="none" />
          </G>
        );
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 128 128">
        <Defs>
          <ClipPath id={`clip-${normId}`}>
            <Circle cx="64" cy="64" r="60" />
          </ClipPath>
          <LinearGradient id={`bgGrad-${normId}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.4" />
          </LinearGradient>
        </Defs>

        {showBackdrop && (
          <G>
            <Circle
              cx="64"
              cy="64"
              r="62"
              fill={`url(#bgGrad-${normId})`}
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          </G>
        )}

        <G clipPath={showBackdrop ? `url(#clip-${normId})` : undefined}>
          {renderArtwork()}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
