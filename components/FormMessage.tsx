export default function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) return <p className="notice error" role="alert">{error}</p>;
  if (message) return <p className="notice ok" role="status">{message}</p>;
  return null;
}
