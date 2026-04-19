import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { ArrowLeft } from '@tamagui/lucide-icons';

export const stackNavDefaultBackButton = (overrideCallback?: () => void, overridePadding?: number) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={{
        padding: overridePadding ?? 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={overrideCallback ?? (() => router.back())}
    >
      <ArrowLeft size={22} self={'center'} justify="center" items='center' />
    </TouchableOpacity>
  );
};