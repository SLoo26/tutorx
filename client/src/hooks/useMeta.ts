import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Meta } from '../api/types';

let cache: Meta | null = null;

/** Fetch the shared dropdown metadata once and cache it for the session. */
export function useMeta(): Meta | null {
  const [meta, setMeta] = useState<Meta | null>(cache);
  useEffect(() => {
    if (cache) return;
    api
      .get<Meta>('/meta')
      .then((m) => {
        cache = m;
        setMeta(m);
      })
      .catch(() => undefined);
  }, []);
  return meta;
}
