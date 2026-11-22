'use client';
import { useEffect, useState } from 'react';

/** Hidden field that sends the visitor's time zone with the sign-up form. */
export default function TimezoneInput() {
  const [tz, setTz] = useState('UTC');
  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    } catch {}
  }, []);
  return <input type="hidden" name="timezone" value={tz} />;
}
