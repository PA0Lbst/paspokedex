import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, text } from '@/theme';
import { formatPokemonNumber } from '@/utils/format';

// Placeholder: the detail screen is built in #6.
export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text style={text.title}>#{formatPokemonNumber(Number(id))}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.daylight },
});
