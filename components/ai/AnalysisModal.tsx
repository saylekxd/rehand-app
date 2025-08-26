import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleCheck as CheckIcon, AlertCircle as AlertIcon } from 'lucide-react-native';
import { AnalysisResult } from './types';

interface AnalysisModalProps {
  visible: boolean;
  result: AnalysisResult | null;
  onClose: () => void;
}

export default function AnalysisModal({ visible, result, onClose }: AnalysisModalProps) {
  const scoreColor = result ? getScoreColor(result.score) : '#6B7280';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Wyniki analizy</Text>
          </View>

          {result && (
            <>
              <View style={styles.scoreWrap}>
                <Text style={styles.scoreLabel}>Wynik</Text>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>{result.score}%</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <CheckIcon size={18} color="#10B981" />
                  <Text style={styles.sectionTitle}>Ocena</Text>
                </View>
                <Text style={styles.sectionText}>{result.feedback}</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <AlertIcon size={18} color="#F59E0B" />
                  <Text style={styles.sectionTitle}>Sugestie</Text>
                </View>
                {result.suggestions.map((s, i) => (
                  <Text key={i} style={styles.listItem}>• {s}</Text>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Zamknij">
            <Text style={styles.closeText}>Zamknij</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  scoreWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  scoreLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  sectionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 2,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});


