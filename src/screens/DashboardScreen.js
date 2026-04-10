import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import AccountCard from '../components/AccountCard';

export default function DashboardScreen({ navigation, accounts, onReset }) {
  const { colors, isDark, toggleTheme } = useTheme();

  // Calcul du solde total
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Stats rapides
  const totalTransactions = accounts.reduce((sum, acc) => sum + acc.transactions.length, 0);
  const avgBalance = totalBalance / accounts.length;

  // ─── Tâche 5 (Bonus) : Réinitialisation ─────────────────────────────────────
  const handleReset = () => {
    Alert.alert(
      '🔄 Réinitialiser les comptes',
      'Êtes-vous sûr de vouloir réinitialiser tous les comptes à leur état initial ?\n\nToutes les opérations effectuées seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => {
            onReset();
            Alert.alert('✅ Réinitialisé', 'Tous les comptes ont été remis à leur état initial.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Bandeau principal */}
      <View style={[styles.banner, { backgroundColor: colors.isDark ? colors.card : colors.primary, paddingTop: 30 }]}>
        {/* Solde total */}
        <Text style={[styles.totalLabel, { color: colors.bannerSubtext }]}>
          Patrimoine Total
        </Text>
        <Text style={[styles.totalAmount, { color: colors.bannerText }]}>
          {totalBalance.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
          })} MAD
        </Text>

        {/* Mini stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statPill, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)',
          }]}>
            <Text style={[styles.statValue, { color: colors.bannerText }]}>{accounts.length}</Text>
            <Text style={[styles.statLabel, { color: colors.bannerMuted }]}>Comptes</Text>
          </View>
          <View style={[styles.statPill, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)',
          }]}>
            <Text style={[styles.statValue, { color: colors.bannerText }]}>{totalTransactions}</Text>
            <Text style={[styles.statLabel, { color: colors.bannerMuted }]}>Opérations</Text>
          </View>
          <View style={[styles.statPill, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.18)',
          }]}>
            <Text style={[styles.statValue, { color: colors.bannerText }]}>
              {(avgBalance / 1000).toFixed(1)}K
            </Text>
            <Text style={[styles.statLabel, { color: colors.bannerMuted }]}>Moy.</Text>
          </View>
        </View>
      </View>

      {/* Liste des comptes */}
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AccountCard
            account={item}
            onPress={() =>
              navigation.navigate('AccountDetail', { accountId: item.id })
            }
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.sectionTitle, { color: colors.textLight }]}>
            Sélectionnez un compte
          </Text>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {/* Bouton Réinitialiser - Tâche 5 */}
            <TouchableOpacity
              style={[styles.resetBtn, {
                backgroundColor: colors.card,
                borderColor: colors.danger,
              }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetBtnText, { color: colors.danger }]}>
                🔄 Réinitialiser les comptes
              </Text>
            </TouchableOpacity>

            {/* Version */}
            <Text style={[styles.version, { color: colors.textMuted }]}>
              BankaApp v1.0 — TP React Native
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // ─── Banner ───────────────────────────────────────────────────────────────
  banner: {
    paddingBottom:   24,
    paddingHorizontal: 20,
    borderBottomLeftRadius:  24,
    borderBottomRightRadius: 24,
  },
  totalLabel: {
    fontSize:    12,
    textAlign:   'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize:   36,
    fontWeight: '800',
    textAlign:  'center',
    marginVertical: 4,
    letterSpacing: -1,
  },
  // ─── Stats ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    gap:            10,
    marginTop:      12,
  },
  statPill: {
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderRadius:      12,
    alignItems:        'center',
    minWidth:          80,
  },
  statValue: {
    fontSize:   16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // ─── List ─────────────────────────────────────────────────────────────────
  list: { paddingBottom: 24 },
  sectionTitle: {
    fontSize:          12,
    paddingHorizontal: 20,
    paddingVertical:   14,
    textTransform:     'uppercase',
    letterSpacing:     1,
    fontWeight:        '600',
  },
  // ─── Footer ───────────────────────────────────────────────────────────────
  footerContainer: {
    paddingHorizontal: 16,
    paddingTop:        8,
    paddingBottom:     16,
  },
  resetBtn: {
    paddingVertical: 14,
    borderRadius:    12,
    borderWidth:     1.5,
    alignItems:      'center',
    marginBottom:    12,
  },
  resetBtnText: {
    fontWeight: '700',
    fontSize:   14,
  },
  version: {
    fontSize:  11,
    textAlign: 'center',
  },
});
