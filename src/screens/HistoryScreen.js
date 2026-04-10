import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import TransactionItem from '../components/TransactionItem';

// ─── Tâche 4 : Fonction utilitaire pour parser les dates DD/MM/YYYY ─────────
function parseDateDDMMYYYY(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return new Date(0);
  const day   = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year  = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

const FILTER_OPTIONS = [
  { key: 'all',              label: 'Tout' },
  { key: 'credit',           label: 'Crédits' },
  { key: 'debit',            label: 'Débits' },
  { key: 'virement_entrant', label: 'Reçus' },
  { key: 'virement_sortant', label: 'Émis' },
];

export default function HistoryScreen({ accounts }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const [filter, setFilter] = useState('all');

  // Agréger toutes les transactions
  const allTransactions = accounts
    .flatMap(acc =>
      acc.transactions.map(tx => ({
        ...tx,
        accountLabel: acc.label,
        uniqueKey: acc.id + '-' + tx.id,
      }))
    )
    // Tâche 4 : Tri chronologique décroissant
    .sort((a, b) => {
      const dateA = parseDateDDMMYYYY(a.date);
      const dateB = parseDateDDMMYYYY(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  // Filtrage
  const filteredTransactions = filter === 'all'
    ? allTransactions
    : allTransactions.filter(tx => tx.type === filter);

  // Stats
  const totalCredit = allTransactions
    .filter(tx => tx.type === 'credit' || tx.type === 'virement_entrant')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalDebit = allTransactions
    .filter(tx => tx.type === 'debit' || tx.type === 'virement_sortant')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ─── Stats banner ──────────────────────────────────────────────────── */}
      <View style={[styles.statsBanner, {
        backgroundColor: colors.isDark ? colors.card : colors.primary,
      }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statIcon]}>↑</Text>
            <Text style={[styles.statAmount, { color: '#4CAF50' }]}>
              +{totalCredit.toLocaleString('fr-FR')} MAD
            </Text>
            <Text style={[styles.statLabel, { color: colors.bannerMuted }]}>Total crédits</Text>
          </View>
          <View style={[styles.statDivider, {
            backgroundColor: colors.isDark ? colors.border : 'rgba(255,255,255,0.2)',
          }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statIcon]}>↓</Text>
            <Text style={[styles.statAmount, { color: '#EF5350' }]}>
              -{totalDebit.toLocaleString('fr-FR')} MAD
            </Text>
            <Text style={[styles.statLabel, { color: colors.bannerMuted }]}>Total débits</Text>
          </View>
        </View>

        <View style={[styles.totalBar, {
          backgroundColor: colors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
        }]}>
          <Text style={[styles.totalBarText, { color: colors.bannerText }]}>
            📊 {allTransactions.length} opérations au total
          </Text>
        </View>
      </View>

      {/* ─── Filtres ─────────────────────────────────────────────────────────── */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.filterPill, {
              backgroundColor: filter === opt.key
                ? colors.primary
                : (colors.isDark ? colors.cardElevated : colors.card),
              borderColor: filter === opt.key ? colors.primary : colors.border,
            }]}
            onPress={() => setFilter(opt.key)}
          >
            <Text style={[styles.filterText, {
              color: filter === opt.key ? '#fff' : colors.textLight,
            }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Liste ───────────────────────────────────────────────────────────── */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.uniqueKey}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            showAccount={true}
            accountLabel={item.accountLabel}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.empty, { color: colors.textLight }]}>
              {filter === 'all'
                ? 'Aucune opération dans l\'historique.'
                : 'Aucune opération de ce type.'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // ─── Stats ────────────────────────────────────────────────────────────────
  statsBanner: {
    padding: 16,
    paddingTop: 8,
  },
  statsRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
  },
  statItem: {
    flex:       1,
    alignItems: 'center',
    padding:    8,
  },
  statIcon: {
    fontSize: 16,
    color:    '#fff',
    marginBottom: 2,
  },
  statAmount: {
    fontSize:   16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width:  1,
    height: 40,
  },
  totalBar: {
    borderRadius:   10,
    paddingVertical: 8,
    alignItems:     'center',
    marginTop:      10,
  },
  totalBarText: {
    fontSize:   12,
    fontWeight: '600',
  },
  // ─── Filters ──────────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical:   10,
    gap:            6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderRadius:      20,
    borderWidth:       1,
  },
  filterText: {
    fontSize:   11,
    fontWeight: '700',
  },
  // ─── Empty ────────────────────────────────────────────────────────────────
  emptyContainer: {
    padding:    40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize:     40,
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    fontSize:  14,
  },
});
