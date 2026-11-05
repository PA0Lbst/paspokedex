import { StyleSheet, Text, View } from 'react-native';

import { colors, text } from '@/theme';

// Placeholder: the favorites screen is built in #7.
export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={text.title}>My favorites</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.daylight },
});
