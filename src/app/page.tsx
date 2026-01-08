export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>{{projectName}}</h1>
      <p>{{description}}</p>
      <p style={{ marginTop: '2rem', color: '#666' }}>
        TODO: Implement application features
      </p>
    </main>
  );
}
