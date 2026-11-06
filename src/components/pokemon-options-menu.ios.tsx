import { Button, Host, Image, Menu } from '@expo/ui/swift-ui';
import { accessibilityLabel, contentShape, frame, rotationEffect, shapes } from '@expo/ui/swift-ui/modifiers';

import type { PokemonOption } from '@/hooks/use-pokemon-options';
import { colors } from '@/theme';

import { MENU_SIZE } from './menu-size';

/**
 * iOS: the native SwiftUI menu, opened by a tap on ⋮, with an SF Symbol per option (as in Figma).
 * The ⋮ is a SwiftUI image, not a React Native view: SwiftUI doesn't get taps on hosted RN views.
 */
export function PokemonOptionsMenu({ name, options }: { name: string; options: PokemonOption[] }) {
  return (
    // A fixed size (not matchContents): a 0×0 host draws the ⋮ but loses the taps.
    <Host style={{ width: MENU_SIZE, height: MENU_SIZE }}>
      <Menu
        label={
          <Image
            systemName="ellipsis"
            size={18}
            color={colors.midnight}
            modifiers={[
              rotationEffect(90),
              frame({ width: MENU_SIZE, height: MENU_SIZE }),
              contentShape(shapes.rectangle()),
              accessibilityLabel(`Options for ${name}`),
            ]}
          />
        }>
        {options.map((option) => (
          <Button
            key={option.key}
            label={option.label}
            systemImage={option.systemImage}
            role={option.destructive ? 'destructive' : undefined}
            onPress={option.run}
          />
        ))}
      </Menu>
    </Host>
  );
}
