import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function TransferScreen({ route, navigation, accounts, onTransfer }) {
  const { colors } = useTheme();
  const { fromAccountId } = route.params;

  // Compte source pré-sélectionné
  const sourceAccount = accounts.find(a => a.id === fromAccountId);
  const otherAccounts = accounts.filter(a => a.id !== fromAccountId);

  const [selectedToId, setSelectedToId] = useState(null);
  const [amount, setAmount]             = useState('');
  const [label, setLabel]               = useState('');

  if (!sourceAccount) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textLight }}>Compte source introuvable.</Text>
      </View>
    );
  }

  const handleValidate = () => {
    const numAmount = parseFloat(amount);

    if (!selectedToId) {
      Alert.alert('⚠️ Compte manquant', 'Veuillez sélectionner un compte destinataire.');
      return;
    }
    if (!label.trim()) {
      Alert.alert('⚠️ Champ manquant', 'Veuillez saisir un libellé pour le virement.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('⚠️ Montant invalide', 'Veuillez saisir un montant positif.');
      return;
    }
    if (numAmount > sourceAccount.balance) {
      Alert.alert(
        '❌ Solde insuffisant',
        `Votre solde est de ${sourceAccount.balance.toLocaleString('fr-FR')} MAD.\nVirement rejeté.`
      );
      return;
    }

    const destAccount = accounts.find(a => a.id === selectedToId);

    Alert.alert(
      '↗ Confirmer le virement',
      `De : ${sourceAccount.label}\nVers : ${destAccount.label}\nMontant : ${numAmount.toLocaleString('fr-FR')} MAD\nLibellé : "${label}"`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: () => {
            onTransfer(fromAccountId, selectedToId, numAmount, label);
            Alert.alert(
              '✅ Virement effectué',
              `${numAmount.toLocaleString('fr-FR')} MAD transférés vers ${destAccount.label}.`,
              [{ text: 'OK', onPress: () => navigation.goBack() }]
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ─── Compte source ─────────────────────────────────────────────────── */}
        <View style={[styles.sourceCard, {
          backgroundColor: colors.isDark ? colors.card : colors.primary,
        }]}>
          <Text style={[styles.cardLabel, { color: colors.bannerMuted }]}>COMPTE SOURCE</Text>
          <Text style={[styles.cardName, { color: colors.bannerText }]}>
            {sourceAccount.label}
          </Text>
          <Text style={[styles.cardBalance, { color: colors.bannerSubtext }]}>
            Solde : {sourceAccount.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
          </Text>
        </View>

        {/* ─── Séparateur visuel ──────────────────────────────────────────────── */}
        <View style={styles.arrowContainer}>
          <View style={[styles.arrowLine, { backgroundColor: colors.border }]} />
          <View style={[styles.arrowCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.arrowIcon}>↓</Text>
          </View>
          <View style={[styles.arrowLine, { backgroundColor: colors.border }]} />
        </View>

        {/* ─── Sélection destinataire ────────────────────────────────────────── */}
        <Text style={[styles.fieldLabel, { color: colors.textLight }]}>COMPTE DESTINATAIRE</Text>
        {otherAccounts.map(acc => (
          <TouchableOpacity
            key={acc.id}
            style={[styles.destCard, {
              backgroundColor: selectedToId === acc.id
                ? (colors.isDark ? colors.primaryDark + '50' : colors.primary + '10')
                : colors.card,
              borderColor: selectedToId === acc.id ? colors.primary : colors.border,
            }]}
            onPress={() => setSelectedToId(acc.id)}
            activeOpacity={0.7}
          >
            <View style={styles.destInfo}>
              <Text style={[styles.destName, {
                color: selectedToId === acc.id ? colors.primary : colors.text,
              }]}>
                {acc.label}
              </Text>
              <Text style={[styles.destBalance, { color: colors.textMuted }]}>
                {acc.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} MAD
              </Text>
            </View>
            <View style={[styles.radio, {
              borderColor: selectedToId === acc.id ? colors.primary : colors.border,
            }]}>
              {selectedToId === acc.id && (
                <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* ─── Libellé ───────────────────────────────────────────────────────── */}
        <Text style={[styles.fieldLabel, { color: colors.textLight, marginTop: 16 }]}>LIBELLÉ</Text>
        <TextInput
          style={[styles.input, {
            borderColor: colors.border,
            backgroundColor: colors.inputBg,
            color: colors.text,
          }]}
          placeholder="Remboursement, Épargne, etc."
          value={label}
          onChangeText={setLabel}
          placeholderTextColor={colors.textMuted}
        />

        {/* ─── Montant ───────────────────────────────────────────────────────── */}
        <Text style={[styles.fieldLabel, { color: colors.textLight }]}>MONTANT (MAD)</Text>
        <TextInput
          style={[styles.input, {
            borderColor: colors.border,
            backgroundColor: colors.inputBg,
            color: colors.text,
          }]}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textMuted}
        />

        {/* ─── Récapitulatif ─────────────────────────────────────────────────── */}
        {selectedToId && amount && parseFloat(amount) > 0 && (
          <View style={[styles.summary, {
            backgroundColor: colors.isDark ? colors.cardElevated : colors.primary + '08',
            borderColor: colors.border,
          }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>📋 Récapitulatif</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textLight }]}>De</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{sourceAccount.label}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textLight }]}>Vers</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {accounts.find(a => a.id === selectedToId)?.label}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textLight }]}>Montant</Text>
              <Text style={[styles.summaryValueBold, { color: colors.primary }]}>
                {parseFloat(amount).toLocaleString('fr-FR')} MAD
              </Text>
            </View>
          </View>
        )}

        {/* ─── Boutons ───────────────────────────────────────────────────────── */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textLight }]}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleValidate}
          >
            <Text style={styles.submitBtnText}>↗ Valider</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  // ─── Source card ──────────────────────────────────────────────────────────
  sourceCard: {
    borderRadius: 14,
    padding:      18,
  },
  cardLabel: {
    fontSize:      10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom:  4,
  },
  cardName: {
    fontSize:   18,
    fontWeight: '700',
  },
  cardBalance: {
    fontSize: 13,
    marginTop: 4,
  },
  // ─── Arrow separator ─────────────────────────────────────────────────────
  arrowContainer: {
    flexDirection: 'row',
    alignItems:    'center',
    marginVertical: 12,
  },
  arrowLine: {
    flex:   1,
    height: 1,
  },
  arrowCircle: {
    width:          36,
    height:         36,
    borderRadius:   18,
    justifyContent: 'center',
    alignItems:     'center',
    marginHorizontal: 12,
  },
  arrowIcon: {
    color:    '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  // ─── Fields ───────────────────────────────────────────────────────────────
  fieldLabel: {
    fontSize:      11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight:    '600',
    marginBottom:  8,
  },
  destCard: {
    flexDirection: 'row',
    alignItems:    'center',
    borderRadius:  12,
    padding:       16,
    marginBottom:  8,
    borderWidth:   2,
  },
  destInfo: { flex: 1 },
  destName: {
    fontSize:   15,
    fontWeight: '600',
  },
  destBalance: {
    fontSize: 12,
    marginTop: 2,
  },
  radio: {
    width:        22,
    height:       22,
    borderRadius: 11,
    borderWidth:  2,
    justifyContent: 'center',
    alignItems:     'center',
  },
  radioDot: {
    width:      12,
    height:     12,
    borderRadius: 6,
  },
  input: {
    borderWidth:       1,
    borderRadius:      12,
    paddingHorizontal: 14,
    paddingVertical:   13,
    fontSize:          14,
    marginBottom:      12,
  },
  // ─── Summary ──────────────────────────────────────────────────────────────
  summary: {
    borderRadius: 12,
    padding:      16,
    marginBottom: 16,
    borderWidth:  1,
  },
  summaryTitle: {
    fontSize:     14,
    fontWeight:   '700',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize:   13,
    fontWeight: '600',
  },
  summaryValueBold: {
    fontSize:   15,
    fontWeight: '800',
  },
  // ─── Buttons ──────────────────────────────────────────────────────────────
  btnRow: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     4,
  },
  cancelBtn: {
    flex:           1,
    borderRadius:   12,
    paddingVertical: 14,
    alignItems:     'center',
    borderWidth:    1,
  },
  cancelBtnText: {
    fontWeight: '600',
    fontSize:   14,
  },
  submitBtn: {
    flex:           2,
    borderRadius:   12,
    paddingVertical: 14,
    alignItems:     'center',
  },
  submitBtnText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   16,
  },
});
