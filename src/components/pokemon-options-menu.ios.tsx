import { Button, Host, Menu, RNHostView } from '@expo/ui/swift-ui';

import type { PokemonOption } from '@/hooks/use-pokemon-options';

import { MoreIcon } from './more-icon';

/** iOS: the native SwiftUI menu, opened by a tap on ⋮, with an SF Symbol per option (as in Figma). */
export function PokemonOptionsMenu({ name, options }: { name: string; options: PokemonOption[] }) {
  return (
    <Host matchContents>
      <Menu
        label={
          <RNHostView matchContents>
            <MoreIcon name={name} />
          </RNHostView>
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
