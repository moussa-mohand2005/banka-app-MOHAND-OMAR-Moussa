import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import TransactionItem from '../components/TransactionItem';

export default function AccountDetailScreen({ route, navigation, accounts, onDebit, onCredit }) {
  const { colors } = useTheme();
  const { accountId } = route.params;

  // Récupérer le compte depuis la prop accounts (pour refléter l'état mis à jour)
  const account = accounts.find(a => a.id === accountId);

  const [amount, setAmount]   = useState('');
  const [label,  setLabel]    = useState('');
  const [mode,   setMode]     = useState(null); // 'debit' | 'credit' | null

  if (!account) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textLight, fontSize: 16 }}>Compte introuvable.</Text>
      </View>
    );
  }

  // ─── Tâche 3 : Indicateurs UX ─────────────────────────────────────────────
  const isLowBalance  = account.balance < 1000;
  const isZeroBalance = account.balance === 0;

  const handleOperation = () => {
    const numAmount = parseFloat(amount);

    // Validations
    if (!label.trim()) {
      Alert.alert('⚠️ Champ manquant', 'Veuillez saisir un libellé.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('⚠️ Montant invalide', 'Veuillez saisir un montant positif.');
      return;
    }
    if (mode === 'debit' && numAmount > account.balance) {
      Alert.alert(
        '❌ Solde insuffisant',
        `Votre solde est de ${account.balance.toLocaleString('fr-FR')} MAD.\nOpération rejetée.`
      );
      return;
    }

    // ─── Tâche 3 : Messages de confirmation différents ──────────────────────
    const confirmTitle = mode === 'debit'
      ? '⚠️ Confirmer le Débit'
      : '✅ Confirmer le Crédit';

    const confirmMessage = mode === 'debit'
      ? `Vous allez débiter ${numAmount.toLocaleString('fr-FR')} MAD.\n\nLibellé : "${label}"\nNouveau solde : ${(account.balance - numAmount).toLocaleString('fr-FR')} MAD`
      : `Vous allez créditer ${numAmount.toLocaleString('fr-FR')} MAD.\n\nLibellé : "${label}"\nNouveau solde : ${(account.balance + numAmount).toLocaleString('fr-FR')} MAD`;

    Alert.alert(
      confirmTitle,
      confirmMessage,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            if (mode === 'debit') onDebit(accountId, numAmount, label);
            else                  onCredit(accountId, numAmount, label);
            setAmount('');
            setLabel('');
            setMode(null);
            Alert.alert(
              mode === 'debit' ? '✅ Débit effectué' : '✅ Crédit effectué',
              `${numAmount.toLocaleString('fr-FR')} MAD — "${label}"`
            );
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={account.transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* ─── Bandeau solde ─────────────────────────────────────────────── */}
            <View style={[styles.balanceBanner, {
              backgroundColor: colors.isDark ? colors.card : colors.primary,
            }]}>
              <Text style={[styles.accountType, { color: colors.bannerSubtext }]}>
                {account.type === 'courant' ? '💳' : account.type === 'epargne' ? '🏦' : '💼'}{' '}
                {account.label}
              </Text>
              <Text style={[styles.balance, {
                color: isLowBalance
                  ? (colors.isDark ? colors.warning : '#FFD54F')
                  : colors.bannerText,
              }]}>
                {account.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </Text>

              {/* Tâche 3 : Indicateur visuel solde faible */}
              {isLowBalance && (
                <View style={styles.lowBalanceBadge}>
                  <Text style={styles.lowBalanceText}>
                    ⚠️ {isZeroBalance ? 'Compte à zéro' : 'Solde inférieur à 1 000 MAD'}
                  </Text>
                </View>
              )}

              <Text style={[styles.ibanSmall, { color: colors.bannerMuted }]}>
                {account.iban}
              </Text>
            </View>

            {/* ─── Boutons d'action ──────────────────────────────────────────── */}
            <View style={styles.actionsRow}>
              {/* Tâche 3 : Désactivation du bouton Débit si solde = 0 */}
              <TouchableOpacity
                style={[styles.actionBtn, {
                  backgroundColor: isZeroBalance
                    ? colors.textMuted
                    : colors.danger,
                  opacity: isZeroBalance ? 0.5 : 1,
                }]}
                onPress={() => {
                  if (isZeroBalance) {
                    Alert.alert('❌ Impossible', 'Votre solde est à 0 MAD. Aucun débit possible.');
                    return;
                  }
                  setMode(mode === 'debit' ? null : 'debit');
                }}
                disabled={isZeroBalance}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>↓</Text>
                <Text style={styles.actionBtnText}>Débit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.success }]}
                onPress={() => setMode(mode === 'credit' ? null : 'credit')}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>↑</Text>
                <Text style={styles.actionBtnText}>Crédit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Transfer', { fromAccountId: accountId })}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>↗</Text>
                <Text style={styles.actionBtnText}>Virement</Text>
              </TouchableOpacity>
            </View>

            {/* ─── Formulaire inline débit/crédit ────────────────────────────── */}
            {mode && (
              <View style={[styles.form, {
                backgroundColor: colors.card,
                shadowColor: colors.shadow,
                borderLeftColor: mode === 'debit' ? colors.danger : colors.success,
              }]}>
                <Text style={[styles.formTitle, { color: colors.text }]}>
                  {mode === 'debit' ? '↓ Nouveau Débit' : '↑ Nouveau Crédit'}
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textLight }]}>Libellé</Text>
                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  }]}
                  placeholder="Libellé de l'opération"
                  value={label}
                  onChangeText={setLabel}
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.inputLabel, { color: colors.textLight }]}>Montant</Text>
                <TextInput
                  style={[styles.input, {
                    borderColor: colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  }]}
                  placeholder="0.00 MAD"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textMuted}
                />

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: colors.border }]}
                    onPress={() => { setMode(null); setAmount(''); setLabel(''); }}
                  >
                    <Text style={[styles.cancelBtnText, { color: colors.textLight }]}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      { backgroundColor: mode === 'debit' ? colors.danger : colors.success }
                    ]}
                    onPress={handleOperation}
                  >
                    <Text style={styles.submitBtnText}>✓ Valider</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text style={[styles.historyTitle, { color: colors.textLight }]}>
              Historique des opérations
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyIcon]}>📭</Text>
            <Text style={[styles.empty, { color: colors.textLight }]}>
              Aucune opération enregistrée
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  // ─── Banner ───────────────────────────────────────────────────────────────
  balanceBanner: {
    padding:    24,
    alignItems: 'center',
    borderBottomLeftRadius:  20,
    borderBottomRightRadius: 20,
  },
  accountType: {
    fontSize: 13,
  },
  balance: {
    fontSize:   36,
    fontWeight: '800',
    marginTop:  4,
    letterSpacing: -1,
  },
  lowBalanceBadge: {
    marginTop:         10,
    backgroundColor:   'rgba(255,200,50,0.18)',
    paddingHorizontal: 14,
    paddingVertical:   6,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       'rgba(255,200,50,0.4)',
  },
  lowBalanceText: {
    color:      '#FFD54F',
    fontSize:   12,
    fontWeight: '600',
  },
  ibanSmall: {
    fontSize:    10,
    marginTop:   8,
    fontFamily:  'monospace',
    letterSpacing: 0.5,
  },
  // ─── Actions ──────────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    padding:        16,
    gap:            8,
  },
  actionBtn: {
    flex:           1,
    paddingVertical: 14,
    borderRadius:   12,
    alignItems:     'center',
  },
  actionIcon: {
    color:    '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  actionBtnText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   12,
    marginTop:  2,
  },
  // ─── Form ─────────────────────────────────────────────────────────────────
  form: {
    margin:       16,
    borderRadius: 14,
    padding:      18,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius:  6,
    elevation:     4,
    borderLeftWidth: 4,
  },
  formTitle: {
    fontSize:     16,
    fontWeight:   '700',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize:     11,
    fontWeight:   '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    borderWidth:       1,
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   12,
    fontSize:          14,
    marginBottom:      12,
  },
  formActions: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     4,
  },
  cancelBtn: {
    flex:           1,
    borderRadius:   10,
    paddingVertical: 12,
    alignItems:     'center',
    borderWidth:    1,
  },
  cancelBtnText: {
    fontWeight: '600',
    fontSize:   14,
  },
  submitBtn: {
    flex:           2,
    borderRadius:   10,
    paddingVertical: 12,
    alignItems:     'center',
  },
  submitBtnText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   15,
  },
  historyTitle: {
    fontSize:          12,
    paddingHorizontal: 20,
    paddingVertical:   14,
    textTransform:     'uppercase',
    letterSpacing:     1,
    fontWeight:        '600',
  },
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
