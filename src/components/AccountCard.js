import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Icône selon le type de compte
const TYPE_ICONS = {
  courant:       '💳',
  epargne:       '🏦',
  professionnel: '💼',
};

const TYPE_LABELS = {
  courant:       'Courant',
  epargne:       'Épargne',
  professionnel: 'Professionnel',
};

export default function AccountCard({ account, onPress }) {
  const { colors } = useTheme();
  const isPositive = account.balance > 0;
  const isLow      = account.balance < 1000 && account.balance > 0;

  return (
    <TouchableOpacity
      style={[styles.card, {
        backgroundColor: colors.card,
        shadowColor:      colors.shadow,
        borderLeftColor:  isLow ? colors.warning : colors.primary,
      }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* En-tête : icône + label + badge type */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, {
          backgroundColor: colors.isDark ? colors.primaryDark + '60' : colors.primary + '12',
        }]}>
          <Text style={styles.icon}>{TYPE_ICONS[account.type] || '🏦'}</Text>
        </View>
        <View style={styles.headerText}>
          <View style={styles.titleRow}>
            <Text style={[styles.label, { color: colors.text }]}>{account.label}</Text>
            <View style={[styles.typeBadge, {
              backgroundColor: colors.isDark ? colors.primaryDark + '80' : colors.primary + '15',
            }]}>
              <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
                {TYPE_LABELS[account.type] || account.type}
              </Text>
            </View>
          </View>
          <Text style={[styles.iban, { color: colors.textMuted }]}>{account.iban}</Text>
          <Text style={[styles.owner, { color: colors.textLight }]}>👤 {account.owner}</Text>
        </View>
      </View>

      {/* Séparateur */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Solde */}
      <View style={styles.balanceRow}>
        <Text style={[styles.balanceLabel, { color: colors.textLight }]}>Solde disponible</Text>
        <View style={styles.balanceContainer}>
          {isLow && <Text style={styles.warningIcon}>⚠️</Text>}
          <Text style={[
            styles.balance,
            { color: isPositive ? (isLow ? colors.warning : colors.success) : colors.danger }
          ]}>
            {account.balance.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} MAD
          </Text>
        </View>
      </View>

      {/* Footer : nombre de transactions + chevron */}
      <View style={styles.footer}>
        <Text style={[styles.txCount, { color: colors.textMuted }]}>
          📊 {account.transactions.length} opération(s)
        </Text>
        <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius:    16,
    padding:         18,
    marginHorizontal:16,
    marginVertical:  6,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.10,
    shadowRadius:    8,
    elevation:       5,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    marginBottom:   14,
  },
  iconCircle: {
    width:          46,
    height:         46,
    borderRadius:   23,
    justifyContent: 'center',
    alignItems:     'center',
    marginRight:    12,
  },
  icon: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  label: {
    fontSize:   16,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      6,
  },
  typeBadgeText: {
    fontSize:   10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iban: {
    fontSize: 10,
    marginTop: 3,
    fontFamily: 'monospace',
    letterSpacing: 0.3,
  },
  owner: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height:       1,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  balanceLabel: {
    fontSize: 12,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  warningIcon: {
    fontSize: 14,
  },
  balance: {
    fontSize:   20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginTop:      12,
  },
  txCount: {
    fontSize: 11,
  },
  chevron: {
    fontSize:   22,
    fontWeight: '300',
  },
});
