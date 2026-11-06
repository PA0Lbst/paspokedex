// Reanimated 4 runs on native worklets, and its own mock fails under Jest here. This small mock
// covers what the app uses: animations jump to their end value, Animated.View is a View.
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  const sharedValue = (initial) => {
    let value = initial;
    return { get: () => value, set: (next) => (value = next), value };
  };
  const layoutAnimation = { duration: () => layoutAnimation, delay: () => layoutAnimation };
  const Animated = { View, createAnimatedComponent: (component) => component };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    Easing: { out: (f) => f, cubic: (t) => t, linear: (t) => t },
    useSharedValue: sharedValue,
    useAnimatedStyle: (factory) => factory(),
    withTiming: (to) => to,
    withSpring: (to) => to,
    withSequence: (...steps) => steps[steps.length - 1],
    FadeIn: layoutAnimation,
    FadeInDown: layoutAnimation,
    ReduceMotion: { System: 'system' },
  };
});
