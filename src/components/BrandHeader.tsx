export function BrandHeader() {
  return (
    <div className="text-center mb-8">
      <div className="mb-4">
        <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary-foreground">B</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Bouton
        </h1>
        <p className="text-sm font-medium text-muted-foreground mb-2">
          Roupas de Cama Premium
        </p>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Scanner de Listas
      </h2>
      <p className="text-muted-foreground">
        Escaneie ou importe sua lista para começar
      </p>
    </div>
  );
}