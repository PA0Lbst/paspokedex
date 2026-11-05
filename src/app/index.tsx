import { StyleSheet, Text, View } from 'react-native';

// Placeholder: the Pokémon list is built in #4.
export default function PokemonListScreen() {
  return (
    <View style={styles.container}>
      <Text>All Pokémon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
