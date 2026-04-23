// Simplified toast hook using browser notifications
export function useToast() {
  const toast = ({ title, description }: { title: string; description?: string }) => {
    // Simple console log as fallback - can be enhanced with a toast library
    console.log(`[Toast] ${title}${description ? `: ${description}` : ""}`);
    // Use a simple DOM-based toast if available
    if (typeof window !== "undefined") {
      const event = new CustomEvent("louvamais-toast", { detail: { title, description } });
      window.dispatchEvent(event);
    }
  };
  return { toast };
}
