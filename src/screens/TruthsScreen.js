import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-deck-swiper';
import * as Haptics from 'expo-haptics';
import colors from '../styles/colors';
import truthReminders from '../data/truthReminders';
import { saveTruth } from '../utils/storage';

const { width } = Dimensions.get('window');

const TruthsScreen = () => {
  const [cards, setCards] = useState([...truthReminders].sort(() => Math.random() - 0.5));
  const [cardIndex, setCardIndex] = useState(0);
  const swiperRef = useRef(null);

  const onSwipedRight = async (index) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveTruth(cards[index]);
  };

  const onSwipedLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onSwipedAll = () => {
    // Reshuffle cards
    setCards([...truthReminders].sort(() => Math.random() - 0.5));
    setCardIndex(0);
  };

  const handleShare = async () => {
    try {
      const currentCard = cards[cardIndex];
      await Share.share({
        message: `"${currentCard.text}" - NoContact App`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveTruth(cards[cardIndex]);
    swiperRef.current?.swipeRight();
  };

  const renderCard = (card) => {
    if (!card) return null;
    return (
      <View style={styles.card}>
        <Text style={styles.cardText}>{card.text}</Text>
        <Text style={styles.cardCategory}>{card.category}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Daily Truths</Text>
      <Text style={styles.subtitle}>
        Swipe right to save, left to skip
      </Text>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={cards}
          renderCard={renderCard}
          onSwipedRight={onSwipedRight}
          onSwipedLeft={onSwipedLeft}
          onSwipedAll={onSwipedAll}
          cardIndex={cardIndex}
          backgroundColor="transparent"
          stackSize={3}
          stackScale={5}
          stackSeparation={14}
          animateOverlayLabelsOpacity
          animateCardOpacity
          infinite
          overlayLabels={{
            left: {
              title: 'SKIP',
              style: {
                label: {
                  backgroundColor: colors.error,
                  color: colors.text,
                  fontSize: 16,
                  borderRadius: 8,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: -20,
                },
              },
            },
            right: {
              title: 'SAVE',
              style: {
                label: {
                  backgroundColor: colors.success,
                  color: colors.text,
                  fontSize: 16,
                  borderRadius: 8,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: 20,
                },
              },
            },
          }}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  swiperContainer: {
    flex: 1,
    marginTop: -20,
  },
  card: {
    height: 300,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  cardText: {
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: '500',
  },
  cardCategory: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 30,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.error,
  },
  skipText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  shareText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  saveText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TruthsScreen;
