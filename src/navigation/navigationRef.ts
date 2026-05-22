import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { RootStackParamList } from './index';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(screen: keyof RootStackParamList, params?: any): string {
  if (!navigationRef.isReady()) return `SKIP: not ready`;
  try {
    navigationRef.dispatch(StackActions.push(screen as string, params));
    return `push OK: ${screen}`;
  } catch (e: any) {
    return `ERROR: ${e?.message ?? e}`;
  }
}
