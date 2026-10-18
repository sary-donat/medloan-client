import { useEffect, useState } from 'react';
import { api, errorMessage } from './client';

// A PagedResult list with "load more", as in ItemsPage. A change in params starts again from page 1.
export function usePagedList(url, params) {
  const key = JSON.stringify(params);
  const [query, setQuery] = useState({ key, page: 1 });
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Adjusting state while rendering, so the reset happens before the request and not in an effect.
  if (query.key !== key) {
    setQuery({ key, page: 1 });
    setLoading(true);
    setError('');
  }

  useEffect(() => {
    let cancelled = false;
    api
      .get(url, { params: { ...JSON.parse(query.key), page: query.page } })
      .then(({ data }) => {
        if (cancelled) return;
        setItems((prev) => (query.page === 1 ? data.items : [...prev, ...data.items]));
        setTotalPages(data.totalPages);
      })
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [url, query]);

  function loadMore() {
    setLoading(true);
    setError('');
    setQuery((q) => ({ ...q, page: q.page + 1 }));
  }

  return { items, setItems, loading, error, setError, hasMore: query.page < totalPages, loadMore };
}
