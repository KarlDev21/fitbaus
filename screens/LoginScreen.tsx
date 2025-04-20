'use client';

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, ActivityIndicator, IconButton, Checkbox, Button, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function LoginScreen() {


  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.inverterCard}>
        <Card.Content style={styles.inverterContent}>
          <IconButton icon="solar-panel" size={24} style={styles.smallIconContainer} />
          <Text variant="titleMedium" style={styles.inverterLabel}>
            Place holder Login Screen
          </Text>
        </Card.Content>
      </Card>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inverterCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 1,
  },
  inverterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  inverterLabel: {
    color: '#666',
    fontWeight: '500',
  },
  smallIconContainer: {
    padding: 8,
    borderRadius: 50,
    marginRight: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for button at bottom
  },
  batteryCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  authenticatedCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  failedCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  batteryContent: {
    padding: 8,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 10,
    borderRadius: 50,
    marginRight: 12,
  },
  batteryInfo: {
    flex: 1,
  },
  batteryName: {
    fontWeight: '500',
  },
  batteryLevel: {
    color: '#666',
  },
  statusIcon: {
    marginRight: 8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  outlineButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
  },
});

