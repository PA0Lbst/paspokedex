import { StyleSheet, Text, View } from 'react-native';

// Placeholder: the favorites screen is built in #7.
export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text>My favorites</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
