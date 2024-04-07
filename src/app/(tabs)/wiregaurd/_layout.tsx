import { Stack } from 'expo-router';
import React from 'react';
import { VirshVmProvider } from '../../../contexts/virtual-machines';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function WireGuardLayout() {
  return <WireGuardLayoutNav />;
}

function WireGuardLayoutNav() {
  return <></>;
}
