import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  card: '#FFFFFF',
  label: '#6E6A8A',
  value: '#1E1B2E',
  sub: '#8A86A8',
  iconBg: '#ECEAFF',
  icon: '#5B4FE9',
  border: '#EDEBFA',
};

export default function PreferenceCard({ icon, label, value, sub }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.icon} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    shadowColor: '#2A2550',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  texts: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.label,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.value,
  },
  sub: {
    fontSize: 12,
    color: colors.sub,
    marginTop: 2,
  },
});
