import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const TYPE_CONFIG = {
  credit:            { label: 'Crédit',           sign: '+', icon: '↑',  colorKey: 'success' },
  debit:             { label: 'Débit',             sign: '-', icon: '↓',  colorKey: 'danger'  },
  virement_entrant:  { label: 'Virement reçu',    sign: '+', icon: '↗', colorKey: 'success' },
  virement_sortant:  { label: 'Virement émis',    sign: '-', icon: '↙', colorKey: 'danger'  },
};

export default function TransactionItem({ transaction, showAccount, accountLabel }) {
  const { colors } = useTheme();
  const config = TYPE_CONFIG[transaction.type] || TYPE_CONFIG.credit;
  const color  = colors[config.colorKey];

  return (
    <View style={[styles.row, {
      backgroundColor:   colors.card,
      borderBottomColor:  colors.border,
    }]}>
      {/* Indicateur de type */}
      <View style={[styles.iconBox, {
        backgroundColor: color + (colors.isDark ? '25' : '15'),
      }]}>
        <Text style={[styles.icon, { color }]}>{config.icon}</Text>
      </View>

      {/* Infos */}
      <View style={styles.info}>
        <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
          {transaction.label}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.typePill, { backgroundColor: color + '18' }]}>
            <Text style={[styles.typeText, { color }]}>{config.label}</Text>
          </View>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {transaction.date}
          </Text>
        </View>
        {showAccount && accountLabel && (
          <Text style={[styles.accountName, { color: colors.textLight }]}>
            📁 {accountLabel}
          </Text>
        )}
      </View>

      {/* Montant */}
      <Text style={[styles.amount, { color }]}>
        {config.sign}{transaction.amount.toLocaleString('fr-FR')} MAD
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconBox: {
    width:          42,
    height:         42,
    borderRadius:   12,
    justifyContent: 'center',
    alignItems:     'center',
    marginRight:    12,
  },
  icon: {
    fontSize:   18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize:   14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginTop:     4,
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      4,
  },
  typeText: {
    fontSize:   10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 11,
  },
  accountName: {
    fontSize:  11,
    marginTop: 3,
  },
  amount: {
    fontSize:   14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
