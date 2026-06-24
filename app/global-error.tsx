"use client";

// Catches errors in the root layout itself, so it must render its own
// <html>/<body>. globals.css isn't available here — use inline styles.
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#15110D",
          color: "#F5EEE6",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 1rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: 8, color: "#A89A88", fontSize: "0.875rem" }}>
          Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 20,
            padding: "0.625rem 1rem",
            borderRadius: 12,
            border: "none",
            background: "#EA6A1F",
            color: "#15110D",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
