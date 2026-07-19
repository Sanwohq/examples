import Checkout from "./checkout";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h1 style={{ fontSize: 24, marginTop: 0 }}>Sanwo Checkout</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Choose a payment provider and pay via the Sanwo SDK
        </p>
        <Checkout />
      </div>
    </main>
  );
}
