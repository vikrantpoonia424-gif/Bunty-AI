import { Asset } from 'expo-asset';

const cache = new Map<number, string>();

export async function loadAssetText(moduleId: number): Promise<string> {
  if (cache.has(moduleId)) return cache.get(moduleId)!;
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const response = await fetch(uri);
  const text = await response.text();
  cache.set(moduleId, text);
  return text;
}
