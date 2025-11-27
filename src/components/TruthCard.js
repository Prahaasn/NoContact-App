import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

const TruthCard = ({ truth, style }) => {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.text}>{truth.text}</Text>
      {truth.category && (
        <Text style={styles.category}>{truth.category}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  text: {
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '500',
  },
  category: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 20,
  },
});

export default TruthCard;
