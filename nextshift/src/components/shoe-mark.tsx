import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

type ShoeMarkProps = {
  width?: number;
  height?: number;
};

export function ShoeMark({ width = 168, height = 118 }: ShoeMarkProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 140">
      <Path d="M8 78 C28 70, 48 64, 70 68" stroke={colors.mutedBlue} strokeWidth="3" fill="none" />
      <Path d="M6 90 C30 82, 52 76, 76 80" stroke={colors.mutedBlue} strokeWidth="2.4" fill="none" />
      <Path d="M10 102 C32 94, 54 90, 80 94" stroke={colors.mutedBlue} strokeWidth="2" fill="none" />
      <Path
        d="M58 86 C72 52, 118 38, 158 48 C176 54, 186 68, 178 86 C168 108, 120 118, 84 112 C68 108, 54 98, 58 86 Z"
        fill={colors.mutedBlue}
      />
      <Path
        d="M70 84 C82 58, 122 48, 154 56 C168 60, 174 72, 166 86 C156 102, 118 108, 88 102 C76 98, 66 92, 70 84 Z"
        fill={colors.cream}
      />
      <Path d="M92 64 C110 58, 132 60, 150 68" stroke={colors.brown} strokeWidth="2" fill="none" />
      <Path d="M90 74 C112 68, 134 70, 152 78" stroke={colors.brown} strokeWidth="2" fill="none" />
      <Path d="M88 84 C108 78, 130 80, 148 88" stroke={colors.brown} strokeWidth="2" fill="none" />
      <Ellipse cx="168" cy="86" rx="16" ry="22" fill={colors.brown} />
      <Path d="M154 74 C172 70, 184 78, 178 94 C174 104, 160 108, 152 98 Z" fill={colors.blue} />
      <Circle cx="164" cy="82" r="3.2" fill={colors.cream} />
    </Svg>
  );
}
