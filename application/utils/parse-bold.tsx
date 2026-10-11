import React from 'react';
import { Text } from 'react-native';

/**
 * Parses a string for *bold* markers and returns an array of
 * React Native <Text> elements with bold spans styled accordingly.
 *
 * Usage: <Text>{parseBoldText("Hello *world*!")}</Text>
 */
export function parseBoldText(text: string): (string | React.ReactElement)[] {
  // Split on *...* patterns (non-greedy, no nested asterisks)
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const boldContent = part.slice(1, -1);
      return (
        <Text key={idx} style={{ fontWeight: 'bold' }}>
          {boldContent}
        </Text>
      );
    }
    return part;
  });
}
