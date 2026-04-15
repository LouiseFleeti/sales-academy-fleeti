export default function LoadingSpinner({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div
        className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-fleeti-blue animate-spin"
        style={{ borderTopColor: "#0ca2c2" }}
      />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
