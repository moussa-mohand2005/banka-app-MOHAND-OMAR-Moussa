import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StatusBar } from 'react-native';

import { initialAccounts } from './src/data/accounts';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

import DashboardScreen     from './src/screens/DashboardScreen';
import AccountDetailScreen from './src/screens/AccountDetailScreen';
import TransferScreen      from './src/screens/TransferScreen';
import HistoryScreen       from './src/screens/HistoryScreen';
import { TouchableOpacity, View } from 'react-native';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Composant de basculement de thème pour le Header ──────────────────────
function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{
        marginRight:     15,
        width:           36,
        height:          36,
        borderRadius:    18,
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        justifyContent:  'center',
        alignItems:      'center',
      }}
    >
      <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
    </TouchableOpacity>
  );
}

// Stack imbriqué dans l'onglet "Comptes"
function AccountsStack({ accounts, onDebit, onCredit, onTransfer, onReset }) {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: colors.isDark ? colors.card : colors.primary },
        headerTintColor:  colors.bannerText,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        headerRight:      () => <ThemeToggle />, // ← Ajout ici
      }}
    >
      <Stack.Screen name="Dashboard" options={{ title: 'BankaApp' }}>
        {(props) => (
          <DashboardScreen {...props} accounts={accounts} onReset={onReset} />
        )}
      </Stack.Screen>

      <Stack.Screen name="AccountDetail" options={{ title: 'Détail du Compte' }}>
        {(props) => (
          <AccountDetailScreen
            {...props}
            accounts={accounts}
            onDebit={onDebit}
            onCredit={onCredit}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Transfer" options={{ title: 'Virement' }}>
        {(props) => (
          <TransferScreen
            {...props}
            accounts={accounts}
            onTransfer={onTransfer}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Composant interne qui utilise le thème
function AppContent() {
  const { colors, isDark } = useTheme();

  // ─── État global des comptes ──────────────────────────────────────────────
  const [accounts, setAccounts] = useState(initialAccounts);

  // ─── Tâche 1 (CORRIGÉ) : Opération Débit ─────────────────────────────────
  // Bug corrigé : au lieu de retourner null et utiliser .filter(Boolean)
  // qui supprimait le compte, on retourne le compte inchangé (acc)
  // quand le solde est insuffisant.
  const handleDebit = (accountId, amount, label) => {
    let success = true;

    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id !== accountId) return acc;

        // Règle métier : rejet si solde insuffisant
        if (acc.balance < amount) {
          success = false;
          return acc; // ← Correction : retourner le compte inchangé
        }

        const newTransaction = {
          id:     'T' + Date.now(),
          type:   'debit',
          amount,
          label,
          date:   new Date().toLocaleDateString('fr-FR'),
        };
        return {
          ...acc,
          balance:      acc.balance - amount,
          transactions: [newTransaction, ...acc.transactions],
        };
      })
      // .filter(Boolean) supprimé — c'était le bug
    );

    return success;
  };

  // ─── Opération : Crédit ───────────────────────────────────────────────────
  const handleCredit = (accountId, amount, label) => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id !== accountId) return acc;
        const newTransaction = {
          id:     'T' + Date.now(),
          type:   'credit',
          amount,
          label,
          date:   new Date().toLocaleDateString('fr-FR'),
        };
        return {
          ...acc,
          balance:      acc.balance + amount,
          transactions: [newTransaction, ...acc.transactions],
        };
      })
    );
  };

  // ─── Tâche 2 : Opération Virement ────────────────────────────────────────
  const handleTransfer = (fromId, toId, amount, label) => {
    setAccounts(prev => {
      const sourceAccount = prev.find(a => a.id === fromId);

      // Vérification solde insuffisant
      if (!sourceAccount || sourceAccount.balance < amount) {
        return prev;
      }

      const now       = new Date().toLocaleDateString('fr-FR');
      const timestamp = Date.now();

      return prev.map(acc => {
        // Compte source : débiter + transaction virement_sortant
        if (acc.id === fromId) {
          const txSortant = {
            id:     'T' + timestamp + '_out',
            type:   'virement_sortant',
            amount,
            label:  label || 'Virement vers ' + prev.find(a => a.id === toId)?.label,
            date:   now,
          };
          return {
            ...acc,
            balance:      acc.balance - amount,
            transactions: [txSortant, ...acc.transactions],
          };
        }

        // Compte destinataire : créditer + transaction virement_entrant
        if (acc.id === toId) {
          const txEntrant = {
            id:     'T' + timestamp + '_in',
            type:   'virement_entrant',
            amount,
            label:  label || 'Virement de ' + prev.find(a => a.id === fromId)?.label,
            date:   now,
          };
          return {
            ...acc,
            balance:      acc.balance + amount,
            transactions: [txEntrant, ...acc.transactions],
          };
        }

        return acc;
      });
    });
  };

  // ─── Tâche 5 (Bonus) : Réinitialisation ──────────────────────────────────
  const handleReset = () => {
    setAccounts(initialAccounts);
  };

  // ─── Navigation theme ─────────────────────────────────────────────────────
  // Correction pour React Navigation 7 : inclure les 'fonts'
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary:      colors.primary,
      background:   colors.background,
      card:         colors.tabBar,
      text:         colors.text,
      border:       colors.border,
      notification: colors.accent,
    },
  };


  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? colors.card : colors.primary}
      />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor:   colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              backgroundColor: colors.tabBar,
              borderTopColor:  colors.tabBarBorder,
              height:          62,
              paddingBottom:   8,
              paddingTop:      4,
            },
            tabBarLabelStyle: {
              fontSize:      11,
              fontWeight:    '600',
              letterSpacing: 0.3,
            },
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="AccountsTab"
            options={{
              tabBarLabel: 'Comptes',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>🏦</Text>,
            }}
          >
            {() => (
              <AccountsStack
                accounts={accounts}
                onDebit={handleDebit}
                onCredit={handleCredit}
                onTransfer={handleTransfer}
                onReset={handleReset}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="HistoryTab"
            options={{
              tabBarLabel: 'Historique',
              tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📋</Text>,
              headerShown: true,
              headerStyle: {
                backgroundColor: isDark ? colors.card : colors.primary,
              },
              headerTintColor:  colors.bannerText,
              headerTitleStyle: { fontWeight: '700' },
              headerShadowVisible: false,
              headerRight: () => <ThemeToggle />,
              title: 'Historique',
            }}
          >
            {() => <HistoryScreen accounts={accounts} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

// ─── Root : ThemeProvider enveloppe toute l'app ─────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
