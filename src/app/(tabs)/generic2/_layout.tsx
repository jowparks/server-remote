import React from 'react';
import { GenericLayoutNav } from '../generic/_layout';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function GenericLayout() {
  return <GenericLayoutNav />;
}
