import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Share,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Swiper from 'react-native-deck-swiper';
import * as Haptics from 'expo-haptics';
import colors from '../styles/colors';
import truthReminders from '../data/truthReminders';
import { saveTruth } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const TruthsScreen = () => {
  const [cards, setCards] = useState([...truthReminders].sort(() => Math.random() - 0.5));
  const [cardIndex, setCardIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const swiperRef = useRef(null);
  const saveAnimation = useRef(new Animated.Value(0)).current;

  const onSwiped = (index) => {
    setCardIndex(index + 1);
  };

  const onSwipedRight = async (index) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveTruth(cards[index]);
    setSavedCount((prev) => prev + 1);

    // Animate save indicator
    Animated.sequence([
      Animated.timing(saveAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(saveAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onSwipedLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onSwipedAll = () => {
    setCards([...truthReminders].sort(() => Math.random() - 0.5));
    setCardIndex(0);
  };

  const handleShare = async () => {
    try {
      const currentCard = cards[cardIndex % cards.length];
      if (currentCard) {
        await Share.share({
          message: `"${currentCard.text}"\n\n— NoContact App`,
        });
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleSave = async () => {
    const currentCard = cards[cardIndex % cards.length];
    if (currentCard) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await saveTruth(currentCard);
      setSavedCount((prev) => prev + 1);
      swiperRef.current?.swipeRight();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    swiperRef.current?.swipeLeft();
  };

  const renderCard = (card) => {
    if (!card) return null;
    return (
      <View style={styles.card}>
        <LinearGradient
          colors={[colors.surface, colors.surfaceLight]}
          style={styles.cardGradient}
        >
          <Text style={styles.quoteIcon}>"</Text>
          <Text style={styles.cardText}>{card.text}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.cardCategory}>{card.category}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary + '20', colors.background]}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Truths</Text>
          <Text style={styles.subtitle}>
            Swipe right to save  •  left to skip
          </Text>
          {savedCount > 0 && (
            <Animated.View
              style={[
                styles.savedBadge,
                {
                  transform: [
                    {
                      scale: saveAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.savedBadgeText}>💜 {savedCount} saved</Text>
            </Animated.View>
          )}
        </View>

        {/* Swiper */}
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={cards}
            renderCard={renderCard}
            onSwiped={onSwiped}
            onSwipedRight={onSwipedRight}
            onSwipedLeft={onSwipedLeft}
            onSwipedAll={onSwipedAll}
            cardIndex={0}
            backgroundColor="transparent"
            stackSize={3}
            stackScale={8}
            stackSeparation={12}
            animateOverlayLabelsOpacity
            animateCardOpacity
            disableTopSwipe
            disableBottomSwipe
            infinite
            cardVerticalMargin={40}
            cardHorizontalMargin={20}
            overlayLabels={{
              left: {
                title: 'SKIP',
                style: {
                  label: {
                    backgroundColor: colors.error,
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: 'bold',
                    borderRadius: 12,
                    padding: 12,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: -30,
                  },
                },
              },
              right: {
                title: '💜 SAVE',
                style: {
                  label: {
                    backgroundColor: colors.success,
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: 'bold',
                    borderRadius: 12,
                    padding: 12,
                  },
                  wrapper: {
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 30,
                    marginLeft: 30,
                  },
                },
              },
            }}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <View style={[styles.buttonInner, styles.skipButtonInner]}>
              <Text style={styles.buttonEmoji}>✕</Text>
            </View>
            <Text style={styles.buttonLabel}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButtonContainer}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <View style={[styles.buttonInner, styles.shareButtonInner]}>
              <Text style={styles.buttonEmoji}>↗</Text>
            </View>
            <Text style={styles.buttonLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <View style={[styles.buttonInner, styles.saveButtonInner]}>
              <Text style={styles.buttonEmoji}>💜</Text>
            </View>
            <Text style={styles.buttonLabel}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  savedBadge: {
    backgroundColor: colors.primary + '30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  savedBadgeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  swiperContainer: {
    flex: 1,
  },
  card: {
    height: height * 0.45,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteIcon: {
    fontSize: 60,
    color: colors.primary,
    opacity: 0.3,
    position: 'absolute',
    top: 20,
    left: 25,
  },
  cardText: {
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 24,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cardCategory: {
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 40,
    paddingBottom: 20,
    gap: 30,
  },
  actionButton: {
    alignItems: 'center',
  },
  shareButtonContainer: {
    alignItems: 'center',
  },
  buttonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  skipButtonInner: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
  },
  shareButtonInner: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  saveButtonInner: {
    backgroundColor: colors.surface,
    borderColor: colors.success,
  },
  buttonEmoji: {
    fontSize: 24,
  },
  buttonLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});

export default TruthsScreen;
